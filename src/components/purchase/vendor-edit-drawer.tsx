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
import { getVendorForEdit } from "@/actions/purchase/vendors";
import { VendorForm } from "@/components/purchase/vendor-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VendorEditDrawerProps {
  vendorId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function VendorEditDrawer({
  vendorId,
  isOpen,
  onClose,
  onSuccess,
}: VendorEditDrawerProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && vendorId) {
      loadData(vendorId);
    } else {
      setData(null);
    }
  }, [isOpen, vendorId]);

  const loadData = async (id: string) => {
    setIsLoading(true);
    const res = await getVendorForEdit(id);
    if (res.success && res.data) {
      const p = res.data;
      setData({
        id: p.id,
        name: p.name,
        gstin: p.gstin || "",
        pan: p.pan || "",
        phone: p.phone || p.contactInfo || "",
        email: p.email || "",
        contactInfo: p.contactInfo || "",
        address: p.address,
        state: p.state,
        creditPeriod: p.creditPeriod,
        openingBalance: p.openingBalance,
        isActive: p.isActive,
        bankName: p.bankName || "",
        bankAccountName: p.bankAccountName || "",
        bankAccountNumber: p.bankAccountNumber || "",
        bankIfsc: p.bankIfsc || "",
        _metadata: {
          openingBalanceLocked: p.openingBalanceLocked,
        },
      });
    } else {
      toast.error(res.error?.message || "Failed to load vendor");
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
                Edit Vendor
              </DrawerTitle>
              <DrawerDescription>
                Update vendor identity, bank details, and terms.
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-6">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : data ? (
                <VendorForm
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
