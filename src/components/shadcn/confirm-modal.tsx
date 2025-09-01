"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/shadcn/button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "text-red-600",
          button: "bg-red-600 hover:bg-red-700",
          border: "border-red-200",
        };
      case "warning":
        return {
          icon: "text-yellow-600",
          button: "bg-yellow-600 hover:bg-yellow-700",
          border: "border-yellow-200",
        };
      case "info":
        return {
          icon: "text-blue-600",
          button: "bg-blue-600 hover:bg-blue-700",
          border: "border-blue-200",
        };
      default:
        return {
          icon: "text-red-600",
          button: "bg-red-600 hover:bg-red-700",
          border: "border-red-200",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b p-6 ${styles.border}`}
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 border-t border-gray-200 p-6">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </Button>
          <Button onClick={onConfirm} className={styles.button}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
