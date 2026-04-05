(function (root, factory) {
  const shared = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = shared;
  }

  root.LifeDotsShared = shared;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const HOUR_MS = 60 * 60 * 1000;
  const MINUTE_MS = 60 * 1000;
  const YEAR_DAYS = 365.25;
  const MONTH_DAYS = 30.44;

  const DOTS = Object.freeze([
    Object.freeze({ key: "lifetime", label: "LIFE", widgetSize: 30, popupSize: 24 }),
    Object.freeze({ key: "year", label: "YR", widgetSize: 26, popupSize: 20 }),
    Object.freeze({ key: "month", label: "MO", widgetSize: 24, popupSize: 18 }),
    Object.freeze({ key: "week", label: "WK", widgetSize: 22, popupSize: 17 }),
    Object.freeze({ key: "day", label: "DAY", widgetSize: 20, popupSize: 16 }),
    Object.freeze({ key: "hour", label: "HR", widgetSize: 18, popupSize: 14 }),
    Object.freeze({ key: "minute", label: "MIN", widgetSize: 16, popupSize: 12 })
  ]);

  function clamp01(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(1, value));
  }

  function toDate(value) {
    if (value instanceof Date) {
      return new Date(value.getTime());
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  function parseBirthDate(value) {
    if (!value) return null;
    const date = new Date(value + "T00:00:00");
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function toLifespanYears(value) {
    const lifespan = Number(value);
    return Number.isFinite(lifespan) && lifespan > 0 ? lifespan : 80;
  }

  function ceilRemainingDays(ms) {
    return Math.max(0, Math.ceil(ms / DAY_MS));
  }

  function getProgressSnapshot(options = {}) {
    const now = toDate(options.now || new Date());
    const birthDate = parseBirthDate(options.birthDate);
    const lifespan = toLifespanYears(options.lifespan);
    const totalLifetimeMs = lifespan * YEAR_DAYS * DAY_MS;
    const elapsedLifetimeMs = birthDate ? Math.max(0, now.getTime() - birthDate.getTime()) : 0;
    const remainingLifetimeMs = birthDate
      ? Math.max(0, totalLifetimeMs - elapsedLifetimeMs)
      : totalLifetimeMs;

    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekday = (now.getDay() + 6) % 7;
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - weekday);
    const weekEnd = new Date(weekStart.getTime() + 7 * DAY_MS);
    const dayEnd = new Date(dayStart.getTime() + DAY_MS);
    const hourEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours() + 1,
      0,
      0,
      0
    );
    const minuteEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes() + 1,
      0,
      0
    );

    return {
      now,
      birthDate,
      lifespan,
      totalLifetimeMs,
      elapsedLifetimeMs,
      remainingLifetimeMs,
      boundaries: {
        yearEnd,
        monthEnd,
        weekEnd,
        dayEnd,
        hourEnd,
        minuteEnd
      },
      progress: {
        lifetime: birthDate ? clamp01(elapsedLifetimeMs / totalLifetimeMs) : 0,
        year: clamp01((now - yearStart) / (yearEnd - yearStart)),
        month: clamp01((now - monthStart) / (monthEnd - monthStart)),
        week: clamp01((now - weekStart) / (weekEnd - weekStart)),
        day: clamp01((now - dayStart) / DAY_MS),
        hour: clamp01(
          (now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000) / 3600
        ),
        minute: clamp01((now.getSeconds() + now.getMilliseconds() / 1000) / 60)
      }
    };
  }

  function formatRemaining(key, snapshot) {
    const progress = snapshot.progress[key];
    const now = snapshot.now;

    switch (key) {
      case "lifetime": {
        const days = Math.max(0, Math.floor(snapshot.remainingLifetimeMs / DAY_MS));
        const years = Math.floor(days / YEAR_DAYS);
        const daysAfterYears = Math.max(0, days - Math.floor(years * YEAR_DAYS));
        const months = Math.floor(daysAfterYears / MONTH_DAYS);
        return years > 0 ? "~" + years + "y " + months + "m left" : "~" + months + "m left";
      }
      case "year":
        return ceilRemainingDays(snapshot.boundaries.yearEnd - now) + " days left";
      case "month":
        return ceilRemainingDays(snapshot.boundaries.monthEnd - now) + " days left";
      case "week": {
        const remainingHours = Math.max(0, Math.floor((snapshot.boundaries.weekEnd - now) / HOUR_MS));
        return Math.floor(remainingHours / 24) + "d " + (remainingHours % 24) + "h left";
      }
      case "day": {
        const remainingMinutes = Math.max(0, Math.floor((snapshot.boundaries.dayEnd - now) / MINUTE_MS));
        return Math.floor(remainingMinutes / 60) + "h " + (remainingMinutes % 60) + "m left";
      }
      case "hour": {
        const remainingSeconds = Math.max(0, Math.floor((snapshot.boundaries.hourEnd - now) / 1000));
        return Math.floor(remainingSeconds / 60) + "m " + (remainingSeconds % 60) + "s left";
      }
      case "minute":
        return Math.max(0, Math.floor((snapshot.boundaries.minuteEnd - now) / 1000)) + "s left";
      default:
        return "";
    }
  }

  function getDotSnapshot(options = {}) {
    const snapshot = getProgressSnapshot(options);

    return DOTS.map((dot) => {
      const progress = snapshot.progress[dot.key];
      return {
        key: dot.key,
        label: dot.label,
        widgetSize: dot.widgetSize,
        popupSize: dot.popupSize,
        progress,
        percentage: Number((progress * 100).toFixed(1)),
        remaining: formatRemaining(dot.key, snapshot)
      };
    });
  }

  function getLifeSummary(options = {}) {
    const snapshot = getProgressSnapshot(options);
    return {
      percentage: Number((snapshot.progress.lifetime * 100).toFixed(2)),
      remainingDays: Math.max(0, Math.floor(snapshot.remainingLifetimeMs / DAY_MS))
    };
  }

  return {
    DAY_MS,
    HOUR_MS,
    MINUTE_MS,
    YEAR_DAYS,
    MONTH_DAYS,
    DOTS,
    clamp01,
    getProgressSnapshot,
    getDotSnapshot,
    getLifeSummary,
    formatRemaining
  };
});
