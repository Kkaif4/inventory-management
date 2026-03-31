"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transferSchema, TransferInput } from "@/validations/account.validation";
import { transferBetweenAccounts } from "@/actions/accounts/transfers";
import { Loader2 } from "lucide-react";
import { Account } from "@/generated/prisma";

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  outletId: string;
  userId: string;
  onSuccess?: () => void;
}

export function TransferDialog({
  open,
  onOpenChange,
  accounts,
  outletId,
  userId,
  onSuccess,
}: TransferDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(transferSchema),
    mode: "onChange",
    defaultValues: {
      fromAccountId: "",
      toAccountId: "",
      amount: "",
      remarks: "",
    },
  });

  async function onSubmit(data: any) {
    // Validate accounts are different
    if (data.fromAccountId === data.toAccountId) {
      toast.error("Cannot transfer to the same account");
      return;
    }

    setIsLoading(true);
    try {
      const result = await transferBetweenAccounts({
        ...data,
        date: new Date(),
        outletId,
        userId,
      });

      if (result.success) {
        toast.success("Transfer completed successfully");
        form.reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error?.message || "Failed to complete transfer");
      }
    } catch (error) {
      toast.error("An error occurred during transfer");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transfer Funds Between Accounts</DialogTitle>
          <DialogDescription>
            Move money from one account to another. This will update balances for both accounts
            immediately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fromAccountId"
              render={({ field }) => {
                const selectedAccount = accounts.find((acc) => acc.id === field.value);
                return (
                  <FormItem>
                    <FormLabel>From Account</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source account">
                            {selectedAccount
                              ? `${selectedAccount.name} (₹${selectedAccount.currentBalance.toFixed(2)})`
                              : "Select source account"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name} (₹{acc.currentBalance.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="toAccountId"
              render={({ field }) => {
                const selectedAccount = accounts.find((acc) => acc.id === field.value);
                const availableAccounts = accounts.filter(
                  (acc) => acc.id !== form.getValues("fromAccountId")
                );
                return (
                  <FormItem>
                    <FormLabel>To Account</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination account">
                            {selectedAccount
                              ? `${selectedAccount.name} (₹${selectedAccount.currentBalance.toFixed(2)})`
                              : "Select destination account"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableAccounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name} (₹{acc.currentBalance.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || "")}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Amount to transfer (must be greater than zero)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Cash deposit to bank"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Transfer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
