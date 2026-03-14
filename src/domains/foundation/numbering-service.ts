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
  | "QUOTATION";

export const NumberingService = {
  async getNextNumber(
    db: Prisma.TransactionClient | any, // Accepts prisma or tx client
    outletId: string,
    type: DocumentType,
  ): Promise<string> {
    const now = new Date();
    const financialYear = this.getFinancialYear(now);
    const prefix = this.getPrefix(type);

    if (!db || !db.documentSeries) {
      console.error(
        "Prisma client or documentSeries model is missing on the client provided to NumberingService.",
        {
          hasDb: !!db,
          hasModel: !!db?.documentSeries,
        },
      );
      // Fallback to global prisma if db is not a client with models (might happen in some proxy scenarios)
      const client = db?.documentSeries ? db : prisma;
      if (!client.documentSeries) {
        throw new Error(
          "Critical: DocumentSeries model is missing from Prisma client. Please run 'npx prisma generate'.",
        );
      }
      db = client;
    }

    const series = await (db as any).documentSeries.upsert({
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
        nextNumber: 2, // First one will be 1
      },
    });

    // If we just created it, the next number for the *current* call is 1
    const currentNumber = series.nextNumber === 2 ? 1 : series.nextNumber - 1;

    return `${series.prefix}/${series.financialYear}/${currentNumber.toString().padStart(4, "0")}`;
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
    };
    return prefixes[type];
  },
};
