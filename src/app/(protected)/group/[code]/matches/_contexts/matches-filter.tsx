"use client";

import { listMatches } from "@/actions/match/list";
import { queryClient } from "@/lib/react-query";
import { Status } from "@/utils/status";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createContext, ReactNode, useContext, useReducer } from "react";
import { DateRange } from "react-day-picker";

interface MatchesFilterState {
  status: Status[];
  dateRange: DateRange;
}

type MatchesFilterAction =
  | { type: "SET_STATUS"; payload: Status[] }
  | { type: "SET_DATE_RANGE"; payload: DateRange }
  | { type: "RESET_FILTERS" };

const initialState: MatchesFilterState = {
  status: [
    "scheduled",
    "open_registration",
    "closed_registration",
    "team_sorted",
  ],
  dateRange: {
    from: undefined,
    to: undefined,
  },
};

function matchesFilterReducer(
  state: MatchesFilterState,
  action: MatchesFilterAction,
): MatchesFilterState {
  switch (action.type) {
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "SET_DATE_RANGE":
      return { ...state, dateRange: action.payload };
    case "RESET_FILTERS":
      return initialState;
    default:
      return state;
  }
}

interface MatchesFilterContextType {
  data: Awaited<ReturnType<typeof listMatches>> | undefined;
  isLoading: boolean;
  isError: boolean;
  state: MatchesFilterState;
  setStatus: (status: Status) => void;
  setDateRange: (range: DateRange) => void;
  resetFilters: () => void;
  applyFilters: () => void;
}

const MatchesFilterContext = createContext<
  MatchesFilterContextType | undefined
>(undefined);

interface MatchesFilterProviderProps {
  children: ReactNode;
  code: string;
}

export function MatchesFilterProvider({
  children,
  code,
}: MatchesFilterProviderProps) {
  const [state, dispatch] = useReducer(matchesFilterReducer, initialState);

  const setStatus = (status: Status) => {
    const isSelected = state.status.includes(status);
    if (isSelected) {
      const newStatus = state.status.filter((s) => s !== status);
      dispatch({ type: "SET_STATUS", payload: newStatus });
      return;
    }
    dispatch({ type: "SET_STATUS", payload: [...state.status, status] });
  };

  const setDateRange = (range: DateRange) => {
    dispatch({ type: "SET_DATE_RANGE", payload: range });
  };

  const resetFilters = () => {
    dispatch({ type: "RESET_FILTERS" });
    handleApplyFilters();
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["matches", code],
    enabled: !!code,
    queryFn: () => {
      const hasDateRange = state.dateRange.from && state.dateRange.to;
      return listMatches({
        code,
        filters: {
          dateRange: hasDateRange
            ? {
                dateFrom: state.dateRange.from,
                dateTo: state.dateRange.to,
              }
            : undefined,
          status: state.status,
        },
      });
    },
  });

  const { mutate } = useMutation({
    mutationKey: ["matches", code, state],
    mutationFn: (state: MatchesFilterState) => {
      return listMatches({
        code,
        filters: {
          dateRange: {
            dateFrom: state.dateRange.from,
            dateTo: state.dateRange.to,
          },
          status: state.status,
        },
      });
    },
    onSuccess(data) {
      queryClient.setQueriesData(
        {
          queryKey: ["matches", code],
        },
        data,
      );
    },
  });

  const handleApplyFilters = () => {
    mutate(state);
  };

  const handleResetFilters = () => {
    resetFilters();
    mutate(initialState);
  };

  const value: MatchesFilterContextType = {
    data,
    isLoading,
    isError,
    state,
    setStatus,
    setDateRange,
    resetFilters: handleResetFilters,
    applyFilters: handleApplyFilters,
  };

  return (
    <MatchesFilterContext.Provider value={value}>
      {children}
    </MatchesFilterContext.Provider>
  );
}

export function useMatchesFilter() {
  const context = useContext(MatchesFilterContext);
  if (context === undefined) {
    throw new Error(
      "useMatchesFilter must be used within a MatchesFilterProvider",
    );
  }
  return context;
}
