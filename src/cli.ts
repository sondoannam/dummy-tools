#!/usr/bin/env node
import { Command } from "commander";
import { printTree } from "./strucview";

const program = new Command();

program.name("dummie").description("dummy-tools CLI").version("1.0.0");

program
  .command("strucview")
  .description("print directory tree view")
  .option("-l, --level <n>", 'max depth level (or use "la" for all)', "3")
  .option("-d, --dir <path>", "directory to scan", ".")
  .action(async (opts) => {
    let maxDepth: number;
    if (opts.level === "la") maxDepth = Infinity;
    else maxDepth = parseInt(opts.level, 10) || 3;

    const dir = opts.dir;
    await printTree(dir, maxDepth);
  });

program.parse(process.argv);
