import { Suspense } from "react";
import Link from "next/link";
import { getCurrentSessionOutlet, getSessionWithOutlets } from "@/lib/outlet-auth";
import { getAccountDetail, getOutletAccounts } from "@/actions/accounts";
import { getAccountTransactionHistory } from "@/actions/accounts/transactions";
import { AccountDetailClient } from "./account-detail-client";
import { NotFoundError } from "@/lib/exceptions";
import { redirect } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

async function AccountDetailContent({ accountId, outletId, userId }: { accountId: string; outletId: string; userId: string }) {
  // Validate accountId exists
  if (!accountId) {
    throw new NotFoundError("Account ID is required");
  }

  const [accountResult, transactionsResult, accountsResult] = await Promise.all([
    getAccountDetail(accountId, outletId),
    getAccountTransactionHistory(accountId, outletId),
    getOutletAccounts(outletId),
  ]);

  if (!accountResult.success) {
    throw new Error(accountResult.error?.message || "Failed to load account");
  }

  if (!transactionsResult.success) {
    throw new Error(transactionsResult.error?.message || "Failed to load transactions");
  }

  if (!accountsResult.success) {
    throw new Error(accountsResult.error?.message || "Failed to load accounts");
  }

  const account = accountResult.data;
  const transactions = transactionsResult.data || [];
  const allAccounts = accountsResult.data || [];

  if (!account) {
    throw new NotFoundError("Account not found");
  }

  return (
    <AccountDetailClient
      account={account}
      transactions={transactions}
      allAccounts={allAccounts}
      outletId={outletId}
      userId={userId}
    />
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">Loading account details...</p>
    </div>
  );
}

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Handle both Promise and direct params (Next.js version compatibility)
  const resolvedParams = params instanceof Promise ? await params : params;
  const accountId = resolvedParams?.id;

  if (!accountId) {
    redirect("/dashboard/financials/accounts");
  }

  const outletId = await getCurrentSessionOutlet();
  const sessionData = await getSessionWithOutlets();

  if (!outletId || !sessionData?.session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/financials/accounts">Accounts</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Account Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Account Details</h1>
        <p className="text-muted-foreground mt-2">
          View account balance, transaction history, and manage settings
        </p>
      </div>

      <Suspense fallback={<Loading />}>
        <AccountDetailContent
          accountId={accountId}
          outletId={outletId}
          userId={sessionData.session.user.id}
        />
      </Suspense>
    </div>
  );
}
