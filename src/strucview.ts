import * as fs from "fs";
import * as path from "path";
import { PrintTreeOptions, EntryInfo } from "./types";

// Directories to always collapse
const SKIP_DIRS = new Set(["node_modules", "next", "dist", "build", ".git"]);

/**
 * Recursively prints a directory tree up to a specified depth,
 * with a placeholder "[...]" when further nesting is omitted or skipped.
 */
export async function printTree({
  dirPath,
  maxDepth,
  prefix = "",
  depth = 0,
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
      // Always collapse certain folders
      if (SKIP_DIRS.has(entry)) {
        console.log(linePrefix + entry);
        console.log(
          childPrefix + (isLast ? "    " : "│   ") + "└── " + "[...]"
        );
        continue;
      }

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
        });
      }
    } else {
      console.log(linePrefix + entry);
    }
  }
}
