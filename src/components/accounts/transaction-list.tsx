"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AccountTransaction, TransactionType, PaymentMode } from "@/generated/prisma";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, RefreshCw } from "lucide-react";

interface TransactionListProps {
  transactions: AccountTransaction[];
  isLoading?: boolean;
}

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  IN: "Money In",
  OUT: "Money Out",
  TRANSFER_IN: "Transfer In",
  TRANSFER_OUT: "Transfer Out",
};

const TRANSACTION_TYPE_ICONS: Record<TransactionType, React.ReactNode> = {
  IN: <ArrowDown className="h-4 w-4 text-green-600" />,
  OUT: <ArrowUp className="h-4 w-4 text-red-600" />,
  TRANSFER_IN: <RefreshCw className="h-4 w-4 text-blue-600" />,
  TRANSFER_OUT: <RefreshCw className="h-4 w-4 text-orange-600" />,
};

const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CHEQUE: "Cheque",
  ONLINE_TRANSFER: "Online Transfer",
  CARD: "Card",
};

export function TransactionList({ transactions, isLoading = false }: TransactionListProps) {
  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [transactions]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  if (sortedTransactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-32">Date</TableHead>
            <TableHead className="w-32">Type</TableHead>
            <TableHead className="w-32">Payment Mode</TableHead>
            <TableHead className="text-right w-32">Amount</TableHead>
            <TableHead className="text-right w-32">Balance</TableHead>
            <TableHead className="w-48">Reference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransactions.map((txn) => (
            <TableRow key={txn.id} className="hover:bg-muted/50">
              <TableCell className="text-sm">
                {format(new Date(txn.createdAt), "MMM dd, yyyy HH:mm")}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {TRANSACTION_TYPE_ICONS[txn.type]}
                  <span className="text-sm font-medium">
                    {TRANSACTION_TYPE_LABELS[txn.type]}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {PAYMENT_MODE_LABELS[txn.paymentMode]}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                <span
                  className={
                    txn.type === "IN" || txn.type === "TRANSFER_IN"
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {txn.type === "IN" || txn.type === "TRANSFER_IN" ? "+" : "-"}
                  ₹{txn.amount.toFixed(2)}
                </span>
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                ₹{txn.balanceAfter.toFixed(2)}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {txn.remarks || (txn.linkedTxnType ? `${txn.linkedTxnType}` : "-")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
