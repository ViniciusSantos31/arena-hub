import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const formatDate = (
  date: Date | string,
  format: string = "DD/MM/YYYY",
): string => {
  return dayjs(date).format(format);
};

export const formatDateUTC = (
  date: Date | string,
  format: string = "DD/MM/YYYY",
): string => {
  return dayjs.utc(date).format(format);
};

export const parseDate = (
  dateString: string,
  format: string = "DD/MM/YYYY",
): Date => {
  return dayjs(dateString, format).toDate();
};

export const isValidDate = (date: Date | string): boolean => {
  return dayjs(date).isValid();
};

export const addDays = (date: Date | string, days: number): Date => {
  return dayjs(date).add(days, "day").toDate();
};

export const subtractDays = (date: Date | string, days: number): Date => {
  return dayjs(date).subtract(days, "day").toDate();
};

export const differenceInDays = (
  date1: Date | string,
  date2: Date | string,
): number => {
  return dayjs(date1).diff(dayjs(date2), "day");
};

export const startOfDay = (date: Date | string): Date => {
  return dayjs(date).startOf("day").toDate();
};

export const endOfDay = (date: Date | string): Date => {
  return dayjs(date).endOf("day").toDate();
};

export const toISOString = (date: Date | string): string => {
  return dayjs(date).toISOString();
};

export const fromISOString = (isoString: string): Date => {
  return dayjs(isoString).toDate();
};

export const toUTCDate = (date: Date | string): Date => {
  return dayjs.utc(date).toDate();
};

export const fromUTCDate = (date: Date | string): Date => {
  return dayjs(date).local().toDate();
};
