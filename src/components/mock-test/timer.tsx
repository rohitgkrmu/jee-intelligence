"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";
import { TIMER } from "@/lib/mock-test/types";

interface TimerProps {
  startedAt: Date;
  duration: number;
  onTimeUp: () => void;
  className?: string;
}

export function Timer({ startedAt, duration, onTimeUp, className }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = React.useState(() => {
    const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    return Math.max(0, duration - elapsed);
  });

  const timeUpCalledRef = React.useRef(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0 && !timeUpCalledRef.current) {
        timeUpCalledRef.current = true;
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, duration, onTimeUp]);

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const formatTime = (n: number) => n.toString().padStart(2, "0");

  // Determine warning level
  const getWarningLevel = () => {
    if (timeRemaining <= TIMER.WARNING_5_MIN) return "critical";
    if (timeRemaining <= TIMER.WARNING_10_MIN) return "warning";
    if (timeRemaining <= TIMER.WARNING_30_MIN) return "caution";
    return "normal";
  };

  const warningLevel = getWarningLevel();

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
        {
          "bg-[var(--background-card)] border-[var(--border-dark)]":
            warningLevel === "normal",
          "bg-yellow-500/10 border-yellow-500/30 text-yellow-400":
            warningLevel === "caution",
          "bg-orange-500/10 border-orange-500/30 text-orange-400 animate-pulse":
            warningLevel === "warning",
          "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse":
            warningLevel === "critical",
        },
        className
      )}
    >
      {warningLevel === "normal" ? (
        <Clock className="h-5 w-5 text-[var(--text-secondary)]" />
      ) : (
        <AlertTriangle className="h-5 w-5" />
      )}
      <div className="font-mono text-lg font-bold">
        {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
      </div>
      {warningLevel !== "normal" && (
        <span className="text-xs ml-2">
          {warningLevel === "critical"
            ? "Time almost up!"
            : warningLevel === "warning"
            ? "10 min left"
            : "30 min left"}
        </span>
      )}
    </div>
  );
}
