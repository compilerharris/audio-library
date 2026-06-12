"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { FacetOption } from "@/types/audio";

interface MultiSelectFilterProps {
  label: string;
  options: FacetOption[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}

export function MultiSelectFilter({
  label,
  options,
  selected,
  onToggle,
  onClear,
}: MultiSelectFilterProps) {
  const active = selected.length > 0;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "h-10 gap-2 rounded-full border-border bg-surface/60 px-4 text-sm font-medium text-muted-foreground hover:border-gold/40 hover:bg-gold/10 hover:text-foreground",
              active && "border-gold/50 bg-gold/10 text-foreground"
            )}
          />
        }
      >
        {label}
        {active && (
          <span
            className="flex size-5 items-center justify-center rounded-full bg-gold text-[11px] font-semibold text-night"
            aria-label={`${selected.length} selected`}
          >
            {selected.length}
          </span>
        )}
        <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-64 border border-gold/15 bg-surface p-2"
      >
        <ul className="max-h-72 overflow-y-auto" aria-label={`${label} options`}>
          {options.map((option) => {
            const checked = selected.includes(option.value);
            return (
              <li key={option.value}>
                <label className="flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-gold/10">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => onToggle(option.value)}
                  />
                  <span className="flex-1 truncate text-foreground">
                    {option.label}
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {option.count}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        {active && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="mt-1 w-full justify-center text-xs text-gold hover:bg-gold/10 hover:text-gold-bright"
          >
            Clear {label.toLowerCase()}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
