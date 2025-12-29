"use client";

import { useCallback, useState } from "react";

export type AlertType = "success" | "error" | "info";

export interface AlertState {
  isVisible: boolean;
  type: AlertType;
  title?: string;
  message?: string;
}

export function useAlert(initial?: Partial<AlertState>) {
  const [state, setState] = useState<AlertState>({
    isVisible: false,
    type: "success",
    title: "",
    message: "",
    ...initial,
  });

  const show = useCallback((payload: Partial<AlertState>) => {
    setState((s) => ({ ...s, ...payload, isVisible: true }));
  }, []);

  const showSuccess = useCallback(
    (title?: string, message?: string) => {
      show({
        type: "success",
        message: message ?? "",
        title: title ?? "",
      });
    },
    [show]
  );

  const showError = useCallback(
    (title?: string, message?: string) => {
      show({
        type: "error",
        message: message ?? "",
        title: title ?? "",
      });
    },
    [show]
  );

  const close = useCallback(() => {
    setState((s) => ({ ...s, isVisible: false }));
  }, []);

  return {
    state,
    show,
    showSuccess,
    showError,
    close,
  };
}
