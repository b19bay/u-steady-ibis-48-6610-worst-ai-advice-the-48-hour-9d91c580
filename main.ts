import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "To fix the slow database, delete the indexes. The queries will have nothing left to slow them down.";

// The competition gate, enforced here before writing so a bad text can never
// be submitted by accident: 1-140 Unicode code points, not only whitespace,
// a single line, no trailing newline.
function assertEntryWithinGates(text: string): void {
  const points = [...text].length;
  if (points < 1 || points > 140) {
    throw new Error(`entry is ${points} code points; the gate allows 1-140`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (text.includes("\n")) {
    throw new Error("entry must be a single line");
  }
}

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR;
  if (!outDir) {
    throw new Error("MAKEFUN_OUTPUT_DIR is not set");
  }
  assertEntryWithinGates(LINE);
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, LINE, "utf8");
  // Read back and assert byte-identical: what the judge reads is exactly
  // the line above, nothing more. The size check catches a stray BOM or
  // trailing newline that a string comparison could in principle miss
  // if the runtime ever normalized line endings on read.
  const back = readFileSync(target, "utf8");
  if (back !== LINE) {
    throw new Error("read-back mismatch: entry.txt differs from the line");
  }
  if (statSync(target).size !== Buffer.byteLength(LINE, "utf8")) {
    throw new Error("size mismatch: entry.txt is not exactly the line");
  }
}

main();
