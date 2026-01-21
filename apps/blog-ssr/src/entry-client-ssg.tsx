// src/entry-client.tsx
import './normalizeTrailingSlash'
import { hydrateRoot, createRoot } from 'react-dom/client'
// import { BrowserRouter } from 'react-router-dom'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import getRoutes from './routes';

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
