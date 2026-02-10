import React from 'react';

interface RadioProps {
  label?: string;
  checked?: boolean;
  onChange?: () => void;
  disabled?: boolean;
  name?: string;
  value?: string;
}

export function Radio({
  label,
  checked = false,
  onChange,
  disabled = false,
  name,
  value,
}: RadioProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200
          ${checked ? 'border-[#1C1C8B]' : 'border-[#6B7C7C]/40'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#1C1C8B]'}
        `}
        onClick={() => !disabled && onChange?.()}
        role="radio"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            !disabled && onChange?.();
          }
        }}
      >
        {checked && (
          <div className="w-2.5 h-2.5 rounded-full bg-[#1C1C8B]" />
        )}
      </div>
      {label && (
        <label
          className={`text-[14px] text-[#1F2121] ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
          onClick={() => !disabled && onChange?.()}
        >
          {label}
        </label>
      )}
    </div>
  );
}

interface RadioGroupProps {
  options: { label: string; value: string }[];
  selectedValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
}

export function RadioGroup({
  options,
  selectedValue,
  onChange,
  disabled = false,
  name,
}: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => (
        <Radio
          key={option.value}
          label={option.label}
          checked={selectedValue === option.value}
          onChange={() => onChange?.(option.value)}
          disabled={disabled}
          name={name}
          value={option.value}
        />
      ))}
    </div>
  );
}
