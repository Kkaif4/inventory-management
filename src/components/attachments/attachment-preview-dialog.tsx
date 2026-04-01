"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Download } from "lucide-react";

interface AttachmentPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  attachmentId: string | null;
  fileName: string;
}

export function AttachmentPreviewDialog({
  open,
  onClose,
  attachmentId,
  fileName,
}: AttachmentPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900 truncate">
            {fileName}
          </h2>
          <div className="flex items-center gap-2">
            {attachmentId && (
              <a
                href={`/api/attachments/${attachmentId}/image`}
                download={fileName}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-50">
          {attachmentId ? (
            <img
              src={`/api/attachments/${attachmentId}/image`}
              alt={fileName}
              className="max-w-full max-h-full object-contain"
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
