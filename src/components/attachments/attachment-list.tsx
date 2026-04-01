"use client";

import React, { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { AttachmentMetadata } from "@/types/expense.types";

interface AttachmentThumbnailProps {
  attachment: AttachmentMetadata;
  moduleType: "EXPENSE" | "INVOICE";
  referenceId: string;
  onDelete: (id: string) => void;
  onPreview: (id: string, fileName: string) => void;
}

export function AttachmentThumbnail({
  attachment,
  moduleType,
  referenceId,
  onDelete,
  onPreview,
}: AttachmentThumbnailProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/attachments/${attachment.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleType, referenceId }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Attachment deleted");
        onDelete(attachment.id);
      } else {
        toast.error(result.error?.message ?? "Failed to delete attachment");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview(attachment.id, attachment.fileName);
  };

  return (
    <div
      className="relative w-20 h-20 bg-slate-100 rounded-lg overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onPreview(attachment.id, attachment.fileName)}
    >
      <img
        src={`/api/attachments/${attachment.id}/image`}
        alt={attachment.fileName}
        className="w-full h-full object-cover"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-colors flex items-center justify-center gap-2">
        <button
          onClick={handlePreview}
          className="p-1.5 bg-white rounded-full text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
          disabled={isDeleting}
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 bg-white rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface AttachmentListProps {
  attachments: AttachmentMetadata[];
  moduleType: "EXPENSE" | "INVOICE";
  referenceId: string;
  onDelete: (id: string) => void;
  onPreview: (id: string, fileName: string) => void;
}

export function AttachmentList({
  attachments,
  moduleType,
  referenceId,
  onDelete,
  onPreview,
}: AttachmentListProps) {
  if (attachments.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-slate-500">No attachments yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {attachments.map((attachment) => (
        <AttachmentThumbnail
          key={attachment.id}
          attachment={attachment}
          moduleType={moduleType}
          referenceId={referenceId}
          onDelete={onDelete}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}
