/**
 * Convert numbers to Indian Currency words (Rupees and Paise)
 * E.g. 1234.50 -> "One Thousand Two Hundred Thirty Four Rupees and Fifty Paise Only"
 */

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertTwoDigit(num: number): string {
  if (num < 20) return ONES[num];
  const ten = Math.floor(num / 10);
  const one = num % 10;
  return `${TENS[ten]}${one > 0 ? " " + ONES[one] : ""}`.trim();
}

function convertThreeDigit(num: number): string {
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  let result = "";
  if (hundred > 0) {
    result += `${ONES[hundred]} Hundred`;
    if (remainder > 0) result += " ";
  }
  if (remainder > 0) {
    result += convertTwoDigit(remainder);
  }
  return result.trim();
}

export function numberToIndianWords(amount: number): string {
  if (!amount || isNaN(amount) || amount === 0) {
    return "Zero Rupees Only";
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const rupees = Math.floor(absAmount);
  const paise = Math.round((absAmount - rupees) * 100);

  // Indian number system grouping: Crore (1,00,00,000), Lakh (1,00,000), Thousand (1,000), Hundred (100)
  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const hundredAndBelow = rupees % 1000;

  const parts: string[] = [];

  if (crore > 0) {
    parts.push(`${convertThreeDigit(crore)} Crore`);
  }
  if (lakh > 0) {
    parts.push(`${convertTwoDigit(lakh)} Lakh`);
  }
  if (thousand > 0) {
    parts.push(`${convertTwoDigit(thousand)} Thousand`);
  }
  if (hundredAndBelow > 0) {
    parts.push(convertThreeDigit(hundredAndBelow));
  }

  let words = parts.join(" ").trim();
  if (!words) {
    words = "Zero";
  }

  let result = `${isNegative ? "Minus " : ""}${words} Rupees`;

  if (paise > 0) {
    result += ` and ${convertTwoDigit(paise)} Paise`;
  }

  return `${result} Only`;
}
