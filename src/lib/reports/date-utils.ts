import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  subMonths,
  addMonths,
  startOfYear,
  endOfYear,
  subDays,
} from 'date-fns';
import type { DatePreset, DateRange } from '@/types/reports/common';

/**
 * Get date range for a given preset
 */
export function getDateRangeForPreset(preset: DatePreset): DateRange {
  const today = new Date();

  switch (preset) {
    case 'today':
      return {
        from: startOfDay(today),
        to: endOfDay(today),
      };

    case 'week':
      return {
        from: startOfWeek(today, { weekStartsOn: 1 }), // Monday
        to: endOfWeek(today, { weekStartsOn: 1 }), // Sunday
      };

    case 'month':
      return {
        from: startOfMonth(today),
        to: endOfMonth(today),
      };

    case 'lastMonth':
      const lastMonth = subMonths(today, 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };

    case 'quarter':
      return {
        from: startOfQuarter(today),
        to: endOfQuarter(today),
      };

    case 'fy': {
      // Financial year: April to March (Indian standard)
      const fyStart = today.getMonth() >= 3 ? // April or later
        new Date(today.getFullYear(), 3, 1) : // Current FY
        new Date(today.getFullYear() - 1, 3, 1); // Previous FY

      const fyEnd = new Date(fyStart.getFullYear() + 1, 2, 31);

      return {
        from: startOfDay(fyStart),
        to: endOfDay(fyEnd),
      };
    }

    case 'lastFy': {
      const now = new Date();
      const lastFyStart = new Date(
        now.getMonth() >= 3
          ? now.getFullYear() - 1
          : now.getFullYear() - 2,
        3,
        1
      );
      const lastFyEnd = new Date(lastFyStart.getFullYear() + 1, 2, 31);

      return {
        from: startOfDay(lastFyStart),
        to: endOfDay(lastFyEnd),
      };
    }

    case 'custom':
    default:
      return {
        from: startOfDay(today),
        to: endOfDay(today),
      };
  }
}

/**
 * Parse financial year from date
 * Returns { year: 2024, start: Date, end: Date }
 */
export function getFinancialYear(date: Date = new Date()) {
  const month = date.getMonth();
  const year = date.getFullYear();

  if (month >= 3) {
    // April onwards = current FY
    return {
      year,
      fyYear: `${year}-${year + 1}`,
      start: new Date(year, 3, 1),
      end: new Date(year + 1, 2, 31),
    };
  } else {
    // January to March = previous FY
    return {
      year: year - 1,
      fyYear: `${year - 1}-${year}`,
      start: new Date(year - 1, 3, 1),
      end: new Date(year, 2, 31),
    };
  }
}

/**
 * Get period info (month + year)
 */
export function getPeriodInfo(date: Date = new Date()) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1, // 1-based
    monthName: date.toLocaleString('en-US', { month: 'long' }),
    quarter: Math.ceil((date.getMonth() + 1) / 3),
  };
}

/**
 * Validate date range (from <= to)
 */
export function isValidDateRange(from: Date, to: Date): boolean {
  return from <= to;
}

/**
 * Get number of days in range (inclusive)
 */
export function getDaysInRange(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Format date for display in reports
 */
export function formatReportDate(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Get preset label for UI
 */
export const PRESET_LABELS: Record<DatePreset, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  lastMonth: 'Last Month',
  quarter: 'This Quarter',
  fy: 'This FY',
  lastFy: 'Last FY',
  custom: 'Custom',
};
