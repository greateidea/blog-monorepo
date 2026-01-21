// prerender.js (ESM) - 使用 server bundle.render(url, data, {manifest}) 来生成完整页面
// Usage: node prerender.js
import fs from 'fs/promises'
import path from 'path'

const root = process.cwd()
const clientDist = path.resolve(root, 'dist/client')
const serverDist = path.resolve(root, 'dist/server')
const serverEntryFile = path.resolve(serverDist, 'entry-server-ssg.js')
const manifestFile = path.resolve(clientDist, '.vite', 'manifest.json')

const ROUTES_JSON = path.resolve(root, 'routes.json')
// client entry key（用于在 manifest 中查找 entry）
const DEFAULT_ENTRY_KEY = 'index.html'

/** helpers **/
async function fileExists(p) {
  try { await fs.access(p); return true } catch { return false }
}
async function ensureDir(dir) { await fs.mkdir(dir, { recursive: true }) }
function safeJsonForHtml(obj) { return JSON.stringify(obj).replace(/</g, '\\u003c') }
function pathToFileURL(p) { const resolved = path.resolve(p); return new URL(`file://${resolved}`) }

// 将 URL 映射到输出目录与文件（/ -> dist/client/index.html, /blog/slug -> dist/client/blog/slug/index.html）
function urlToOut(url) {
  const u = new URL(url, 'http://hiou.top')
  const pathname = u.pathname.endsWith('/') && u.pathname !== '/' ? u.pathname.slice(0, -1) : u.pathname
  const outDir = pathname === '/' ? clientDist : path.join(clientDist, pathname.replace(/^\//,'')) // remove leading slash
  const outFile = path.join(outDir, 'index.html')
  return { outDir, outFile }
}
async function atomicWrite(filePath, content) {
  await ensureDir(path.dirname(filePath))
  const tmp = `${filePath}.tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`
  await fs.writeFile(tmp, content, 'utf8')
  await fs.rename(tmp, filePath)
}

// 从 posts 目录或 routes.json 生成 route 列表
async function collectRoutes() {
  // 先看 routes.json
  if (await fileExists(ROUTES_JSON)) {
    try {
      const raw = await fs.readFile(ROUTES_JSON, 'utf8')
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) return arr
    } catch (e) { console.warn('routes.json parse failed, fallback to posts dir') }
  }
  // ADD:
  return [
    '/',
    '/podman',
    '/podman-start',
    '/podman-persistence',
    '/vite-po',
    '/dollar-state',
    '/dollar-effect',
    '/dollar-derived',
    '/svelte-checkversion',
    '/svelte-base-render',
    '/svelte-code-effect',
    '/svelte-code-array',
  ]
}

// 从文件系统读取文章初始数据（简单策略）
async function loadInitialDataForRoute(route) {
  if (!route.startsWith('/blog/')) return { value: 3 }
  const slug = route.replace(/^\/blog\//, '')
  return { slug }
}

async function main() {
  console.log('prerender starting...')
  if (!(await fileExists(clientDist))) {
    console.error('dist/client not found — run `vite build` first')
    process.exit(1)
  }
  if (!(await fileExists(serverEntryFile))) {
    console.error('dist/server/entry-server-ssg.js not found — run `vite build --ssr src/entry-server.tsx` first')
    process.exit(1)
  }

  // load manifest if exists
  let manifestObj = null
  if (await fileExists(manifestFile)) {
    try {
      manifestObj = JSON.parse(await fs.readFile(manifestFile, 'utf8'));
      console.log('manifest loaded')
    } catch (e) { console.warn('manifest parse failed', e) }
  } else {
    console.log('manifest not found — will rely on template scripts')
  }

  // import server bundle
  const serverModule = await import(pathToFileURL(serverEntryFile).href)
  const routes = await collectRoutes()
  console.log('routes:', routes)

  for (const route of routes) {
    try {
      // const initialData = await loadInitialDataForRoute(route)
      // console.log("[initialData]: ", initialData)
      const html = await serverModule.render(route, {}, { manifest: manifestObj, entryKey: DEFAULT_ENTRY_KEY })
      if (typeof html === 'string' && html.trim().startsWith('<!doctype')) {
        let final = html
        // if (initialData && !html.includes('window.__INITIAL_DATA__')) {
        //   const json = safeJsonForHtml(initialData)
        //   const idx = final.lastIndexOf('</body>')
        //   final = idx !== -1 ? final.slice(0, idx) + `<script>window.__INITIAL_DATA__ = ${json}</script>` + final.slice(idx) : final + `<script>window.__INITIAL_DATA__ = ${json}</script>`
        // }
        const { outDir, outFile } = urlToOut(route)
        await atomicWrite(outFile, final)
        console.log(`[prerender] wrote (render) ${route} -> ${path.relative(root, outFile)}`)
      }

      // console.warn(`[prerender] no render path for ${route}`)
    } catch (err) {
      console.error(`[prerender] failed ${route}`, err)
    }
  }

  console.log('prerender finished')
  process.exit(0)
}

// run
main().catch(err => { console.error(err); process.exit(1) })
