"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Check } from "lucide-react";

type NoticeContextValue = { notify: (message: string) => void };
const NoticeContext = createContext<NoticeContextValue>({ notify: () => {} });

/** A short message shown at the bottom of the screen, like the inline notice in the app. */
export const useNotice = () => useContext(NoticeContext).notify;

export function NoticeProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const timer = useRef<number | undefined>(undefined);

  const notify = useCallback((next: string) => {
    window.clearTimeout(timer.current);
    setMessage(next);
    timer.current = window.setTimeout(() => setMessage(""), 5200);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <NoticeContext.Provider value={{ notify }}>
      {children}
      <div className="d-toast-wrap" aria-live="polite">
        {message ? (
          <div className="d-toast" role="status">
            <Check size={16} strokeWidth={2.4} aria-hidden="true" />
            <span>{message}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setMessage("")}>×</button>
          </div>
        ) : null}
      </div>
    </NoticeContext.Provider>
  );
}
