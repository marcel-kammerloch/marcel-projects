"use client";

import styles from "./login-form.module.css";
import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { authenticateUser } from "../action";
import { validateRedirectUrl } from "../redirect-validator";
import { Alert } from "./alert";
import { useAlert } from "./use-alert";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectUrl = validateRedirectUrl(redirectParam);

  const errorParam = searchParams.get("error");
  const isNotEnoughScopesError = errorParam === "not_enough_scopes";

  const { state: alertState, showSuccess, showError, close } = useAlert();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await authenticateUser(formData);

      if (result.success) {
        showSuccess("Authenticated", "You have been successfully logged in");
        // redirect 200ms before end of the alert duration
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000 - 200);
      } else {
        showError(
          "Authentication Failed",
          result?.message ?? "Authentication failed",
        );
      }
    } catch (error) {
      console.error(error);
      showError(
        "Authentication Failed",
        "An error occurred during authentication",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Sign In</h1>
          <p className={styles.subtitle}>Enter credentials to continue</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="identifier" className={styles.label}>
                Identifier
              </label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                className={styles.input}
                placeholder="Identifier"
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={styles.input}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? <div className={styles.spinner} /> : "Continue"}
            </button>
          </form>

          <div className={styles.note}>
            <p
              className={styles.noteText}
              style={{
                color: isNotEnoughScopesError ? "#ef4444" : "#6b7280",
                fontStyle: isNotEnoughScopesError ? "normal" : "italic",
                fontSize: isNotEnoughScopesError ? "14px" : "12px",
              }}
            >
              {isNotEnoughScopesError
                ? "Please login with other credentials where you have permissions to access this resource"
                : "Contact administrator for login credentials"}
            </p>
          </div>
        </div>
      </div>

      <Alert
        isVisible={alertState.isVisible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={close}
      />
    </>
  );
}
