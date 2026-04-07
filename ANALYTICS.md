# Umami Analytics Integration Guide

## Overview

This project uses **Umami Analytics** to track user interactions and engagement. Umami is a privacy-focused web analytics platform that provides insights into user behavior without relying on cookies or invasive tracking methods.

**Related Commit:** `0ac78da - Added Umami analytics`

## Requirements

To integrate Umami into a similar project, you'll need:

### 1. Umami Instance
- Access to a running Umami analytics server (self-hosted or SaaS)
- A valid Umami account with permissions to create tracking websites

### 2. Website Configuration
- **Website ID**: A unique identifier for your application in Umami (provided when you create a new website in your Umami profile)
- **Umami URL**: The base URL of your Umami analytics server (e.g., `https://umami.example.com`)

## Environment Variables

Configure the following environment variables in your `.env` file:

```env
VITE_APP_UMAMI_WEBSITE_ID=your-website-id-here
VITE_APP_UMAMI_URL=https://your-umami-instance.com
```

### Development Note
During local development, if you want to test Umami analytics:
1. Create a separate website in your own Umami profile (not the team profile)
2. Set the `VITE_APP_UMAMI_WEBSITE_ID` in your local `.env` file
3. Keep `VITE_APP_UMAMI_URL` pointing to your Umami instance

If either environment variable is missing or undefined, the analytics provider will gracefully disable itself (returns `null`).

## Packages Required

### Main Package
- **`@danielgtmn/umami-react`** (version `^1.1.6`)
  - React wrapper for Umami analytics
  - Provides hooks for tracking and user identification
  - Handles provider setup and event tracking

Add this to your `package.json`:
```json
"@danielgtmn/umami-react": "^1.1.6"
```

## Integration Steps

### 1. Create the Umami Analytics Component

Create `src/components/UmamiAnalytics.tsx`:

```typescript
import UmamiAnalyticsProvider from "@danielgtmn/umami-react";

const umamiWebsiteId =
  typeof import.meta.env.VITE_APP_UMAMI_WEBSITE_ID === "string"
    ? import.meta.env.VITE_APP_UMAMI_WEBSITE_ID
    : undefined;
const umamiUrl =
  typeof import.meta.env.VITE_APP_UMAMI_URL === "string"
    ? import.meta.env.VITE_APP_UMAMI_URL
    : undefined;

// Dev example: if you want to test Umami locally, create a website in your own Umami profile
// (not the team profile) and set VITE_APP_UMAMI_WEBSITE_ID in your local .env file.

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
```

### 2. Wrap Your Application

In your `src/main.tsx`, wrap your root component with `UmamiAnalytics`:

```typescript
import UmamiAnalytics from "./components/UmamiAnalytics";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Suspense fallback="Application is loading...">
    <ErrorBoundary FallbackComponent={RenderingError}>
      <UmamiAnalytics />
      {/* Rest of your application */}
      <MsalProvider instance={msalPublicClientApp}>
        <MainRouter />
      </MsalProvider>
    </ErrorBoundary>
  </Suspense>,
);
```

**Important:** Place `UmamiAnalytics` as the first component inside your error boundary to ensure all analytics tracking is available to child components.

## Usage

### Tracking Events

Use the `useUmami` hook to track user interactions:

```typescript
import { useUmami } from "@danielgtmn/umami-react";

export function MyComponent() {
  const { track } = useUmami();

  return (
    <Button onClick={() => track("button-click-event")}>
      Click Me
    </Button>
  );
}
```

### Identifying Users

After authentication, identify the user to associate events with their profile:

```typescript
import { useUmami } from "@danielgtmn/umami-react";

export function PostSignIn() {
  const { identify } = useUmami();
  
  // After user authentication completes
  useEffect(() => {
    // Extract user info from your auth system
    const employeeId = "user-123";
    const userEmail = "user@example.com";
    
    identify(employeeId, {
      email: userEmail,
      // Add any other custom properties
    });
  }, [identify]);
  
  return <div>Welcome!</div>;
}
```

## Event Examples from This Project

### Button Click Tracking
```typescript
<Button onClick={() => track("dr-schaer-applications-click")}>
  Dr. Schär Applications
</Button>
```

### Google Search Click
```typescript
<Button onClick={() => track("google-search-click")}>
  Google Search
</Button>
```

### Tab Navigation (via event handler)
```typescript
const handleTabChange = (event, newValue) => {
  setSelectedTab(newValue);
  // Optionally track the tab change
  track(`tab-switched-to-${newValue}`);
};
```

## Docker Configuration

If you're containerizing your application, ensure the environment variables are passed at runtime:

```dockerfile
# In your webstart-webgui.Dockerfile
ENV VITE_APP_UMAMI_WEBSITE_ID=""
ENV VITE_APP_UMAMI_URL=""
```

These should be provided at container startup (e.g., via docker-compose or Kubernetes environment variables).

## Key Features

- **Privacy-Focused**: Unlike Google Analytics, Umami is GDPR-compliant and doesn't use cookies for tracking
- **Event Tracking**: Track specific user actions (clicks, submissions, navigation)
- **User Identification**: Associate events with authenticated users using IDs or email
- **Custom Properties**: Add custom metadata to identify events in your dashboard
- **Graceful Degradation**: If environment variables are missing, analytics simply won't initialize (no errors)
- **Production-Only Option**: `onlyInProduction={false}` allows testing in development environments

## Additional Resources

- **Umami Documentation**: https://umami.is/docs
- **@danielgtmn/umami-react Package**: Check npm registry for detailed API documentation
- **Analytics Dashboard**: Access your Umami instance to view real-time analytics and reports

## Troubleshooting

### Events not appearing in dashboard
1. Verify `VITE_APP_UMAMI_WEBSITE_ID` and `VITE_APP_UMAMI_URL` are correctly set
2. Check browser DevTools Network tab to confirm tracking requests are being sent
3. Ensure your Umami instance is accessible from the client's network
4. Wait a few seconds - there may be a slight delay in event propagation

### Missing user identification
- Ensure `identify()` is called after successful authentication
- Verify the user ID is unique and consistent

### Environment variables not loading
- For Vite projects, environment variables must be prefixed with `VITE_`
- Rebuild your application after changing `.env` files
- Clear browser cache and restart the dev server
