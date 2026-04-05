const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DOTS,
  YEAR_DAYS,
  getDotSnapshot,
  getLifeSummary,
  getProgressSnapshot,
  formatRemaining
} = require("./shared.js");

function approx(actual, expected, message) {
  assert.ok(
    Math.abs(actual - expected) < 1e-6,
    message + " (expected " + expected + ", got " + actual + ")"
  );
}

test("keeps seven shared dots with the existing labels", () => {
  assert.equal(DOTS.length, 7);
  assert.deepEqual(
    DOTS.map((dot) => dot.label),
    ["LIFE", "YR", "MO", "WK", "DAY", "HR", "MIN"]
  );
});

test("calculates lifetime progress at 0%, 50%, and near 100%", () => {
  const atBirth = getProgressSnapshot({
    birthDate: "2020-01-01",
    lifespan: 80,
    now: new Date(2020, 0, 1, 0, 0, 0, 0)
  });
  assert.equal(atBirth.progress.lifetime, 0);

  const midway = getProgressSnapshot({
    birthDate: "2000-01-01",
    lifespan: 40,
    now: new Date(2020, 0, 1, 0, 0, 0, 0)
  });
  approx(midway.progress.lifetime, 0.5, "mid-life progress should be 50%");

  const nearlyDone = getProgressSnapshot({
    birthDate: "2000-01-01",
    lifespan: 20,
    now: new Date(2019, 11, 31, 12, 0, 0, 0)
  });
  assert.ok(nearlyDone.progress.lifetime > 0.99);
  assert.ok(nearlyDone.progress.lifetime < 1);
});

test("clamps future and expired lifetimes safely", () => {
  const future = getProgressSnapshot({
    birthDate: "2030-01-01",
    lifespan: 80,
    now: new Date(2024, 0, 1, 0, 0, 0, 0)
  });
  assert.equal(future.progress.lifetime, 0);

  const futureSummary = getLifeSummary({
    birthDate: "2030-01-01",
    lifespan: 80,
    now: new Date(2024, 0, 1, 0, 0, 0, 0)
  });
  assert.equal(futureSummary.remainingDays, Math.floor(80 * YEAR_DAYS));
  assert.equal(formatRemaining("lifetime", future), "~80y 0m left");

  const expired = getProgressSnapshot({
    birthDate: "1900-01-01",
    lifespan: 1,
    now: new Date(1950, 0, 1, 0, 0, 0, 0)
  });
  assert.equal(expired.progress.lifetime, 1);
  assert.equal(getLifeSummary({
    birthDate: "1900-01-01",
    lifespan: 1,
    now: new Date(1950, 0, 1, 0, 0, 0, 0)
  }).remainingDays, 0);
  assert.equal(formatRemaining("lifetime", expired), "~0m left");
});

test("handles month-end and week-start boundaries", () => {
  const monthEdge = getProgressSnapshot({
    birthDate: "2000-01-01",
    lifespan: 80,
    now: new Date(2024, 0, 31, 12, 0, 0, 0)
  });
  approx(monthEdge.progress.month, 30.5 / 31, "month progress should respect 31-day months");

  const mondayStart = getProgressSnapshot({
    birthDate: "2000-01-01",
    lifespan: 80,
    now: new Date(2024, 0, 1, 0, 0, 0, 0)
  });
  assert.equal(mondayStart.progress.week, 0);

  const tuesdayNoon = getProgressSnapshot({
    birthDate: "2000-01-01",
    lifespan: 80,
    now: new Date(2024, 0, 2, 12, 0, 0, 0)
  });
  approx(tuesdayNoon.progress.week, 1.5 / 7, "week progress should start on Monday");
  assert.equal(formatRemaining("week", tuesdayNoon), "5d 12h left");
});

test("tracks day, hour, and minute rollover accurately", () => {
  const lateHour = getProgressSnapshot({
    birthDate: "2000-01-01",
    lifespan: 80,
    now: new Date(2024, 1, 29, 12, 59, 30, 0)
  });

  approx(
    lateHour.progress.day,
    (12 * 3600 + 59 * 60 + 30) / 86400,
    "day progress should include hours, minutes, and seconds"
  );
  approx(lateHour.progress.hour, 3570 / 3600, "hour progress should include seconds");
  approx(lateHour.progress.minute, 0.5, "minute progress should land at 50%");

  assert.equal(formatRemaining("day", lateHour), "11h 0m left");
  assert.equal(formatRemaining("hour", lateHour), "0m 30s left");
  assert.equal(formatRemaining("minute", lateHour), "30s left");
});

test("produces stable dot snapshots without NaN or empty remaining text", () => {
  const dots = getDotSnapshot({
    birthDate: "2000-01-01",
    lifespan: 80,
    now: new Date(2024, 5, 15, 9, 45, 12, 0)
  });

  assert.equal(dots.length, 7);
  dots.forEach((dot) => {
    assert.ok(Number.isFinite(dot.percentage));
    assert.ok(dot.remaining.length > 0);
    assert.equal(dot.remaining.includes("NaN"), false);
  });
});
