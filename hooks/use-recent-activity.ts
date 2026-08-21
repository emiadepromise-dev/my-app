"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getItem, setItem } from "@/lib/storage";
import type { Activity } from "@/lib/types";

const HISTORY_KEY = "scan-history";
const MAX_ITEMS = 20;

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void) {
  listeners = [...listeners, callback];
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function getSnapshot(): string {
  try {
    return localStorage.getItem(HISTORY_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot(): string {
  return "[]";
}

export function useRecentActivity() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const activities = useMemo(() => {
    try {
      return JSON.parse(raw) as Activity[];
    } catch {
      return [];
    }
  }, [raw]);

  const addActivity = useCallback((activity: Activity) => {
    const stored = getItem<Activity[]>(HISTORY_KEY) ?? [];
    const next = [activity, ...stored].slice(0, MAX_ITEMS);
    setItem(HISTORY_KEY, next);
    emitChange();
  }, []);

  const removeActivity = useCallback((id: string) => {
    const stored = getItem<Activity[]>(HISTORY_KEY) ?? [];
    const next = stored.filter((a) => a.id !== id);
    setItem(HISTORY_KEY, next);
    emitChange();
  }, []);

  const clearAll = useCallback(() => {
    setItem(HISTORY_KEY, []);
    emitChange();
  }, []);

  return { activities, addActivity, removeActivity, clearAll };
}
