import React from 'react';

interface FieldProps {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  right?: React.ReactNode;
}

export function Field({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  right,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      {label && <p className="text-[12px] font-medium text-text-muted px-1">{label}</p>}
      <div
        className={`flex items-center bg-bg-card rounded-[14px] border px-4 h-[52px] transition-colors ${
          error ? 'border-red-300' : 'border-border'
        } shadow-[0_2px_6px_rgba(41,37,38,0.04)]`}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[14px] text-text-main placeholder:text-[#DFDEDE] outline-none"
        />
        {right}
      </div>
      {error && <p className="text-[11px] text-red-500 px-1">{error}</p>}
    </div>
  );
}
