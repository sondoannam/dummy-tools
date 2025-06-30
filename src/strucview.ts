import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { PrintTreeOptions, EntryInfo } from "./types";

// Default directories to consider for skipping
const DEFAULT_SKIP_DIRS = new Set(["node_modules", "next", "dist", "build", ".git", ".github"]);

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
 * Collect all directories that should be skipped based on DEFAULT_SKIP_DIRS and user input
 */
async function collectSkipDirectories(
  rootPath: string, 
  maxDepth: number, 
  initialSkipDirs: Set<string>,
  interactive: boolean
): Promise<Set<string>> {
  // Start with user-provided skip directories
  const skipDirs = new Set<string>(initialSkipDirs);
  
  // If not interactive, just add all default skip directories
  if (!interactive) {
    return skipDirs;
  }
  
  // Otherwise, we need to scan the directory to find all directories that match DEFAULT_SKIP_DIRS
  // and ask the user for each one
  async function scan(dirPath: string, depth: number = 0): Promise<void> {
    if (depth >= maxDepth) return;
    
    let entries: string[];
    try {
      entries = await fs.promises.readdir(dirPath);
    } catch {
      return;
    }

    // Process all directories first
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      try {
        const stats = await fs.promises.stat(fullPath);
        
        if (stats.isDirectory()) {
          // Check if this directory should be skipped
          const relativePath = path.relative(rootPath, fullPath);
          
          if (DEFAULT_SKIP_DIRS.has(entry) && !skipDirs.has(relativePath)) {
            // Ask user if they want to skip this directory
            const shouldSkip = await promptToSkip(entry);
            if (shouldSkip) {
              skipDirs.add(relativePath);
            } else {
              // If not skipping, scan its subdirectories
              await scan(fullPath, depth + 1);
            }
          } else {
            // Not a default skip directory, scan it
            await scan(fullPath, depth + 1);
          }
        }
      } catch {
        // Skip any errors
      }
    }
  }

  // Start scanning from the root
  await scan(rootPath);
  return skipDirs;
}

/**
 * Print directory tree with pre-determined skip directories
 */
async function printTreeWithSkips(
  dirPath: string, 
  maxDepth: number, 
  skipDirs: Set<string>,
  prefix = "",
  depth = 0
): Promise<void> {
  // Get the actual directory name
  const name = path.basename(path.resolve(dirPath));
  
  // Print the directory name only once at the beginning
  if (depth === 0) {
    console.log(name);
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

  // Filter out directories to skip
  const visibleEntries = filteredEntries.filter(({ entry }) => !skipDirs.has(entry));

  const lastIndex = visibleEntries.length - 1;

  for (let i = 0; i < visibleEntries.length; i++) {
    const { entry, fullPath, isDirectory } = visibleEntries[i];
    const isLast = i === lastIndex;
    const branch = isLast ? "└── " : "├── ";
    const childPrefix = prefix + (isLast ? "    " : "│   ");
    const linePrefix = prefix + branch;

    if (isDirectory) {
      // Print the directory name
      console.log(`${linePrefix}${entry}`);
      
      // Show placeholder if next level would exceed max depth
      if (depth + 1 === maxDepth) {
        console.log(`${childPrefix}└── [...]`);
      } else {
        // Otherwise recursively print the contents
        await printTreeWithSkips(fullPath, maxDepth, skipDirs, childPrefix, depth + 1);
      }
    } else {
      // Print the file name
      console.log(`${linePrefix}${entry}`);
    }
  }
}

/**
 * Main function to print directory tree with interactive skipping
 */
export async function printTree({
  dirPath,
  maxDepth,
  skipDirs = new Set(),
  interactive = true, // Default to interactive mode for better UX
}: PrintTreeOptions): Promise<void> {
  // First collect all directories to skip based on user input
  const allSkipDirs = await collectSkipDirectories(dirPath, maxDepth, skipDirs, interactive);
  
  // Then print the tree with all skip choices applied
  await printTreeWithSkips(dirPath, maxDepth, allSkipDirs);
}
