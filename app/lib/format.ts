const DEFAULT_LOCALE = "en-GB";
const DEFAULT_TIME_ZONE = "Asia/Seoul";

const dateTimeFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
  dateStyle: "short",
  timeStyle: "medium",
  timeZone: DEFAULT_TIME_ZONE
});

export function formatDateTime(isoTs: string): string {
  return dateTimeFormatter.format(new Date(isoTs));
}


