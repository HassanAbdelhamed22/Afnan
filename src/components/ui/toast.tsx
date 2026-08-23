"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface ToastMessage {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
}

type Listener = (toasts: ToastMessage[]) => void;
let listeners: Listener[] = [];
let toasts: ToastMessage[] = [];

export const toast = {
  show(message: string, type: ToastMessage["type"] = "info") {
    const id = Math.random().toString(36).substring(2, 9);
    toasts = [...toasts, { id, message, type }];
    listeners.forEach((l) => l(toasts));
    setTimeout(() => this.dismiss(id), 4000);
  },
  dismiss(id: string) {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((l) => l(toasts));
  },
  subscribe(listener: Listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};

export function ToastProvider() {
  const [activeToasts, setActiveToasts] = React.useState<ToastMessage[]>([]);

  React.useEffect(() => {
    return toast.subscribe(setActiveToasts);
  }, []);

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 flex flex-col gap-3 sm:max-w-sm w-auto sm:w-full select-none">
      {activeToasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "p-4 border border-solid border-outline-variant bg-surface text-on-surface flex items-start justify-between gap-3 transition-all duration-300 transform translate-y-0",
            t.type === "success" && "border-primary",
            t.type === "error" && "border-solid border-red-500/50"
          )}
        >
          <div className="flex-1 font-sans text-sm">{t.message}</div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-on-surface hover:opacity-60 transition-opacity p-0.5 bg-transparent border-none cursor-pointer"
            aria-label="Dismiss notification"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
