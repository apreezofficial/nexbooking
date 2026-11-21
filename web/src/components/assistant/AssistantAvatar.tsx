"use client";

import { BotAvatar, type BotAvatarShading, type BotAvatarType } from "bot-avatars";

export type AssistantState = "idle" | "working" | "sleeping";
export type { BotAvatarShading as AssistantFinish, BotAvatarType as AssistantShape };

// The library calls the resting state "default"; the rest of the app says "idle".
const libraryState = { idle: "default", working: "working", sleeping: "sleeping" } as const;
const stateLabel: Record<AssistantState, string> = { idle: "ready", working: "thinking", sleeping: "resting" };

export const assistantName = "EdeBooking assistant";
export const assistantStatus: Record<AssistantState, string> = {
  idle: "Ready to help",
  working: "Thinking…",
  sleeping: "Resting",
};

/** The assistant itself: the square, in brand gold, with plush fur. */
export const assistantDefaults = { shape: "square", finish: "fabric", color: "#d4af37" } as const;

/**
 * The assistant's face. One place decides which bot it is, so changing the look
 * (shape, colour, finish) later means editing this file only. `shape` and `finish`
 * exist so the brand page can show the whole family; the assistant keeps the defaults.
 */
export default function AssistantAvatar({
  state = "idle",
  size = 48,
  interactive = true,
  paused = false,
  shape = assistantDefaults.shape,
  finish = assistantDefaults.finish,
  className,
}: {
  state?: AssistantState;
  size?: number;
  interactive?: boolean;
  /** Hold the still pose of the state instead of animating. */
  paused?: boolean;
  shape?: BotAvatarType;
  finish?: BotAvatarShading;
  className?: string;
}) {
  return (
    <BotAvatar
      type={shape}
      color={assistantDefaults.color}
      face="mouth"
      shading={finish}
      state={libraryState[state]}
      size={size}
      interactive={interactive}
      paused={paused}
      className={className}
      aria-label={`${assistantName}, ${stateLabel[state]}`}
    />
  );
}
