import { HandHelping, Settings } from "lucide-react";
import type { CSSProperties } from "react";

export default function ServicesIcon({ size = 20, ...props }: {
  size?: number;
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  return (
    <span {...props} style={{ position: "relative", display: "inline-block", width: size, height: size, flexShrink: 0, ...props.style }}>
      <HandHelping size={size} strokeWidth={1.8} style={{ position: "absolute", left: 0, bottom: -size * .12 }} />
      <Settings size={size * .55} strokeWidth={2} style={{ position: "absolute", right: 0, top: -size * .08, background: "var(--service-icon-bg, transparent)", borderRadius: "50%" }} />
    </span>
  );
}
