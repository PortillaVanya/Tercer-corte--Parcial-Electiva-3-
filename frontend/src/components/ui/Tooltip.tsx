import * as React from "react";
import { cn } from "../../lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <div className="group relative inline-block">
      {children}
      <div
        className={cn(
          "invisible absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:visible group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900",
          className
        )}
      >
        {content}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
      </div>
    </div>
  );
}
