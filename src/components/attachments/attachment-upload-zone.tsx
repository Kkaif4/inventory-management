"use client";

import React, { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { attachmentValidationRules } from "@/validations/expense.validation";
import type { AttachmentMetadata } from "@/types/expense.types";

interface AttachmentUploadZoneProps {
  moduleType: "EXPENSE" | "INVOICE";
  referenceId: string;
  disabled?: boolean;
  onUpload: (attachment: AttachmentMetadata) => void;
}

export function AttachmentUploadZone({
  moduleType,
  referenceId,
  disabled = false,
  onUpload,
}: AttachmentUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndUpload = async (file: File) => {
    // Client-side validation
    if (!attachmentValidationRules.ALLOWED_MIMES.includes(file.type as any)) {
      toast.error("Only JPG and PNG images are allowed");
      return;
    }

    if (file.size > attachmentValidationRules.MAX_SIZE_BEFORE_COMPRESSION) {
      toast.error(
        `File must be under ${(attachmentValidationRules.MAX_SIZE_BEFORE_COMPRESSION / 1024 / 1024).toFixed(0)}MB`
      );
      return;
    }

    // Upload
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("moduleType", moduleType);
      formData.append("referenceId", referenceId);

      const response = await fetch("/api/attachments/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        toast.success("Attachment uploaded successfully");
        onUpload(result.data);
      } else {
        toast.error(result.error?.message ?? "Upload failed");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndUpload(file);
    }
  };

  if (disabled) {
    return (
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50">
        <p className="text-sm text-slate-500">Maximum 3 attachments reached</p>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
        isDragging
          ? "border-blue-400 bg-blue-50"
          : "border-slate-300 bg-white hover:bg-slate-50"
      } ${isUploading ? "opacity-75 cursor-not-allowed" : ""}`}
      onClick={() => !isUploading && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={attachmentValidationRules.ALLOWED_MIMES.join(",")}
        onChange={handleFileSelect}
        disabled={isUploading}
        className="hidden"
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-700">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-6 h-6 text-slate-400" />
          <div>
            <p className="text-sm font-medium text-slate-900">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-slate-500">JPG, PNG up to 5MB</p>
          </div>
        </div>
      )}
    </div>
  );
}
