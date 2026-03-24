"use client";

import { PageHeader } from "@/components/ui/page-header";
import { VendorForm } from "@/components/purchase/vendor-form";

export default function NewVendorPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <PageHeader
        title="Add Vendor"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Vendors", href: "/dashboard/purchase/vendors" },
          { label: "New Vendor" },
        ]}
      />

      <div className="bg-white p-6 rounded-xl shadow-sm border mt-4">
        <VendorForm />
      </div>
    </div>
  );
}
