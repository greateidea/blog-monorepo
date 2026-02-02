import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || "https://99f4bffe41567cf61f6b4f0514319fc9@o4510759028129792.ingest.us.sentry.io/4510760308047872",
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
      // send console.log, console.warn, and console.error calls as logs to Sentry
      Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    ],
    release: import.meta.env.SENTRY_RELEASE,
    sendDefaultPii: true,
    // tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    enableLogs: true,
    environment: import.meta.env.MODE,
  });
}
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);