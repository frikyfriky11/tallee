import UmamiAnalyticsProvider from "@danielgtmn/umami-react";

declare global {
  interface Window {
    __ENV__?: {
      UMAMI_WEBSITE_ID?: string;
      UMAMI_URL?: string;
    };
  }
}

const umamiWebsiteId = window.__ENV__?.UMAMI_WEBSITE_ID || undefined;
const umamiUrl = window.__ENV__?.UMAMI_URL || undefined;

export default function UmamiAnalytics() {
  if (!umamiWebsiteId || !umamiUrl) {
    return null;
  }

  return (
    <UmamiAnalyticsProvider
      onlyInProduction={false}
      url={umamiUrl}
      websiteId={umamiWebsiteId}
    />
  );
}
