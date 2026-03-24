import { PageHeader } from "@/components/ui/page-header";
import { CustomerForm } from "@/components/sales/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <PageHeader
        title="Add Customer"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Customers", href: "/dashboard/sales/customers" },
          { label: "New Customer" },
        ]}
      />

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        {/* Render standard full page form without SlideOver UI modifications */}
        <CustomerForm isSlideOver={false} />
      </div>
    </div>
  );
}
