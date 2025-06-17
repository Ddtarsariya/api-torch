// File: src\components\ui\select.tsx

import React, { useState, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils"; // Your utility function for conditional classNames

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { id: string; name: string }[];
  placeholder?: string;
}

export const CustomSelect: React.FC<SelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        className={cn(
          "w-full inline-flex items-center justify-between rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
        onClick={handleToggle}
      >
        <span>{options.find((option) => option.id === value)?.name || placeholder}</span>
        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
          <ul className="max-h-60 overflow-auto rounded-md py-1 text-sm">
            {options.map((option) => (
              <li
                key={option.id}
                className={cn(
                  "cursor-pointer select-none relative py-2 pl-8 pr-4",
                  value === option.id ? "bg-accent text-accent-foreground" : "text-gray-900"
                )}
                onClick={() => handleSelect(option.id)}
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  {value === option.id && <Check className="h-4 w-4" />}
                </span>
                {option.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
