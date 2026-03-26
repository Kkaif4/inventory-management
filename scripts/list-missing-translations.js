#!/usr/bin/env node

/**
 * List missing translation keys in message JSON files
 * Outputs a clean list suitable for manual AI-assisted translation
 *
 * Usage:
 *   node scripts/list-missing-translations.js [--json] [--csv]
 *
 * Options:
 *   --json    Output as JSON format (for programmatic processing)
 *   --csv     Output as CSV format
 *   (default) Human-readable format
 */

const fs = require('fs');
const path = require('path');

const LOCALES = ['en', 'hi', 'mr'];
const MESSAGES_DIR = path.join(__dirname, '../src/messages');
const SRC_DIR = path.join(__dirname, '../src');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  error: (msg) => console.error(`${colors.red}${colors.bold}✗ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}${colors.bold}✓ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}`),
};

function getMessageFiles() {
  const files = {};
  for (const locale of LOCALES) {
    const localeDir = path.join(MESSAGES_DIR, locale);
    if (!fs.existsSync(localeDir)) continue;
    files[locale] = {};
    const moduleFiles = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));
    for (const file of moduleFiles) {
      const moduleName = path.basename(file, '.json');
      const filePath = path.join(localeDir, file);
      try {
        files[locale][moduleName] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (e) {
        log.error(`Failed to parse ${locale}/${file}: ${e.message}`);
      }
    }
  }
  return files;
}

function extractKeysFromString(content) {
  const keys = [];
  const keyPattern = /\b(?:t|[a-z]+(?:Table|[a-z]*Translations|translation))\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/gi;
  let match;

  while ((match = keyPattern.exec(content)) !== null) {
    const keyPath = match[1];
    if (keyPath.includes('/dashboard') || keyPath.includes('http') || keyPath.includes('Unauthorized') || keyPath.includes('$') || keyPath.match(/^ \/ $/)) {
      continue;
    }
    keys.push(keyPath);
  }
  return [...new Set(keys)];
}

function extractKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const namespacePattern = /useTranslations\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
  const namespaces = [];
  let match;

  while ((match = namespacePattern.exec(content)) !== null) {
    namespaces.push(match[1]);
  }

  const allKeys = extractKeysFromString(content);
  return { namespaces: [...new Set(namespaces)], keys: allKeys };
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((curr, key) => curr?.[key], obj);
}

function scanSourceFiles() {
  const results = { byNamespace: {} };

  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (file.startsWith('.') || file === 'node_modules' || file === '.next' || file === 'generated' || fullPath.includes('node_modules')) {
        continue;
      }

      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          const { namespaces, keys } = extractKeysFromFile(fullPath);
          for (const ns of namespaces) {
            if (!results.byNamespace[ns]) {
              results.byNamespace[ns] = {};
            }
            for (const key of keys) {
              if (!results.byNamespace[ns][key]) {
                results.byNamespace[ns][key] = [];
              }
              results.byNamespace[ns][key].push(fullPath);
            }
          }
        } catch (e) {
          // Skip
        }
      }
    }
  }

  walkDir(SRC_DIR);
  return results;
}

function findMissingKeys(sourceUsage, messageFiles) {
  const missing = {};

  for (const locale of LOCALES) {
    if (!messageFiles[locale]) continue;
    missing[locale] = {};

    for (const namespace in sourceUsage.byNamespace) {
      const keys = sourceUsage.byNamespace[namespace];
      const [mainNamespace, ...subNamespaces] = namespace.split('.');
      const messages = messageFiles[locale][mainNamespace];

      if (!messages) {
        continue;
      }

      missing[locale][namespace] = {};

      for (const keyPath in keys) {
        let value = messages;
        for (const sub of subNamespaces) {
          value = value?.[sub];
        }

        if (getNestedValue(value, keyPath) === undefined) {
          missing[locale][namespace][keyPath] = keys[keyPath];
        }
      }
    }
  }

  return missing;
}

function outputJson(missing) {
  const result = {};
  for (const locale of LOCALES) {
    result[locale] = {};
    for (const ns in missing[locale]) {
      const keys = Object.keys(missing[locale][ns]);
      if (keys.length > 0) {
        result[locale][ns] = keys;
      }
    }
  }
  console.log(JSON.stringify(result, null, 2));
}

function outputCsv(missing) {
  console.log('locale,namespace,key,files');
  for (const locale of LOCALES) {
    for (const ns in missing[locale]) {
      for (const keyPath in missing[locale][ns]) {
        const files = missing[locale][ns][keyPath];
        const fileStr = files.map(f => path.relative(SRC_DIR, f)).join(';');
        console.log(`${locale},"${ns}","${keyPath}","${fileStr}"`);
      }
    }
  }
}

function outputReadable(missing) {
  let totalMissing = 0;

  for (const locale of LOCALES) {
    let localeMissing = 0;
    const localeData = {};

    for (const ns in missing[locale]) {
      const keys = missing[locale][ns];
      const count = Object.keys(keys).length;
      if (count > 0) {
        localeData[ns] = Object.keys(keys);
        localeMissing += count;
        totalMissing += count;
      }
    }

    if (localeMissing > 0) {
      log.section(`${locale.toUpperCase()}: ${localeMissing} missing key(s)`);
      for (const ns in localeData) {
        console.log(`\n  ${colors.cyan}${ns}:${colors.reset}`);
        for (const key of localeData[ns]) {
          console.log(`    - ${key}`);
        }
      }
    }
  }

  log.section(`Summary: ${totalMissing} total missing keys across all locales`);
}

function main() {
  const args = process.argv.slice(2);
  const format = args[0] || 'readable';

  log.section('📋 Scanning for missing translation keys...');

  const messageFiles = getMessageFiles();
  log.success(`Found message files for locales: ${LOCALES.join(', ')}`);

  const sourceUsage = scanSourceFiles();
  const namespaceCount = Object.keys(sourceUsage.byNamespace).length;
  const totalKeys = Object.values(sourceUsage.byNamespace).reduce((sum, keys) => sum + Object.keys(keys).length, 0);
  log.success(`Found ${namespaceCount} namespaces with ${totalKeys} unique keys`);

  const missing = findMissingKeys(sourceUsage, messageFiles);

  if (format === '--json') {
    outputJson(missing);
  } else if (format === '--csv') {
    outputCsv(missing);
  } else {
    outputReadable(missing);
  }
}

main();
