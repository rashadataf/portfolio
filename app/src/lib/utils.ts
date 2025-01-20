import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const snakeToCamelMapCache: Record<string, string> = {};

export function toCamelCase<T>(snakeObj: Record<string, unknown>): T {
  const camelObj: Record<string, unknown> = {};

  for (const [snakeKey, snakeValue] of Object.entries(snakeObj)) {
    let camelKey = snakeToCamelMapCache[snakeKey];

    if (!camelKey) {
      const words = snakeKey.split('_');
      camelKey = words[0] + words.slice(1).map(word => (word === 'id' ? 'id' : word[0].toUpperCase() + word.slice(1))).join('');
      snakeToCamelMapCache[snakeKey] = camelKey;
    }

    if (snakeValue instanceof Date) {
      camelObj[camelKey] = snakeValue;
    }
    else if (typeof snakeValue === 'object' && snakeValue !== null) {
      if (Array.isArray(snakeValue)) {
        camelObj[camelKey] = snakeValue.map(item =>
          typeof item === 'object' && item !== null ? toCamelCase(item) : item
        );
      } else {
        camelObj[camelKey] = toCamelCase(snakeValue as Record<string, unknown>);
      }
    } else {
      camelObj[camelKey] = snakeValue;
    }
  }

  return camelObj as T;
}

const camelToSnakeMapCache: Record<string, string> = {};
export function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const snakeObj: Record<string, unknown> = {};

  for (const [camelKey, camelValue] of Object.entries(obj)) {
    let snakeKey = camelToSnakeMapCache[camelKey];
    if (!snakeKey) {
      snakeKey = camelKey.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      camelToSnakeMapCache[camelKey] = snakeKey;
    }

    if (typeof camelValue === 'object' && camelValue !== null) {
      if (Array.isArray(camelValue)) {
        snakeObj[snakeKey] = camelValue.map(item => (typeof item === 'object' && item !== null ? toSnakeCase(item) : item));
      } else {
        snakeObj[snakeKey] = toSnakeCase(camelValue as Record<string, unknown>);
      }
    } else {
      snakeObj[snakeKey] = camelValue;
    }
  }

  return snakeObj;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}