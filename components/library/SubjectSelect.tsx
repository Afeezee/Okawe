"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { SUBJECTS } from "@/lib/constants";

const OTHER = "__other__";

/**
 * Controlled subject picker. Lets the user pick from the shared SUBJECTS list,
 * or choose "Other (specify)…" to type a custom category. A custom value passed
 * in (e.g. when editing an existing book) reopens in custom mode automatically.
 */
export default function SubjectSelect({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const knownSelected = SUBJECTS.includes(value);
  const [custom, setCustom] = useState(!knownSelected && value !== "");

  const selectValue = custom ? OTHER : knownSelected ? value : "";

  return (
    <>
      <select
        id={id}
        value={selectValue}
        onChange={(e) => {
          if (e.target.value === OTHER) {
            setCustom(true);
            onChange("");
          } else {
            setCustom(false);
            onChange(e.target.value);
          }
        }}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">Select subject</option>
        {SUBJECTS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
        <option value={OTHER}>Other (specify)…</option>
      </select>

      {custom && (
        <Input
          className="mt-2"
          placeholder="Enter subject"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </>
  );
}
