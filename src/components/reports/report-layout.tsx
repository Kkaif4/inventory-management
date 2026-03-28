import { ReactNode } from "react";
import { PageHeader, type PageHeaderProps } from "@/components/ui/page-header";

export interface ReportLayoutProps {
  title: string;
  subtitle: string;
  breadcrumbLabel: string;
  actions?: PageHeaderProps["actions"];
  children: ReactNode;
}

export function ReportLayout({
  title,
  subtitle,
  breadcrumbLabel,
  actions,
  children,
}: ReportLayoutProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={[
          { label: "Reports", href: "/dashboard/reports" },
          { label: breadcrumbLabel },
        ]}
        actions={actions}
      />
      {children}
    </div>
  );
}
