"use client";

import { useState, useCallback } from "react";

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export function useConfirmModal() {
  const [state, setState] = useState<ConfirmModalState>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const openConfirmModal = useCallback((config: Omit<ConfirmModalState, "isOpen">) => {
    setState({
      ...config,
      isOpen: true,
    });
  }, []);

  const closeConfirmModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return {
    ...state,
    openConfirmModal,
    closeConfirmModal,
  };
}
