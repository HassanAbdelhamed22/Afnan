"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  onChange?: (value: string) => void;
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, value, defaultValue, placeholder = "Select option", onChange, name, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState<string>(
      String(value ?? defaultValue ?? "")
    );
    const containerRef = React.useRef<HTMLDivElement>(null);
    const selectRef = React.useRef<HTMLSelectElement>(null);

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(String(value));
      }
    }, [value]);

    React.useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const options: { value: string; label: string; disabled?: boolean }[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === "option") {
        const optChild = child as React.ReactElement<{ value?: string; children?: React.ReactNode; disabled?: boolean }>;
        options.push({
          value: String(optChild.props.value ?? ""),
          label: String(optChild.props.children ?? ""),
          disabled: optChild.props.disabled,
        });
      }
    });

    const selectedOption = options.find((opt) => opt.value === selectedValue);
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    const handleSelect = (val: string) => {
      setSelectedValue(val);
      setIsOpen(false);
      
      if (selectRef.current) {
        selectRef.current.value = val;
        const event = new Event("change", { bubbles: true });
        selectRef.current.dispatchEvent(event);
      }
      
      if (onChange) {
        onChange(val);
      }
    };

    React.useImperativeHandle(ref, () => selectRef.current as HTMLSelectElement);

    return (
      <div className="relative w-full" ref={containerRef}>
        <select
          ref={selectRef}
          name={name}
          value={selectedValue}
          onChange={(e) => handleSelect(e.target.value)}
          className="sr-only"
          {...props}
        >
          {children}
        </select>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "flex w-full items-center justify-between border-b border-solid border-outline-variant bg-transparent text-on-background focus:border-primary outline-none transition-colors ease-expo-out duration-300 py-2 pr-2 text-base cursor-pointer text-left font-sans border-t-0 border-x-0",
            className
          )}
        >
          <span className={cn(!selectedOption && "opacity-50")}>
            {displayLabel}
          </span>
          <svg
            className={cn("h-4 w-4 transition-transform duration-300", isOpen && "rotate-180")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-30 mt-1 w-full bg-surface border border-solid border-outline-variant py-1 focus:outline-none max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => !opt.disabled && handleSelect(opt.value)}
                className={cn(
                  "block px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors duration-200 cursor-pointer font-sans",
                  opt.disabled && "opacity-40 cursor-not-allowed",
                  opt.value === selectedValue && "bg-surface-container-low font-semibold"
                )}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
