import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
export type DocumentType =
  | "SALES_INVOICE"
  | "PURCHASE_ORDER"
  | "GRN"
  | "STOCK_TRANSFER"
  | "STOCK_ADJUSTMENT"
  | "CASH_MEMO"
  | "CREDIT_NOTE"
  | "STOCK_RETURN"
  | "QUOTATION"
  | "RECEIPT"
  | "EXPENSE"
  | "OLD_BILL";

export const NumberingService = {
  async peekNextNumber(
    db: Prisma.TransactionClient | any,
    outletId: string,
    type: DocumentType,
  ): Promise<string> {
    const now = new Date();
    const financialYear = this.getFinancialYear(now);
    const prefix = this.getPrefix(type);

    const client = db?.documentSeries ? db : prisma;

    const series = await (client as any).documentSeries.findUnique({
      where: {
        type_financialYear_outletId: {
          type,
          financialYear,
          outletId,
        },
      },
    });

    const nextNumber = series ? series.nextNumber : 1;
    const formattedNumber = `${prefix}/${financialYear}/${nextNumber.toString().padStart(4, "0")}`;

    return formattedNumber;
  },

  async getNextNumber(
    db: Prisma.TransactionClient | any, // Accepts prisma or tx client
    outletId: string,
    type: DocumentType,
  ): Promise<string> {
    const now = new Date();
    const financialYear = this.getFinancialYear(now);
    const prefix = this.getPrefix(type);

    if (!db || !db.documentSeries) {
      // Fallback to global prisma if db is not a client with models (might happen in some proxy scenarios)
      const client = db?.documentSeries ? db : prisma;
      if (!client.documentSeries) {
        throw new Error(
          "Critical: DocumentSeries model is missing from Prisma client. Please run 'npx prisma generate'.",
        );
      }
      db = client;
    }

    const beforeUpsert = await (db as any).documentSeries.findUnique({
      where: {
        type_financialYear_outletId: {
          type,
          financialYear,
          outletId,
        },
      },
    });

    const dbClient = db as any;

    // CRITICAL: If we're not using tx client, upsert will use global prisma but might not persist in transaction
    if (!db?.$transaction && !dbClient.documentSeries) {
      console.error(
        `[NUMBERING-SERVICE] ❌ CRITICAL: db is not a transaction client! Upsert might not persist.`,
      );
    }

    let series;
    try {
      series = await dbClient.documentSeries.upsert({
        where: {
          type_financialYear_outletId: {
            type,
            financialYear,
            outletId,
          },
        },
        update: {
          nextNumber: {
            increment: 1,
          },
        },
        create: {
          type,
          financialYear,
          outletId,
          prefix,
          nextNumber: 2, // First call will return 1
        },
      });
    } catch (error) {
      throw error;
    }

    // If we just created it, the next number for the *current* call is 1
    const isNewRecord = !beforeUpsert;
    const currentNumber = isNewRecord ? 1 : series.nextNumber - 1;

    const formattedNumber = `${series.prefix}/${series.financialYear}/${currentNumber.toString().padStart(4, "0")}`;

    return formattedNumber;
  },

  getFinancialYear(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed, 3 is April

    // FY starts in April (India standard)
    if (month >= 3) {
      return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
      return `${year - 1}-${year.toString().slice(-2)}`;
    }
  },

  getPrefix(type: DocumentType): string {
    const prefixes: Record<DocumentType, string> = {
      SALES_INVOICE: "INV",
      PURCHASE_ORDER: "PO",
      GRN: "GRN",
      STOCK_TRANSFER: "TRF",
      STOCK_ADJUSTMENT: "ADJ",
      CASH_MEMO: "CM",
      CREDIT_NOTE: "CN",
      STOCK_RETURN: "SR",
      QUOTATION: "QTN",
      RECEIPT: "RCP",
      EXPENSE: "EXP",
      OLD_BILL: "OLD",
    };
    return prefixes[type];
  },
};
