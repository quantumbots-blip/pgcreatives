import { test } from "node:test";
import assert from "node:assert/strict";
import { densifyDays } from "../src/lib/insights.ts";
import { reachability, compactAge } from "../src/app/(admin)/admin/format.ts";

/**
 * The two pieces of logic behind the charts and cards that were reading
 * wrong: a series that only contained the days something happened, and a
 * card that claimed a lead had a phone number when nothing could dial it.
 */

const from = (iso) => new Date(`${iso}T12:00:00Z`);

test("a range with nothing in it still has one entry per day", () => {
  const out = densifyDays([], from("2026-09-01"), from("2026-09-05"), { count: 0 });
  assert.equal(out.length, 5);
  assert.deepEqual(
    out.map((d) => d.day),
    ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05"],
  );
  assert.ok(out.every((d) => d.count === 0));
});

test("one busy day in a long range stays one column, not the whole chart", () => {
  const out = densifyDays(
    [{ day: "2026-09-03", count: 1 }],
    from("2026-09-01"),
    from("2026-09-30"),
    { count: 0 },
  );
  assert.equal(out.length, 30);
  assert.equal(out.filter((d) => d.count > 0).length, 1);
  // The bar has to land on its own date rather than at the start.
  assert.equal(out.findIndex((d) => d.count > 0), 2);
});

test("days that carry data keep every field they arrived with", () => {
  const out = densifyDays(
    [{ day: "2026-09-02", views: 40, visitors: 30 }],
    from("2026-09-01"),
    from("2026-09-03"),
    { views: 0, visitors: 0 },
  );
  assert.deepEqual(out, [
    { day: "2026-09-01", views: 0, visitors: 0 },
    { day: "2026-09-02", views: 40, visitors: 30 },
    { day: "2026-09-03", views: 0, visitors: 0 },
  ]);
});

test("the walk does not stall or double a day across a daylight saving change", () => {
  // Wisconsin springs forward on 8 March 2026 and falls back on 1 November.
  for (const [start, end, expected] of [
    ["2026-03-06", "2026-03-10", 5],
    ["2026-10-30", "2026-11-03", 5],
  ]) {
    const out = densifyDays([], from(start), from(end), { count: 0 });
    assert.equal(out.length, expected, `${start} to ${end}`);
    assert.equal(new Set(out.map((d) => d.day)).size, expected, `${start} duplicated a day`);
  }
});

test("a lead with both a number and an address wears no warning", () => {
  const r = reachability({ phone: "(920) 591-1323", email: "a@b.com" });
  assert.equal(r.callable, true);
  assert.equal(r.gap, null);
});

test("a number too short to dial is reported as such rather than as a phone", () => {
  // Nine digits: a real number in Spain, not something tel: can hand to iOS.
  const r = reachability({ phone: "689486043", email: "a@b.com" });
  assert.equal(r.callable, false);
  assert.equal(r.phone, "689486043", "the digits they typed are still worth showing");
  assert.equal(r.gap?.label, "Number will not dial");
});

test("the gap names what is missing", () => {
  assert.equal(reachability({ email: "a@b.com" }).gap?.label, "Email only");
  assert.equal(reachability({ phone: "9205911323" }).gap?.label, "Phone only");
  assert.equal(reachability({}).gap?.label, "No way to reach them");
});

test("the age on a badge drops the word the badge does not have room for", () => {
  const hoursAgo = (n) => new Date(Date.now() - n * 3_600_000).toISOString();
  assert.equal(compactAge(hoursAgo(3)), "3h");
  assert.equal(compactAge(hoursAgo(72)), "3d");
  assert.ok(!compactAge(hoursAgo(72)).includes("ago"));
});

test("a thirty day range is thirty columns, whatever the clock says in UTC", () => {
  // Late evening in Wisconsin is already tomorrow in UTC, which is where an
  // earlier version lost a day: the start resolved as a UTC date and the end
  // as a Wisconsin one.
  const evening = new Date("2026-09-09T03:00:00Z"); // 10pm Sep 8 in Wisconsin
  const out = densifyDays([], new Date(evening.getTime() - 29 * 86_400_000), evening, {
    count: 0,
  });
  assert.equal(out.length, 30);
  assert.equal(out.at(-1).day, "2026-09-08");
});
