"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getItem, setItem, removeItem, clearAll } from "@/lib/storage";

const THEME_KEY = "theme-preference";

type ThemePreference = "dark" | "light";

function getStoredTheme(): ThemePreference {
  const stored = getItem<ThemePreference>(THEME_KEY);
  return stored ?? "dark";
}

export default function SettingsPage() {
  const [theme, setTheme] = useState<ThemePreference>("dark");
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [clearedHistory, setClearedHistory] = useState(false);
  const [clearedAll, setClearedAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const pref = getStoredTheme();
      if (!cancelled) setTheme(pref);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function applyTheme(pref: ThemePreference) {
    setTheme(pref);
    setItem(THEME_KEY, pref);
    document.documentElement.classList.toggle("dark", pref === "dark");
    document.documentElement.classList.toggle("light", pref === "light");
  }

  async function handleClearHistory() {
    try {
      const res = await fetch("/api/scan-history?clear=true", { method: "DELETE" });
      if (res.ok) {
        setClearedHistory(true);
        setConfirmClearHistory(false);
        setTimeout(() => setClearedHistory(false), 3000);
      }
    } catch {
      // silently fail
    }
  }

  function handleClearAllData() {
    clearAll();
    removeItem(THEME_KEY);
    setClearedAll(true);
    setConfirmClearAll(false);
    setTimeout(() => setClearedAll(false), 3000);
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-description">
          Configure your CyberYoshi preferences.
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <section className="space-y-3">
          <h2 className="section-header">
            Appearance
          </h2>
          <div className="card-surface p-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose between dark and light mode.
            </p>
            <div className="flex gap-2">
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                aria-pressed={theme === "dark"}
                size="sm"
                onClick={() => applyTheme("dark")}
              >
                <Moon className="size-4" />
                Dark Mode
              </Button>
              <Button
                variant={theme === "light" ? "default" : "outline"}
                aria-pressed={theme === "light"}
                size="sm"
                onClick={() => applyTheme("light")}
              >
                <Sun className="size-4" />
                Light Mode
              </Button>
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="section-header">
            Scan Preferences
          </h2>
          <div className="card-surface p-5">
            <p className="text-sm text-muted-foreground">
              Default scan preferences are applied per-tool. Adjust options within each scanner for now.
            </p>
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="section-header">
            Data Management
          </h2>
          <div className="card-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Clear Scan History</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Remove all saved scan results from the database.
                </p>
              </div>
              {confirmClearHistory ? (
                <div className="flex items-center gap-2">
                  <Button variant="destructive" size="sm" onClick={handleClearHistory}>
                    Yes, clear
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirmClearHistory(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmClearHistory(true)}
                >
                  <Trash2 className="size-3.5" />
                  Clear History
                </Button>
              )}
            </div>

            {clearedHistory && (
              <div className="success-banner" aria-live="polite">
                <AlertTriangle className="size-4 text-success shrink-0 mt-0.5" />
                <p className="text-xs text-success">Scan history cleared.</p>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Clear Local Data</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Remove all local application data including preferences and activity cache.
                </p>
              </div>
              {confirmClearAll ? (
                <div className="flex items-center gap-2">
                  <Button variant="destructive" size="sm" onClick={handleClearAllData}>
                    Yes, clear all
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirmClearAll(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmClearAll(true)}
                >
                  <Trash2 className="size-3.5" />
                  Clear All Data
                </Button>
              )}
            </div>

            {clearedAll && (
              <div className="success-banner" aria-live="polite">
                <AlertTriangle className="size-4 text-success shrink-0 mt-0.5" />
                <p className="text-xs text-success">All local data cleared. Reload to apply default theme.</p>
              </div>
            )}
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="section-header">
            About
          </h2>
          <div className="card-surface p-5 space-y-1">
            <p className="text-sm font-medium">CyberYoshi</p>
            <p className="text-sm text-muted-foreground">Version 0.1.0</p>
            <p className="text-sm text-muted-foreground">
              A lightweight cybersecurity toolkit for authorized security testing and defensive analysis.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
