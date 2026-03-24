import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerOverlay,
  DrawerPortal,
} from "@/components/ui/drawer";
import { getCustomerForEdit } from "@/actions/sales/customers";
import { CustomerForm } from "@/components/sales/customer-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CustomerEditDrawerProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomerEditDrawer({
  customerId,
  isOpen,
  onClose,
  onSuccess,
}: CustomerEditDrawerProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customerId) {
      loadData(customerId);
    } else {
      setData(null);
    }
  }, [isOpen, customerId]);

  const loadData = async (id: string) => {
    setIsLoading(true);
    const res = await getCustomerForEdit(id);
    if (res.success && res.data) {
      const p = res.data;
      setData({
        id: p.id,
        name: p.name,
        b2b: !!p.gstin,
        gstin: p.gstin || "",
        pan: p.pan || "",
        phone: p.phone || p.contactInfo || "",
        email: p.email || "",
        contactInfo: p.contactInfo || "",
        address: p.address,
        state: p.state,
        creditPeriod: p.creditPeriod,
        creditLimit: p.creditLimit || 0,
        openingBalance: p.openingBalance,
        isActive: p.isActive,
        _metadata: {
          openingBalanceLocked: p.openingBalanceLocked,
        },
      });
    } else {
      toast.error(res.error?.message || "Failed to load customer");
      onClose();
    }
    setIsLoading(false);
  };

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction="right"
    >
      <DrawerPortal>
        <DrawerOverlay className="fixed inset-0 bg-black/40 z-50 transition-opacity" />
        <DrawerContent className="fixed inset-y-0 right-0 z-50 flex h-full w-[640px] max-w-full flex-col bg-white shadow-2xl rounded-l-2xl outline-none">
          <div className="flex-1 overflow-y-auto">
            <DrawerHeader className="text-left border-b px-6 py-6 pb-4">
              <DrawerTitle className="text-xl font-bold">
                Edit Customer
              </DrawerTitle>
              <DrawerDescription>
                Update customer identity, terms, and balance.
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-6">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : data ? (
                <CustomerForm
                  initialData={data}
                  onSuccess={handleSuccess}
                  onCancel={onClose}
                  isSlideOver={true}
                />
              ) : null}
            </div>
          </div>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
}
