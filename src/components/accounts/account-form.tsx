"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import {
  createAccountSchema,
  CreateAccountInput,
  updateAccountSchema,
  UpdateAccountInput,
} from "@/validations/account.validation";
import { createAccount, updateAccount } from "@/actions/accounts";
import { Loader2 } from "lucide-react";

interface AccountFormProps {
  outletId: string;
  accountId?: string;
  defaultValues?: Partial<CreateAccountInput>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Type-safe defaults factory
const getDefaultValues = (
  defaultValues?: Partial<CreateAccountInput>,
  isUpdate?: boolean,
) => {
  if (isUpdate) {
    return {
      name: defaultValues?.name ?? "",
      openingBalance: defaultValues?.openingBalance,
    } as Partial<UpdateAccountInput>;
  }
  return {
    name: defaultValues?.name ?? "",
    type: defaultValues?.type ?? "CASH",
    openingBalance: defaultValues?.openingBalance ?? 0,
  } as CreateAccountInput;
};

export function AccountForm({
  outletId,
  accountId,
  defaultValues,
  onSuccess,
  onCancel,
}: AccountFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isUpdate = !!accountId;
  const schema = isUpdate ? updateAccountSchema : createAccountSchema;

  const form = useForm<any>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: getDefaultValues(defaultValues, isUpdate),
  });

  async function onSubmit(data: any) {
    setIsLoading(true);
    try {
      if (accountId) {
        const result = await updateAccount(accountId, {
          ...data,
          outletId,
        });
        if (result.success) {
          toast.success("Account updated successfully");
          onSuccess?.();
        } else {
          toast.error(result.error?.message || "Failed to update account");
        }
      } else {
        const result = await createAccount({
          ...data,
          outletId,
        });
        if (result.success) {
          toast.success("Account created successfully");
          onSuccess?.();
        } else {
          toast.error(result.error?.message || "Failed to create account");
        }
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Main Cash, HDFC Bank"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Give your account a unique, memorable name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isUpdate && (
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CASH">
                      Cash (Petty Cash, Drawer)
                    </SelectItem>
                    <SelectItem value="BANK">
                      Bank (Checking, Savings)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {field.value === "CASH"
                    ? "Cash accounts only support Cash payment mode"
                    : field.value === "BANK"
                      ? "Bank accounts support UPI, Cheque, Online Transfer, Card"
                      : "Choose account type to see supported payment modes"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!isUpdate && (
          <FormField
            control={form.control}
            name="openingBalance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opening Balance</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || "")
                    }
                    disabled={isLoading}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Initial balance as of today (leave as 0 for new accounts)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {accountId ? "Update Account" : "Create Account"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
