import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { PrintTreeOptions, EntryInfo } from "./types";

// Default directories to consider for skipping
const DEFAULT_SKIP_DIRS = new Set(["node_modules", "next", "dist", "build", ".git"]);

// Cache for user prompt responses to avoid asking multiple times for the same directory
const userSkipChoices = new Map<string, boolean>();

/**
 * Prompt the user if they want to skip a specific directory
 */
async function promptToSkip(dirName: string): Promise<boolean> {
  // If we already have a user choice for this directory, use it
  if (userSkipChoices.has(dirName)) {
    return userSkipChoices.get(dirName)!;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<boolean>((resolve) => {
    rl.question(`Skip directory "${dirName}"? (y/n): `, (answer) => {
      const shouldSkip = answer.toLowerCase().startsWith("y");
      // Cache the response for future occurrences
      userSkipChoices.set(dirName, shouldSkip);
      rl.close();
      resolve(shouldSkip);
    });
  });
}

/**
 * Recursively prints a directory tree up to a specified depth,
 * with a placeholder "[...]" when further nesting is omitted or skipped.
 */
export async function printTree({
  dirPath,
  maxDepth,
  prefix = "",
  depth = 0,
  skipDirs = new Set(),
  interactive = true, // Default to interactive mode for better UX
}: PrintTreeOptions): Promise<void> {
  // Get the actual directory name
  const name = path.basename(path.resolve(dirPath));
  // Only print the directory name when it's the first call (depth 0) or for subdirectories
  if (depth === 0 || prefix !== "") {
    console.log(prefix + name);
  }

  // If at or beyond max depth, we stop here
  if (depth >= maxDepth) return;

  let entries: string[];
  try {
    entries = await fs.promises.readdir(dirPath);
  } catch {
    return;
  }
  // Get file info for all entries
  const entryInfos = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dirPath, entry);
      try {
        const stats = await fs.promises.stat(fullPath);
        return {
          entry,
          fullPath,
          stats,
          isDirectory: stats.isDirectory(),
        } as EntryInfo;
      } catch {
        return null;
      }
    })
  );

  // Filter out failed stats and sort: directories first, then files
  const filteredEntries = entryInfos
    .filter((info): info is NonNullable<typeof info> => info !== null)
    .sort((a, b) => {
      // First sort by type (directories first)
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      // Then alphabetically within each type
      return a.entry.localeCompare(b.entry);
    });

  const lastIndex = filteredEntries.length - 1;

  for (let i = 0; i < filteredEntries.length; i++) {
    const { entry, fullPath, stats, isDirectory } = filteredEntries[i];
    const isLast = i === lastIndex;
    const branch = isLast ? "└── " : "├── ";
    const childPrefix = prefix + (depth > 0 ? (isLast ? "    " : "│   ") : "");
    const linePrefix = childPrefix + branch;

    if (isDirectory) {
      // Check if directory should be skipped
      let shouldSkip = skipDirs.has(entry);
      
      // If not explicitly skipped and interactive mode is on, prompt for default dirs
      if (!shouldSkip && interactive && DEFAULT_SKIP_DIRS.has(entry)) {
        shouldSkip = await promptToSkip(entry);
      } else if (DEFAULT_SKIP_DIRS.has(entry) && !interactive) {
        // In non-interactive mode, use default behavior
        shouldSkip = true;
      }
      
      // If directory should be skipped, just skip it completely (don't print anything)
      if (shouldSkip) {
        continue;
      }

      // We've already handled the interactive case for default dirs above

      // Show placeholder if next level would exceed
      if (depth + 1 === maxDepth) {
        console.log(linePrefix + entry);
        console.log(
          childPrefix + (isLast ? "    " : "│   ") + "└── " + "[...]"
        );
      } else {
        console.log(linePrefix + entry);
        await printTree({
          dirPath: fullPath,
          maxDepth,
          prefix: childPrefix,
          depth: depth + 1,
          skipDirs,
          interactive,
        });
      }
    } else {
      console.log(linePrefix + entry);
    }
  }
}
