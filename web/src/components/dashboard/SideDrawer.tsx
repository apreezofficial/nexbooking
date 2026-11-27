"use client";

import { Drawer } from "@base-ui/react/drawer";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export default function SideDrawer({ open, onOpenChange, trigger, title, description, children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} swipeDirection="right">
      {trigger}
      <Drawer.Portal>
        <Drawer.Backdrop className="d-drawer-backdrop" />
        <Drawer.Viewport className="d-drawer-viewport">
          <Drawer.Popup className="d-side-drawer">
            <header>
              <Drawer.Title>{title}</Drawer.Title>
              {description && <Drawer.Description className="d-muted">{description}</Drawer.Description>}
              <Drawer.Close className="d-drawer-close" aria-label="Close drawer"><X size={20} /></Drawer.Close>
            </header>
            <div className="d-drawer-body">{children}</div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export const SideDrawerTrigger = Drawer.Trigger;
