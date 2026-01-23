// src/entry-client.tsx
import './normalizeTrailingSlash'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { useEffect } from 'react'
// import { BrowserRouter } from 'react-router-dom'
import { createBrowserRouter, matchRoutes, useLocation, useNavigationType, createRoutesFromChildren } from "react-router";
import { RouterProvider } from "react-router/dom";
import getRoutes from './routes';
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
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

declare global {
  interface Window { __INITIAL_DATA__?: any }
}

const data = typeof window !== 'undefined' ? window.__INITIAL_DATA__ : undefined
const router = createBrowserRouter(getRoutes(import.meta.env.DEV ? null : data?.store || { articleInfos: {} }));
const el = document.getElementById('root')

// if (typeof window !== 'undefined') {
//   const { pathname, search, hash } = window.location;
//   let newPath = pathname;

//   if (newPath.length > 1 && newPath.endsWith('/')) {

//     newPath = newPath.replace(/\/+$/, '') + search + hash;
//     window.location.replace(newPath);
//   }
// }

if (el) {
  const RootNode = <RouterProvider router={router} />
  if (import.meta.env.DEV) {
    createRoot(el).render(RootNode)
  } else {
    hydrateRoot(el, RootNode)
  }
}
