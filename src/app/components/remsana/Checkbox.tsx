import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  id,
}: CheckboxProps) {
  const handleChange = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          w-5 h-5 rounded-[4px] border-2 flex items-center justify-center cursor-pointer transition-all duration-200
          ${checked ? 'bg-[#1C1C8B] border-[#1C1C8B]' : 'bg-white border-[#6B7C7C]/40'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#1C1C8B]'}
        `}
        onClick={handleChange}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleChange();
          }
        }}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </div>
      {label && (
        <label
          htmlFor={id}
          className={`text-[14px] text-[#1F2121] ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
          onClick={handleChange}
        >
          {label}
        </label>
      )}
    </div>
  );
}

interface CheckboxGroupProps {
  options: { label: string; value: string }[];
  selectedValues?: string[];
  onChange?: (values: string[]) => void;
  disabled?: boolean;
}

export function CheckboxGroup({
  options,
  selectedValues = [],
  onChange,
  disabled = false,
}: CheckboxGroupProps) {
  const handleChange = (value: string) => {
    if (!onChange) return;
    
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    
    onChange(newValues);
  };

  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => (
        <Checkbox
          key={option.value}
          label={option.label}
          checked={selectedValues.includes(option.value)}
          onChange={() => handleChange(option.value)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
