"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

export interface ReportCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  metric?: string;
  metricLabel?: string;
  variant?: "default" | "featured" | "alert" | "success";
  href: string;
  onClick?: () => void;
}

/**
 * Editorial report card component
 * Minimal, type-driven design with intentional asymmetry
 */
export function ReportCard({
  title,
  description,
  icon,
  metric,
  metricLabel,
  variant = "default",
  href,
  onClick,
}: ReportCardProps) {
  const handleClick = () => {
    onClick?.();
    // In a real app, navigate to href
  };

  return (
    <article className={`report-card report-card--${variant}`}>
      <div className="card-header">
        <div className="card-icon">{icon}</div>
        <h3 className="card-title">{title}</h3>
      </div>

      <p className="card-description">{description}</p>

      {metric && metricLabel && (
        <div className="card-metric">
          <span className="metric-value">{metric}</span>
          <span className="metric-label">{metricLabel}</span>
        </div>
      )}

      <button className="card-cta" onClick={handleClick}>
        <span>View Report</span>
        <ChevronRight size={18} />
      </button>
    </article>
  );
}

/**
 * Report grid container
 * Asymmetrical layout with featured card
 */
export interface ReportGridProps {
  children: React.ReactNode;
  featuredIndex?: number;
}

export function ReportGrid({ children, featuredIndex = 0 }: ReportGridProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className="report-grid">
      {childrenArray.map((child, index) => {
        const isFeatured = index === featuredIndex;
        return (
          <div
            key={index}
            className={`report-grid-item ${isFeatured ? "featured" : ""}`}
          >
            {React.isValidElement(child) &&
              React.cloneElement(child, {
                variant: isFeatured ? "featured" : "default",
              } as any)}
          </div>
        );
      })}
    </div>
  );
}
