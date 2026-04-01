"use client";

import React, { useEffect, useState } from "react";
import { Paperclip } from "lucide-react";
import { AttachmentUploadZone } from "./attachment-upload-zone";
import { AttachmentList } from "./attachment-list";
import { AttachmentPreviewDialog } from "./attachment-preview-dialog";
import type { AttachmentMetadata } from "@/types/expense.types";

interface AttachmentSectionProps {
  moduleType: "EXPENSE" | "INVOICE";
  referenceId: string;
  className?: string;
  onAttachmentCountChange?: (count: number) => void;
}

export function AttachmentSection({
  moduleType,
  referenceId,
  className = "",
  onAttachmentCountChange,
}: AttachmentSectionProps) {
  const [attachments, setAttachments] = useState<AttachmentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState("");

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        moduleType,
        referenceId,
      });
      const response = await fetch(`/api/attachments/by-reference?${params}`);
      const result = await response.json();

      if (result.success && result.data) {
        setAttachments(result.data);
      }
    } catch (error) {
      console.error("Failed to load attachments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [moduleType, referenceId]);

  useEffect(() => {
    onAttachmentCountChange?.(attachments.length);
  }, [attachments.length, onAttachmentCountChange]);

  const handleUpload = (attachment: AttachmentMetadata) => {
    // Optimistic update
    setAttachments((prev) => [attachment, ...prev]);
  };

  const handleDelete = (id: string) => {
    // Optimistic update
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handlePreview = (id: string, fileName: string) => {
    setPreviewId(id);
    setPreviewFileName(fileName);
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
          <Paperclip className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Attachments
          </h3>
          <p className="text-xs text-slate-500">
            {attachments.length} of 3 attachments
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-5">
        {/* Existing attachments */}
        {!loading && attachments.length > 0 && (
          <AttachmentList
            attachments={attachments}
            moduleType={moduleType}
            referenceId={referenceId}
            onDelete={handleDelete}
            onPreview={handlePreview}
          />
        )}

        {/* Upload zone (hidden if max reached) */}
        {attachments.length < 3 && (
          <AttachmentUploadZone
            moduleType={moduleType}
            referenceId={referenceId}
            disabled={false}
            onUpload={handleUpload}
          />
        )}

        {/* No attachments yet message */}
        {!loading && attachments.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500">No attachments yet</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-6">
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-r-blue-600" />
          </div>
        )}
      </div>

      {/* Preview dialog */}
      <AttachmentPreviewDialog
        open={previewId !== null}
        onClose={() => setPreviewId(null)}
        attachmentId={previewId}
        fileName={previewFileName}
      />
    </div>
  );
}
