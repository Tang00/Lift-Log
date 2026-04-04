"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "@/components/ui/actions/card-action-button.module.css";

type CardActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "accent" | "neutral" | "danger";
  square?: boolean;
  children: ReactNode;
};

function joinClassNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function CardActionButton({
  children,
  className,
  square = false,
  tone = "accent",
  type = "button",
  ...props
}: CardActionButtonProps) {
  return (
    <button
      className={joinClassNames(
        styles.button,
        styles[tone],
        square && styles.square,
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
