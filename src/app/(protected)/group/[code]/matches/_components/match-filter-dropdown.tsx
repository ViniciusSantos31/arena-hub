"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { matchStatusEnum } from "@/db/schema/match";
import { getStatusLabel } from "@/utils/status";
import { CalendarIcon, LoaderIcon } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useMatchesFilter } from "../_contexts/matches-filter";

export const MatchFilterDropdown = () => {
  const [openDialog, setOpenDialog] = useState(false);

  const {
    state: { dateRange, status: currentStatus },
    setStatus,
    setDateRange,
    applyFilters,
    resetFilters,
  } = useMatchesFilter();

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const handleApplyFilters = () => {
    applyFilters();
    setOpenDialog(false);
  };

  const handleResetFilters = () => {
    resetFilters();
    setOpenDialog(false);
  };

  return (
    <ResponsiveDialog
      title="Filtros de partidas"
      description="Ajuste os filtros para encontrar partidas específicas."
      className="sm:max-w-full md:max-w-lg"
      open={openDialog}
      onOpenChange={setOpenDialog}
      content={
        <div className="flex flex-col gap-4">
          <section>
            <div className="mb-4 flex items-center gap-2 text-sm">
              <LoaderIcon className="text-muted-foreground size-4" />
              Status
            </div>
            <div className="flex flex-wrap">
              {matchStatusEnum.enumValues.map((status) => (
                <div key={status} className="mr-3 mb-2">
                  <Label
                    htmlFor={status}
                    className="peer-[data-state=checked]:bg-primary *:data-[state=checked]:border-primary flex cursor-pointer items-center gap-2 rounded-lg border p-2"
                  >
                    <Checkbox
                      id={status}
                      checked={currentStatus.includes(status)}
                      onCheckedChange={() => setStatus(status)}
                    />
                    <span>{getStatusLabel(status)}</span>
                  </Label>
                </div>
              ))}
            </div>
          </section>
          <section>
            <div className="mb-4 flex items-center gap-2 text-sm">
              <CalendarIcon className="text-muted-foreground size-4" />
              Data
            </div>
            <div className="flex w-full">
              <DatePicker
                label="Início"
                className="w-full"
                classNames={{
                  trigger: "rounded-r-none ",
                }}
                maxDate={dateRange.to}
                value={dateRange.from}
                onChange={(date) =>
                  handleDateRangeChange({
                    from: date,
                    to: dateRange.to,
                  })
                }
              />
              <DatePicker
                label="Fim"
                className="w-full"
                classNames={{
                  trigger: "rounded-l-none",
                }}
                minDate={dateRange.from}
                value={dateRange.to}
                onChange={(date) =>
                  handleDateRangeChange({
                    from: dateRange.from,
                    to: date,
                  })
                }
              />
            </div>
          </section>
          <footer className="mt-2 flex w-full justify-end gap-2">
            <Button variant="secondary" onClick={handleResetFilters}>
              Resetar filtros
            </Button>
            <Button onClick={handleApplyFilters}>Aplicar filtros</Button>
          </footer>
        </div>
      }
    >
      <Button variant="outline">Filtros</Button>
    </ResponsiveDialog>
  );
};
