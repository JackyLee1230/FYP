export interface EnumObject {
  [enumValue: number]: string;
}

export function getEnumValues(e: EnumObject): string[] {
  return Object.keys(e).map((_, idx: number): string => e[idx]);
}

// given an integer that represents minutes, if its greater than 1 day, show as Day + Hours, if its greater than hours, show Hours + Minutes, else show Minutes
export function playTimeString(minutes: number): string {
  if (minutes <= 1) {
    return "Unknown Playtime";
  }
  if (minutes > 1440) {
    return `${Math.floor(minutes / 1440)} Days ${Math.floor(
      (minutes % 1440) / 60
    )} Hours Played`;
  } else if (minutes > 60) {
    if (minutes % 60 === 0) {
      return `${Math.floor(minutes / 60)} Hours Played`;
    }
    return `${Math.floor(minutes / 60)} Hours ${minutes % 60} Minutes Played`;
  } else {
    return `${minutes} Minutes Played`;
  }
}

