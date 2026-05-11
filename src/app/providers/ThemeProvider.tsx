"use client";
import * as React from "react";

type Theme = "light" | "dark" | "system";
type Ctx = {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
};

const ThemeCtx = React.createContext<Ctx | null>(null);

function getSystem(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(t: Theme) {
  const resolved = t === "system" ? getSystem() : t;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  return resolved;
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("theme") as Theme | null) ?? "system";
}

function resolveInitial(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = readStoredTheme();
  return stored === "system" ? getSystem() : stored;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy initial state reads localStorage on first render instead of doing it
  // in a useEffect — avoids the React 19 set-state-in-effect rule.
  const [theme, setThemeState] = React.useState<Theme>(readStoredTheme);
  const [resolved, setResolved] = React.useState<"light" | "dark">(resolveInitial);

  // Sync the html class to the resolved theme on every change (including mount).
  // This is a legitimate effect — we're updating an external system (the DOM).
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [resolved]);

  React.useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setResolved(applyTheme("system"));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = React.useCallback((t: Theme) => {
    localStorage.setItem("theme", t);
    setThemeState(t);
    setResolved(applyTheme(t));
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}
