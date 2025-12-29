"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./login-form.module.css";
import Alert from "./alert";
import { authenticateUser } from "../_actions/auth";
import { validateRedirectUrl } from "../_utils/redirect-validator";

export default function LoginForm() {
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectUrl = validateRedirectUrl(redirectParam);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await authenticateUser(formData);

      setIsLoading(false);

      if (result.success) {
        setAlertType("success");
        setAlertMessage("You have been successfully logged in");
        setShowAlert(true);

        // Redirect after showing success message
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);
      } else {
        setAlertType("error");
        setAlertMessage(result.message);
        setShowAlert(true);
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setAlertType("error");
      setAlertMessage("An error occurred during authentication");
      setShowAlert(true);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Sign In</h1>
          <p className={styles.subtitle}>Enter your credentials to continue</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={styles.input}
                placeholder="you@example.com"
                required
                autoComplete="email"
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
              {isLoading ? <div className={styles.spinner}></div> : "Continue"}
            </button>
          </form>

          <div className={styles.note}>
            <p className={styles.noteText}>
              Contact administrator for login credentials
            </p>
          </div>
        </div>
      </div>

      <Alert
        isVisible={showAlert}
        title={
          alertType === "success" ? "Authenticated" : "Authentication Failed"
        }
        message={alertMessage}
        type={alertType}
        onClose={() => setShowAlert(false)}
      />
    </>
  );
}
