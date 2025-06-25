/**
 * Type definitions for dummie-tools
 */

/**
 * Options for the printTree function
 */
export interface PrintTreeOptions {
  /**
   * The root directory to print
   */
  dirPath: string;

  /**
   * Maximum depth (0-based) to traverse; Infinity for full depth
   */
  maxDepth: number;

  /**
   * Prefix for formatting each line
   */
  prefix?: string;

  /**
   * Current recursion depth
   */
  depth?: number;
}

/**
 * Entry info with file metadata
 */
export interface EntryInfo {
  /**
   * Entry name
   */
  entry: string;

  /**
   * Full path to the entry
   */
  fullPath: string;

  /**
   * File stats
   */
  stats: import("fs").Stats;

  /**
   * Whether the entry is a directory
   */
  isDirectory: boolean;
}

/**
 * Options for the strucview command
 */
export interface StrucViewCommandOptions {
  /**
   * Maximum depth level to display
   * Use "la" for all levels or a number
   */
  level: string;

  /**
   * Directory path to scan
   */
  dir: string;
}

/**
 * Base interface for all command options
 */
export interface BaseCommandOptions {
  /**
   * Parent command options, if any
   */
  parent?: Record<string, unknown>;
}

/**
 * Type guard to check if a value is a string
 *
 * @param value - The value to check
 * @returns True if the value is a string, false otherwise
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Type guard to check if a value is a number
 *
 * @param value - The value to check
 * @returns True if the value is a number, false otherwise
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Type guard to check if a value is an object
 *
 * @param value - The value to check
 * @returns True if the value is an object, false otherwise
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Options for the translate command
 */
export interface TranslateCommandOptions {
  from: string;
  to: string;
}
