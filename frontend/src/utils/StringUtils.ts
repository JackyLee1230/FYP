import { format } from "date-fns";

export function formatTime(time: string): string {
  return format(new Date(time), "yyyy-MM-dd HH:mm:ss");
}

