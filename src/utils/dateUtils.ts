import { DateFilterType } from "../types/transaction";

/**
 * Formats an ISO date string into a concise human-readable string (e.g. "Aug 17, 26").
 */
export function formatDate(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2);

  return `${month} ${day}, ${year}`;
}

const BS_MONTH_NAMES = [
  "Bai",
  "Jes",
  "Asa",
  "Shr",
  "Bha",
  "Aso",
  "Kar",
  "Man",
  "Pou",
  "Mag",
  "Fal",
  "Cha",
];

/**
 * Converts a standard Date object into a Bikram Sambat (BS) date object.
 */
export function convertToBS(date: Date): {
  bsYear: number;
  bsMonth: string;
  bsMonthIndex: number;
  bsDay: number;
} {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed (0 = Jan, 8 = Sep)
  const day = date.getDate();

  // Reference anchor: AD 2026-04-14 corresponds to BS 2083-01-01 (Bai 1, 2083)
  const adYearOffset = 57;
  let bsYear = year + adYearOffset;
  let bsMonthIndex = 0;
  let bsDay = 1;

  // Month map for 2026 AD / 2083 BS approx start dates in AD
  // [Month index, start month AD (0-11), start day AD]
  const monthStarts = [
    { bsMonthIndex: 0, adMonth: 3, adDay: 14 }, // Baisakh ~ Apr 14
    { bsMonthIndex: 1, adMonth: 4, adDay: 15 }, // Jestha ~ May 15
    { bsMonthIndex: 2, adMonth: 5, adDay: 15 }, // Asar ~ Jun 15
    { bsMonthIndex: 3, adMonth: 6, adDay: 17 }, // Shrawan ~ Jul 17
    { bsMonthIndex: 4, adMonth: 7, adDay: 17 }, // Bhadra ~ Aug 17
    { bsMonthIndex: 5, adMonth: 8, adDay: 17 }, // Ashwin ~ Sep 17
    { bsMonthIndex: 6, adMonth: 9, adDay: 18 }, // Kartik ~ Oct 18
    { bsMonthIndex: 7, adMonth: 10, adDay: 17 }, // Mangsir ~ Nov 17
    { bsMonthIndex: 8, adMonth: 11, adDay: 16 }, // Poush ~ Dec 16
    { bsMonthIndex: 9, adMonth: 0, adDay: 15 }, // Magh ~ Jan 15
    { bsMonthIndex: 10, adMonth: 1, adDay: 13 }, // Falgun ~ Feb 13
    { bsMonthIndex: 11, adMonth: 2, adDay: 15 }, // Chaitra ~ Mar 15
  ];

  // Adjust BS Year if before April 14
  if (month < 3 || (month === 3 && day < 14)) {
    bsYear = year + 56;
  }

  // Find matching BS month
  let matchedIdx = 0;
  for (let i = monthStarts.length - 1; i >= 0; i--) {
    const ms = monthStarts[i];
    const msDate = new Date(year, ms.adMonth, ms.adDay);
    if (date >= msDate) {
      matchedIdx = ms.bsMonthIndex;
      const diffTime = Math.abs(date.getTime() - msDate.getTime());
      bsDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      break;
    }
  }

  // Fallback for dates early in the calendar year before Baisakh
  if (matchedIdx === 0 && (month < 3 || (month === 3 && day < 14))) {
    if (month === 0 && day < 15) {
      matchedIdx = 8; // Poush
      const msDate = new Date(year - 1, 11, 16);
      bsDay =
        Math.floor(
          (date.getTime() - msDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;
    } else if (month === 0 || (month === 1 && day < 13)) {
      matchedIdx = 9; // Magh
      const msDate = new Date(year, 0, 15);
      bsDay =
        Math.floor(
          (date.getTime() - msDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;
    } else if (month === 1 || (month === 2 && day < 15)) {
      matchedIdx = 10; // Falgun
      const msDate = new Date(year, 1, 13);
      bsDay =
        Math.floor(
          (date.getTime() - msDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;
    } else {
      matchedIdx = 11; // Chaitra
      const msDate = new Date(year, 2, 15);
      bsDay =
        Math.floor(
          (date.getTime() - msDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;
    }
  }

  const paddedDay = bsDay < 10 ? `0${bsDay}` : `${bsDay}`;

  return {
    bsYear,
    bsMonth: BS_MONTH_NAMES[matchedIdx],
    bsMonthIndex: matchedIdx,
    bsDay: Number(paddedDay),
  };
}

/**
 * Returns formatted AD date subtitle string for each date filter option.
 */
export function getDateFilterSubtitle(
  filter: DateFilterType,
  now = new Date(),
): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const curYear = now.getFullYear();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  switch (filter) {
    case "today": {
      return `${months[now.getMonth()]} ${pad(now.getDate())}, ${curYear}`;
    }
    case "yesterday": {
      const yest = new Date(now);
      yest.setDate(now.getDate() - 1);
      return `${months[yest.getMonth()]} ${pad(yest.getDate())}, ${yest.getFullYear()}`;
    }
    case "this_week": {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() + 6);
      return `${months[now.getMonth()]} ${pad(now.getDate())} - ${months[weekEnd.getMonth()]} ${pad(weekEnd.getDate())}, ${curYear}`;
    }
    case "this_month": {
      const lastDay = new Date(curYear, now.getMonth() + 1, 0).getDate();
      return `${months[now.getMonth()]} 01 - ${months[now.getMonth()]} ${pad(lastDay)}, ${curYear}`;
    }
    case "last_month": {
      const prevMonth = new Date(curYear, now.getMonth() - 1, 1);
      const lastDay = new Date(curYear, now.getMonth(), 0).getDate();
      return `${months[prevMonth.getMonth()]} 01 - ${months[prevMonth.getMonth()]} ${pad(lastDay)}, ${prevMonth.getFullYear()}`;
    }
    case "this_fiscal_year": {
      const fyStartYear = now.getMonth() >= 6 ? curYear : curYear - 1;
      return `Jul 16, ${fyStartYear} - Jul 15, ${fyStartYear + 1}`;
    }
    case "this_year": {
      return `Jan 01 - Dec 31, ${curYear}`;
    }
    case "all":
      return "See Transactions of all time";
    default:
      return "See Transactions of all time";
  }
}

export interface DateRangeBoundaries {
  startDateIso: string | null;
  endDateIso: string | null;
}

/**
 * Calculates the start and end ISO date boundaries for a given DateFilterType.
 */
export function getDateFilterBoundaries(
  dateFilter: DateFilterType,
): DateRangeBoundaries {
  const now = new Date();

  if (dateFilter === "today") {
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    return { startDateIso: startOfDay.toISOString(), endDateIso: null };
  }
  if (dateFilter === "yesterday") {
    const startOfYesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
    );
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    return {
      startDateIso: startOfYesterday.toISOString(),
      endDateIso: startOfToday.toISOString(),
    };
  }
  if (dateFilter === "this_week") {
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay(),
    );
    return { startDateIso: startOfWeek.toISOString(), endDateIso: null };
  }
  if (dateFilter === "this_month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDateIso: startOfMonth.toISOString(), endDateIso: null };
  }
  if (dateFilter === "last_month") {
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      startDateIso: startOfLastMonth.toISOString(),
      endDateIso: startOfThisMonth.toISOString(),
    };
  }
  if (dateFilter === "this_fiscal_year") {
    // Nepali Fiscal Year starts around July 16 / 17
    const currentYear = now.getFullYear();
    const fyStartMonth = 6; // July (0-indexed)
    const fyStartDate =
      now.getMonth() >= fyStartMonth
        ? new Date(currentYear, fyStartMonth, 16)
        : new Date(currentYear - 1, fyStartMonth, 16);
    return { startDateIso: fyStartDate.toISOString(), endDateIso: null };
  }
  if (dateFilter === "this_year") {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return { startDateIso: startOfYear.toISOString(), endDateIso: null };
  }

  return { startDateIso: null, endDateIso: null };
}

/**
 * Calculates the start ISO date boundary for a given DateFilterType.
 * Returns null if filter is 'all'.
 */
export function getDateFilterBoundary(
  dateFilter: DateFilterType,
): string | null {
  return getDateFilterBoundaries(dateFilter).startDateIso;
}
