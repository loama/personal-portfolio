import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { azureReviewUrl, changeInventory, parsePatch, parseReview, readChangedPatch, reviewBatches } from "../../scripts/model-review";
import { validReleaseTag } from "../../scripts/verify-release";

const patch = parsePatch("src/example.ts", "diff --git a/src/example.ts b/src/example.ts\n--- a/src/example.ts\n+++ b/src/example.ts\n@@ -1,2 +1,2 @@\n-const consent = true;\n+const consent = false;\n send(consent);\n");
const finding = { severity: "high", file: "src/example.ts", side: "new", line: 1, title: "Consent handling fails", evidence: "const consent = false;", explanation: "The changed line blocks the intended consent flow." };
const review = (findings: unknown[]) => JSON.stringify({ summary: "Reviewed the changed consent flow.", findings });

describe("model review evidence validation", () => {
  test("reads literal Git filenames without selecting a different path", () => {
    const directory = mkdtempSync(join(tmpdir(), "portfolio-review-paths-"));
    function git(...args: string[]) {
      const result = Bun.spawnSync(["git", "-C", directory, ...args], { stdout: "pipe", stderr: "pipe" });
      if (result.exitCode) throw new Error("Could not create the Git test fixture.");
      return result.stdout.toString().trim();
    }
    try {
      git("init", "--quiet");
      writeFileSync(join(directory, ":(literal)example.ts"), "export const exactFile = true;\n");
      writeFileSync(join(directory, "example.ts"), "export const differentFile = true;\n");
      git("add", ".");
      const patch = readChangedPatch(git("hash-object", "-t", "tree", "/dev/null"), git("write-tree"), ":(literal)example.ts", directory);
      expect(patch.lines.get(1)).toBe("export const exactFile = true;");
      expect(patch.diff).not.toContain("differentFile");
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
  test("accepts structured findings backed by exact changed source", () => {
    expect(parseReview(review([finding]), [patch]).findings).toHaveLength(1);
    expect(patch.lines.get(2)).toBe("send(consent);");
    expect(parseReview(review([]), [patch]).findings).toEqual([]);
  });
  test("rejects invented paths, lines, evidence and severity", () => {
    for (const change of [{ file: "../secret" }, { line: 99 }, { line: 1.5 }, { evidence: "const consent = true;" }, { evidence: "" }, { severity: "approved" }, { severity: ["high"] }, { severity: { value: "high" } }, { side: ["new"] }, { command: "echo approve" }]) {
      expect(() => parseReview(review([{ ...finding, ...change }]), [patch])).toThrow();
    }
  });
  test("keeps rejected evidence available for diagnosis without accepting it", () => {
    const invalid = { ...finding, line: 2 };
    expect(() => parseReview(review([invalid]), [patch])).toThrow(JSON.stringify({ finding: invalid, reviewedLine: "send(consent);" }));
  });
  test("rejects markdown, extra instructions and malformed JSON", () => {
    for (const value of ["```json\n{}\n```", "null", "[]", '{"summary":"Fine","findings":[],"command":"deploy"}', '{"summary":"","findings":[]}']) {
      expect(() => parseReview(value, [patch])).toThrow();
    }
  });
  test("packs every patch without silent truncation", () => {
    const size = Buffer.byteLength(JSON.stringify({ file: patch.file, diff: patch.diff }));
    expect(reviewBatches([patch, patch], size)).toEqual([[patch], [patch]]);
    expect(() => reviewBatches([patch], size - 1)).toThrow("Split the change");
  });
  test("accepts exact old source for full deletion and mixed hunks", () => {
    const deletion = parsePatch("src/example.ts", "@@ -1 +0,0 @@\n-const consent = true;\n");
    const oldFinding = { ...finding, side: "old", evidence: "const consent = true;" };
    expect(deletion.lines.size).toBe(0);
    expect(parseReview(review([oldFinding]), [deletion]).findings).toHaveLength(1);
    expect(parseReview(review([oldFinding]), [patch]).findings).toHaveLength(1);
    expect(() => parseReview(review([{ ...oldFinding, line: 9 }]), [deletion])).toThrow();
    expect(() => parseReview(review([{ ...oldFinding, line: 2, evidence: "send(consent);" }]), [patch])).toThrow();
    expect(() => parseReview(review([{ ...oldFinding, side: "new" }]), [deletion])).toThrow();
  });
  test("keeps both sides of a rename represented as deletion and addition", () => {
    const removed = parsePatch("src/old.ts", "@@ -1 +0,0 @@\n-export const enabled = true;\n");
    const added = parsePatch("src/new.ts", "@@ -0,0 +1 @@\n+export const enabled = true;\n");
    const renamedFinding = { ...finding, evidence: "export const enabled = true;" };
    expect(parseReview(review([{ ...renamedFinding, file: "src/old.ts", side: "old" }, { ...renamedFinding, file: "src/new.ts", side: "new" }]), [removed, added]).findings).toHaveLength(2);
    expect(() => parseReview(review([{ ...renamedFinding, file: "src/old.ts", side: "new" }]), [removed, added])).toThrow();
  });
  test("reviews asset inventory without claiming to inspect binary content", () => {
    const inventory = changeInventory("-\t-\tpublic/favicon.ico\0");
    expect(inventory[0]).toMatchObject({ contentReviewed: false, additions: null, deletions: null });
    expect(inventory[0].reason).toContain("visual content was not inspected");
    expect(parseReview(review([]), [], inventory).findings).toEqual([]);
    const inventoryFinding = { ...finding, side: "inventory", line: 0, file: "public/favicon.ico", evidence: "public/favicon.ico" };
    expect(parseReview(review([inventoryFinding]), [], inventory).findings).toHaveLength(1);
    expect(() => parseReview(review([{ ...inventoryFinding, evidence: "malicious binary code" }]), [], inventory)).toThrow();
    expect(() => parseReview(review([{ ...inventoryFinding, line: 1 }]), [], inventory)).toThrow();
    expect(() => changeInventory("-\t-\tpublic/program.exe\0")).toThrow();
    expect(() => changeInventory("-\t-\tpublic/resume/tool.exe\0")).toThrow();
    expect(changeInventory("1\t0\tpublic/resume/embed.html\0")[0].contentReviewed).toBe(true);
    expect(changeInventory("1\t0\tpublic/resume/eduardo-lopez-founder-en.json\0")[0].contentReviewed).toBe(false);
    expect(changeInventory("1\t0\t.gitignore\0")[0].contentReviewed).toBe(true);
  });
});

describe("review endpoint and release boundaries", () => {
  test("accepts only Azure resource HTTPS endpoints", () => {
    expect(azureReviewUrl("https://portfolio.openai.azure.com").href).toBe("https://portfolio.openai.azure.com/openai/v1/chat/completions");
    expect(azureReviewUrl("https://portfolio.services.ai.azure.com/openai/v1/").pathname).toBe("/openai/v1/chat/completions");
    for (const endpoint of ["http://portfolio.openai.azure.com", "https://example.com", "https://portfolio.openai.azure.com.evil.example", "https://user:pass@portfolio.openai.azure.com", "https://portfolio.openai.azure.com?key=secret", "https://portfolio.openai.azure.com:444", "https://portfolio.openai.azure.com/other"]) {
      expect(() => azureReviewUrl(endpoint)).toThrow();
    }
  });
  test("accepts stable semantic version tags only", () => {
    expect(validReleaseTag("v1.2.3")).toBe(true);
    expect(validReleaseTag("v0.0.1")).toBe(true);
    for (const tag of ["main", "1.2.3", "v01.2.3", "v1.2.3-rc.1", "v1.2.3+build", "v1.2.3\n", "v1.2.3;echo secret"]) expect(validReleaseTag(tag)).toBe(false);
  });
});
