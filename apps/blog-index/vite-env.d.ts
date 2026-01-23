/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare namespace React {
  declare namespace JSX {
    interface IntrinsicElements {
      'vite-streaming-end': any
    }
  }
}
