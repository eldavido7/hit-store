"use client"

import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DateRangeFilterProps {
  fromDate?: Date
  toDate?: Date
  onDateRangeChange?: (from: Date | undefined, to: Date | undefined) => void
}

export function DateRangeFilter({ fromDate, toDate, onDateRangeChange }: DateRangeFilterProps) {
  const handleFromDateChange = (date: Date | undefined) => {
    if (date && toDate && date > toDate) {
      onDateRangeChange?.(date, undefined)
    } else {
      onDateRangeChange?.(date, toDate)
    }
  }

  const handleToDateChange = (date: Date | undefined) => {
    onDateRangeChange?.(fromDate, date)
  }

  const clearDates = () => {
    onDateRangeChange?.(undefined, undefined)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">From:</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-[140px] justify-start text-left font-normal", !fromDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fromDate ? format(fromDate, "MM/dd/yyyy") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={fromDate} onSelect={handleFromDateChange} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">To:</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-[140px] justify-start text-left font-normal", !toDate && "text-muted-foreground")}
              disabled={!fromDate}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {toDate ? format(toDate, "MM/dd/yyyy") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={handleToDateChange}
              initialFocus
              disabled={(date) => fromDate ? date < fromDate : false}
            />
          </PopoverContent>
        </Popover>
      </div>

      {(fromDate || toDate) && (
        <Button variant="ghost" size="sm" onClick={clearDates} className="gap-2">
          <X className="h-4 w-4" />
          Clear dates
        </Button>
      )}
    </div>
  )
}