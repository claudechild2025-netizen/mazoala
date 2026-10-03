export class ReportDomainError extends Error {
  constructor(message: string, public readonly code: "REPORT_DAY_NOT_ALLOWED" | "STATE_CONFLICT") {
    super(message);
    this.name = "ReportDomainError";
  }
}

export interface WednesdayPeriod {
  periodStart: Date;
  periodEnd: Date;
  timezone: string;
  isOfficialWednesdayRun: boolean;
}

/**
 * Calculates local day of week in the business timezone.
 * Wednesday is day 3 (0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, ...).
 */
export function getBusinessDayOfWeek(date: Date, timezone: string = "Asia/Ulaanbaatar"): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short"
  });
  const weekdayStr = formatter.format(date);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };
  return map[weekdayStr] ?? -1;
}

export function resolveWednesdayPeriod(
  now: Date,
  isPreview: boolean,
  timezone: string = "Asia/Ulaanbaatar"
): WednesdayPeriod {
  const day = getBusinessDayOfWeek(now, timezone);
  const isWednesday = day === 3;

  if (!isWednesday && !isPreview) {
    throw new ReportDomainError(
      `Official reports can only be generated on Wednesday in ${timezone}. Current day is not Wednesday. Use preview mode for other days.`,
      "REPORT_DAY_NOT_ALLOWED"
    );
  }

  // Calculate prior 7-day period ending at current date
  const end = new Date(now.getTime());
  const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    periodStart: start,
    periodEnd: end,
    timezone,
    isOfficialWednesdayRun: isWednesday && !isPreview
  };
}
