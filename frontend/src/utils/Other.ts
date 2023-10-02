export interface EnumObject {
  [enumValue: number]: string;
}

export function getEnumValues(e: EnumObject): string[] {
  return Object.keys(e).map((_, idx: number): string => e[idx]);
}

