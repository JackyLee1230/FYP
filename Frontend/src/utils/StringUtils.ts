import { format } from "date-fns";

export function formatTime(time: string | undefined | null): string {
  if(time)
    return format(new Date(time), "yyyy-MM-dd HH:mm:ss");
  else{
    return "";
  }
}

