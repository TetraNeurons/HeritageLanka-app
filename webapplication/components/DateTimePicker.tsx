"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
}

export default function DateTimePicker({
  value,
  onChange,
  label = "Date & Time",
  placeholder = "Select date and time",
}: DateTimePickerProps) {
  const [time, setTime] = useState(
    value ? format(value, "HH:mm") : "09:00"
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Combine selected date with current time
      const [hours, minutes] = time.split(":");
      selectedDate.setHours(parseInt(hours), parseInt(minutes));
      onChange(selectedDate);
    } else {
      onChange(undefined);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (value) {
      const [hours, minutes] = newTime.split(":");
      const newDate = new Date(value);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      onChange(newDate);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, "PPP") : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
              initialFocus
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2 border rounded-md px-3">
          <Clock className="h-4 w-4 text-gray-500" />
          <Input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>
      {value && (
        <p className="text-xs text-gray-500">
          Selected: {format(value, "PPP 'at' p")}
        </p>
      )}
    </div>
  );
}
