export const eventNames = ["pageview", "contact_whatsapp", "contact_email", "view_work", "view_resume", "download_pdf", "download_json", "project_supervisor", "project_constructor", "project_amiloz", "social_linkedin", "social_x", "social_github"] as const;


export type AnalyticsEventName = (typeof eventNames)[number];

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return eventNames.some((name) => name === value);
}
