"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountForm } from "./account-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AccountCreateViewProps {
  outletId: string;
}

export function AccountCreateView({ outletId }: AccountCreateViewProps) {
  const handleSuccess = () => {
    window.location.href = "/dashboard/financials/accounts";
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/financials/accounts">
            <Button variant="ghost" size="icon" className="hover:bg-slate-200">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Create Account
            </h1>
            <p className="text-slate-600 mt-2">
              Set up a new cash or bank account to track your finances
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle className="text-xl">New Account Details</CardTitle>
            <CardDescription>
              Create a new account for tracking cash or bank transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <AccountForm
              outletId={outletId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
