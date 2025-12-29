"use client";

import styles from "./alert.module.css";
import { useEffect, useRef, useState } from "react";

export type AlertType = "success" | "error" | "info";

export interface AlertProps {
  isVisible: boolean;
  title?: string;
  message?: string;
  type?: AlertType;
  onClose?: () => void;
}

function Icon({ type }: { type?: AlertType }) {
  if (type === "success")
    return (
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" fill="#10B981" />
        <path
          d="M9 12l2 2 4-4"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (type === "error")
    return (
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" fill="#EF4444" />
        <path
          d="M15 9l-6 6M9 9l6 6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  return null;
}

export function Alert({
  isVisible,
  title = "",
  message = "",
  type = "info",
  onClose,
}: AlertProps) {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVisible]);

  useEffect(() => {
    // auto close handling with animated progress
    if (isVisible) {
      setProgress(0);
      const start = performance.now();
      startRef.current = start;

      const step = (ts: number) => {
        const elapsed = ts - (startRef.current ?? ts);
        const pct = Math.min(100, (elapsed / 2000) * 100);
        setProgress(pct);
        if (elapsed < 2000) {
          timerRef.current = requestAnimationFrame(step);
        } else {
          // call onClose when finished
          if (typeof onClose === "function") onClose();
        }
      };
      timerRef.current = requestAnimationFrame(step);

      return () => {
        if (timerRef.current) cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      };
    }
    return undefined;
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      role="presentation"
      aria-hidden={!isVisible}
      onClick={() => {
        if (typeof onClose === "function") onClose();
      }}
    >
      <div
        className={styles.alert}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label={title || "Alert"}
        tabIndex={-1}
      >
        <div className={styles.iconContainer} aria-hidden>
          <Icon type={type} />
        </div>

        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>

        <div className={styles.progressBar} aria-hidden>
          <div
            className={styles.progressFill}
            style={{
              width: `${progress}%`,
              backgroundColor:
                type === "success"
                  ? "#10b981"
                  : type === "error"
                  ? "#ef4444"
                  : "#3b82f6",
              animation: "progress 2s linear forwards",
            }}
          />
        </div>
      </div>
    </div>
  );
}
