import Link from "next/link";
import { ChevronRight, LucideIcon } from "lucide-react";
import { Button } from "./button";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface Action {
  label: string;
  variant?: "default" | "secondary" | "ghost" | "destructive" | "outline";
  icon?: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs: Breadcrumb[];
  actions?: Action[];
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <header className="space-y-4 mb-6 pb-6 border-b border-border-default">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-1 text-2xs font-medium text-text-muted uppercase tracking-wider">
        {breadcrumbs.map((item, index) => (
          <div key={item.label} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-3 h-3 mx-1 text-border-strong" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-brand transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-text-secondary">{item.label}</span>
            )}
          </div>
        ))}
      </nav>

      {/* Main Header Row */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-text-primary uppercase">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
        </div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-3">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant || "default"}
                onClick={action.onClick}
                disabled={action.disabled}
                className="gap-2"
              >
                {action.icon && <action.icon className="w-4 h-4" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
