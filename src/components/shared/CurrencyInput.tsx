"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

/** Input that formats Chilean thousands separators while editing. */
export function CurrencyInput({ value, onChange, placeholder, className, id }: CurrencyInputProps) {
  const display = value ? value.toLocaleString("es-CL") : "";
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
      <Input
        id={id}
        inputMode="numeric"
        className={"pl-6 " + (className || "")}
        placeholder={placeholder || "0"}
        value={display}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d]/g, "");
          onChange(digits ? parseInt(digits, 10) : 0);
        }}
      />
    </div>
  );
}
