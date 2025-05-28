#!/usr/bin/env node
import { Command } from "commander";
import { printTree } from "./strucview";
import { StrucViewCommandOptions, isNumber } from "./types";

const program = new Command();

program.name("dummie").description("dummie-tools CLI").version("1.0.0");

program
  .command("strucview")
  .description("print directory tree view")
  .option("-l, --level <n>", 'max depth level (or use "la" for all)', "3")
  .option("-d, --dir <path>", "directory to scan", ".")
  .action(async (opts: StrucViewCommandOptions) => {
    // Validate and process the level option
    let maxDepth: number;
    if (opts.level === "la") {
      maxDepth = Infinity;
    } else {
      const parsedLevel = parseInt(opts.level, 10);
      if (!isNumber(parsedLevel) || parsedLevel < 0) {
        console.error("Error: Level must be a non-negative number or 'la'");
        process.exit(1);
      }
      maxDepth = parsedLevel;
    }

    // Validate the directory path
    const dir = opts.dir;
    if (typeof dir !== "string") {
      console.error("Error: Directory must be a string");
      process.exit(1);
    }

    // Execute the command
    try {
      await printTree({
        dirPath: dir,
        maxDepth,
      });
    } catch (error) {
      console.error(
        `Error processing directory: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      process.exit(1);
    }
  });

program.parse(process.argv);
