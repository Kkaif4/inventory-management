"use client";

import { useState } from "react";
import { Edit2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TransactionList } from "@/components/accounts/transaction-list";
import { TransferDialog } from "@/components/accounts/transfer-dialog";
import Link from "next/link";
import { Account, AccountTransaction } from "@/generated/prisma";

interface AccountDetailClientProps {
  account: Account & { calculatedBalance: number };
  transactions: AccountTransaction[];
  allAccounts: Account[];
  outletId: string;
  userId: string;
}

export function AccountDetailClient({
  account,
  transactions,
  allAccounts,
  outletId,
  userId,
}: AccountDetailClientProps) {
  const [transferOpen, setTransferOpen] = useState(false);

  const typeColor = account.type === "CASH" ? "default" : "secondary";
  const balanceDiff = account.currentBalance - account.openingBalance;

  return (
    <div className="space-y-6">
      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Account Name
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{account.name}</p>
              <Badge variant={typeColor}>{account.type}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ₹{account.currentBalance.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Opening Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{account.openingBalance.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${balanceDiff >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {balanceDiff >= 0 ? "+" : ""}₹{balanceDiff.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            All money movements for this account ({transactions.length} transactions)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionList transactions={transactions} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href={`/dashboard/financials/accounts/${account.id}/edit`}>
          <Button variant="outline">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Account
          </Button>
        </Link>
        <Button onClick={() => setTransferOpen(true)}>
          <Send className="h-4 w-4 mr-2" />
          Transfer Funds
        </Button>
      </div>

      <TransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        accounts={allAccounts}
        outletId={outletId}
        userId={userId}
        onSuccess={() => {
          setTransferOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
