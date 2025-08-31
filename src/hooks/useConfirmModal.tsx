"use client";

import { useState, useCallback } from "react";

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  onConfirm?: () => void;
}

export function useConfirmModal() {
  const [modalState, setModalState] = useState<ConfirmModalState>({
    isOpen: false,
    title: "",
    message: "",
  });

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      type?: "danger" | "warning" | "info";
    }
  ) => {
    setModalState({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
      type: options?.type || "danger",
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    hideConfirm();
  }, [modalState.onConfirm, hideConfirm]);

  return {
    modalState,
    showConfirm,
    hideConfirm,
    handleConfirm,
  };
}
