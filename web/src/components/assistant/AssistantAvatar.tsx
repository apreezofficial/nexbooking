"use client";

import { BotAvatar } from "bot-avatars";

export type AssistantState = "idle" | "working" | "sleeping";

// The library calls the resting state "default"; the rest of the app says "idle".
const libraryState = { idle: "default", working: "working", sleeping: "sleeping" } as const;
const stateLabel: Record<AssistantState, string> = { idle: "ready", working: "thinking", sleeping: "resting" };

export const assistantName = "EdeBooking assistant";
export const assistantStatus: Record<AssistantState, string> = {
  idle: "Ready to help",
  working: "Thinking…",
  sleeping: "Resting",
};

/**
 * The assistant's face. One place decides which bot it is, so changing the look
 * (type, colour, hat) later means editing this file only.
 */
export default function AssistantAvatar({ state = "idle", size = 48, interactive = true, className }: {
  state?: AssistantState;
  size?: number;
  interactive?: boolean;
  className?: string;
}) {
  return (
    <BotAvatar
      type="square"
      color="#d4af37"
      face="mouth"
      state={libraryState[state]}
      size={size}
      interactive={interactive}
      className={className}
      aria-label={`${assistantName}, ${stateLabel[state]}`}
    />
  );
}
