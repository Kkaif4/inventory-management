"use server";

import { prisma } from "@/lib/prisma";

export async function getLedgerEntries(accountId?: string) {
  return await prisma.ledgerEntry.findMany({
    where: accountId ? { accountId } : {},
    include: {
      account: true,
      transaction: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function getPNL() {
  const accounts = await prisma.account.findMany({
    include: { entries: true },
  });

  const income = accounts
    .filter((a) => a.group === "INCOME")
    .map((a) => ({
      name: a.name,
      balance: a.entries.reduce(
        (sum: number, e: any) => sum + (e.credit - e.debit),
        0,
      ),
    }));

  const expense = accounts
    .filter((a) => a.group === "EXPENSE")
    .map((a) => ({
      name: a.name,
      balance: a.entries.reduce(
        (sum: number, e: any) => sum + (e.debit - e.credit),
        0,
      ),
    }));

  return { income, expense };
}

export async function getBalanceSheet() {
  const accounts = await prisma.account.findMany({
    include: { entries: true },
  });

  const assets = accounts
    .filter((a) => a.group === "ASSET")
    .map((a) => ({
      name: a.name,
      balance: a.entries.reduce(
        (sum: number, e: any) => sum + (e.debit - e.credit),
        0,
      ),
    }));

  const liabilities = accounts
    .filter((a) => a.group === "LIABILITY")
    .map((a) => ({
      name: a.name,
      balance: a.entries.reduce(
        (sum: number, e: any) => sum + (e.credit - e.debit),
        0,
      ),
    }));

  const equity = accounts
    .filter((a) => a.group === "EQUITY")
    .map((a) => ({
      name: a.name,
      balance: a.entries.reduce(
        (sum: number, e: any) => sum + (e.credit - e.debit),
        0,
      ),
    }));

  return { assets, liabilities, equity };
}
