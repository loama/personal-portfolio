import { expect, test } from "bun:test";
import { runInNewContext } from "node:vm";
import { THEME_INIT_SCRIPT, THEME_STORAGE_KEY, THEME_STYLE, THEME_STYLE_ID } from "../../src/lib/theme";

function initialize(stored: string | null, blocked = false) {
  let scheme = "light dark";
  const reads: string[] = [];
  const element = {
    textContent: THEME_STYLE,
    sheet: {
      cssRules: [{
        style: {
          setProperty(property: string, value: string) {
            expect(property).toBe("color-scheme");
            scheme = value;
          },
        },
      }],
    },
  };
  runInNewContext(THEME_INIT_SCRIPT, {
    localStorage: {
      getItem(key: string) {
        reads.push(key);
        if (blocked) throw new Error("Storage unavailable");
        return stored;
      },
    },
    document: {
      getElementById(id: string) {
        expect(id).toBe(THEME_STYLE_ID);
        return element;
      },
    },
  });
  expect(reads).toEqual([THEME_STORAGE_KEY]);
  expect(element.textContent).toBe(THEME_STYLE);
  return scheme;
}

test.each([
  ["light", "light"],
  ["dark", "dark"],
  ["device", "light dark"],
  [null, "light dark"],
  ["unexpected preference", "light dark"],
])("initializes stored preference %s through CSSOM without changing server text", (stored, expected) => {
  expect(initialize(stored)).toBe(expected);
});

test("uses the device scheme when storage is unavailable", () => {
  expect(initialize("dark", true)).toBe("light dark");
});
