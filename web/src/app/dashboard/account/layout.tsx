import type { ReactNode } from "react";
import SettingsShell from "@/components/dashboard/SettingsShell";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <SettingsShell>{children}</SettingsShell>;
}
