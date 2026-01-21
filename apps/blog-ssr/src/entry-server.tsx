import { StrictMode } from 'react'
import { StaticRouter } from 'react-router-dom'
import {
  type RenderToPipeableStreamOptions,
  renderToPipeableStream,
} from 'react-dom/server'
import App from './App'

export function render(url: string, options?: RenderToPipeableStreamOptions) {
  return renderToPipeableStream(
    <StrictMode>
      <StaticRouter location={url}>
        <App initialData={{ value: 3 }} />
      </StaticRouter>
      <vite-streaming-end></vite-streaming-end>
    </StrictMode>,
    options,
  )
}
