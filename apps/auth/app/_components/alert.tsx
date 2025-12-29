"use client";

import { useEffect } from "react";
import styles from "./alert.module.css";

interface AlertProps {
  isVisible: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

export default function Alert({
  isVisible,
  title,
  message,
  type,
  onClose,
}: AlertProps) {
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.alert} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconContainer}>
          {type === "success" && (
            <svg
              className={styles.successIcon}
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
          )}
          {type === "error" && (
            <svg
              className={styles.errorIcon}
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
          )}
        </div>

        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>

        {type === "success" && (
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
        )}
      </div>
    </div>
  );
}
