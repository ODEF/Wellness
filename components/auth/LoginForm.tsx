"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import styles from "./LoginForm.module.css";

type AuthMode = "login" | "register";
type UserRole = "client" | "admin";

function getReadableError(error: unknown) {
    
  if (!error) return "Unknown error.";

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const errorObject = error as {
      message?: string;
      error_description?: string;
      code?: string;
      status?: number;
    };

    return (
      errorObject.message ||
      errorObject.error_description ||
      JSON.stringify(errorObject)
    );
  }

  return "Unknown error.";
}

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function getUserRole(userId: string): Promise<UserRole> {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("PROFILE ROLE ERROR:", error);
      return "client";
    }

    return (data?.role as UserRole) || "client";
  }

  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("LOGIN DATA:", data);
    console.log("LOGIN ERROR:", error);

    if (error) {
      setErrorMessage(getReadableError(error));
      return;
    }

    if (!data.user) {
      setErrorMessage("Login failed. No user was returned.");
      return;
    }

    const role = await getUserRole(data.user.id);

    router.refresh();

    if (role === "admin") {
      router.push("/admin");
      return;
    }

    router.push("/client");
  }

  async function handleRegister() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log("SIGNUP DATA:", data);
    console.log("SIGNUP ERROR:", error);

    if (error) {
      setErrorMessage(getReadableError(error));
      return;
    }

    if (!data.user) {
      setErrorMessage("Account was not created. No user was returned.");
      return;
    }

    if (!data.session) {
      setMessage(
        "Account created. If email confirmation is enabled, check your email before logging in."
      );
      return;
    }

    router.refresh();
    router.push("/client");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      if (mode === "login") {
        await handleLogin();
      } else {
        await handleRegister();
      }
    } catch (error) {
      console.error("UNEXPECTED AUTH ERROR:", error);
      setErrorMessage(getReadableError(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.modeSwitch}>
        <button
          type="button"
          className={mode === "login" ? styles.activeMode : styles.modeButton}
          onClick={() => setMode("login")}
        >
          Login
        </button>

        <button
          type="button"
          className={
            mode === "register" ? styles.activeMode : styles.modeButton
          }
          onClick={() => setMode("register")}
        >
          Create account
        </button>
      </div>

      <label className={styles.field}>
        <span>Email</span>
        <input
          type="email"
          value={email}
          placeholder="name@example.com"
          autoComplete="email"
          required
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span>Password</span>
        <input
          type="password"
          value={password}
          placeholder="Enter password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
      {message ? <p className={styles.message}>{message}</p> : null}

      <button className={styles.submitButton} type="submit" disabled={isLoading}>
        {isLoading
          ? "Please wait..."
          : mode === "login"
            ? "Login"
            : "Create account"}
      </button>
    </form>
  );
}