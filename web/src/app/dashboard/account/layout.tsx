import type { ReactNode } from "react";
import SettingsShell from "@/components/dashboard/SettingsShell";

// Account pages use the session-aware dashboard shell, so instant navigation
// cannot safely prerender this nested segment either.
export const instant = false;

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <SettingsShell>{children}</SettingsShell>;
}
