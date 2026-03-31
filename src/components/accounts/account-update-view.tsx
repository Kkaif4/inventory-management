"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AccountForm } from "./account-form";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AccountUpdateViewProps {
  accountId: string;
  outletId: string;
  accountName: string;
  accountType: "CASH" | "BANK";
}

export function AccountUpdateView({
  accountId,
  outletId,
  accountName,
  accountType,
}: AccountUpdateViewProps) {
  const handleSuccess = () => {
    window.location.href = `/dashboard/financials/accounts/${accountId}`;
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/dashboard/financials/accounts/${accountId}`}>
            <Button variant="ghost" size="icon" className="hover:bg-slate-200">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1
              className="text-4xl font-bold text-slate-900 flex items-center gap-2"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <Edit className="w-8 h-8 text-emerald-600" />
              Edit Account
            </h1>
            <p className="text-slate-600 mt-2">Update {accountName} name</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle className="text-xl">Account Settings</CardTitle>
            <CardDescription>Update account name</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <AccountForm
              outletId={outletId}
              accountId={accountId}
              defaultValues={{
                name: accountName,
                type: accountType,
              }}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
