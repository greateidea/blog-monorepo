// src/entry-server.tsx
console.log('0 test')
import { StaticHandlerContext, StaticRouter } from 'react-router'
import App from './App'
import { prerenderToNodeStream } from 'react-dom/static'
import getRoutes from './routes'
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router"
import { renderPreloadLink, getInitialData } from './utils-ssg'
// import themeCss from './th.css?raw'

const origin = "https://api.hiou.top"

type Manifest = Record<string, {
  file?: string,
  css?: string[],
  isEntry?: boolean,
  imports?: string[],
  dynamicImports?: string[],
  assets?: string[]
}>

// helper: given manifest & entryKey, return script/style tags (absolute paths starting with '/')
function tagsFromManifest(manifest: Manifest | null, entryKey = 'src/entry-client.tsx') {
  console.log('entryKey: ', entryKey)

  let entryTag = '';
  // const scripts: string[] = []
  // const styles: string[] = []
  let scriptTags = '';
  let lowPriorityScriptTags = '';
  let cssTags = '';
  let assetsTags = '';
  console.log('manifest: ', !!manifest)
  if (!manifest) return { entryTag, scriptTags, cssTags, assetsTags, lowPriorityScriptTags }

  // try direct lookup
  const info = manifest[entryKey] ?? Object.values(manifest).find(v => v.isEntry)
  if (!info) {
    return { entryTag, scriptTags, cssTags, assetsTags, lowPriorityScriptTags }
  }

  if (info.file) entryTag = `<script type="module" src="/${info.file}"></script>`
  if (Array.isArray(info.imports)) {
    for (const imp of info.imports) {
      const impInfo = manifest[imp]
      if (impInfo?.file) scriptTags += renderPreloadLink(`/${impInfo.file}`)
    }
  }
  if (Array.isArray(info.dynamicImports)) {
    for (const imp of info.dynamicImports) {
      const impInfo = manifest[imp]
      if (impInfo?.file) lowPriorityScriptTags += renderPreloadLink(`/${impInfo.file}`, true)
    }
  }
  if (Array.isArray(info.css)) {
    for (const css of info.css) cssTags += renderPreloadLink(`/${css}`)
  }
  if (Array.isArray(info.assets)) {
    for (const asset of info.assets) assetsTags += renderPreloadLink(`/${asset}`)
  }
  return { entryTag, scriptTags, cssTags, assetsTags, lowPriorityScriptTags }
}

// safe json -> html inject
function safeJsonForHtml(obj: any) {
  return JSON.stringify(obj).replace(/</g, '\\u003c')
}

const initialThemeScript = `<script>
  (function(){
    const t=localStorage.theme;
    document.documentElement.setAttribute('data-theme', t || 'Dark') ;
  })();
</script>`

const preFonts = `
<link rel="preload" href="https://fonts.gstatic.com/s/firacode/v27/uU9NCBsR6Z2vfE9aq3bh3dSDqFGedA.woff2" as="font" type="font/woff2" crossorigin="anonymous" data-next-font="size-adjust">
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/lxgwwenkai-regular/0.woff2" as="font" type="font/woff2" crossorigin="anonymous" data-next-font="size-adjust">
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/lxgwwenkai-regular/3.woff2" as="font" type="font/woff2" crossorigin="anonymous" data-next-font="size-adjust">
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/lxgwwenkai-regular/4.woff2" as="font" type="font/woff2" crossorigin="anonymous" data-next-font="size-adjust">
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/lxgwwenkai-regular/5.woff2" as="font" type="font/woff2" crossorigin="anonymous" data-next-font="size-adjust">
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/lxgwwenkai-regular/7.woff2" as="font" type="font/woff2" crossorigin="anonymous" data-next-font="size-adjust">
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/lxgwwenkai-regular/9.woff2" as="font" type="font/woff2" crossorigin="anonymous" data-next-font="size-adjust">
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/lxgwwenkai-regular/11.woff2" as="font" type="font/woff2" crossorigin="anonymous" data-next-font="size-adjust">
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/lxgwwenkai-regular/22.woff2" as="font" type="font/woff2" crossorigin="anonymous" data-next-font="size-adjust">
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/lxgwwenkai-regular/23.woff2" as="font" type="font/woff2" crossorigin="anonymous" data-next-font="size-adjust">
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/lxgwwenkai-regular/24.woff2" as="font" type="font/woff2" crossorigin="anonymous" data-next-font="size-adjust">
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/lxgwwenkai-regular/25.woff2" as="font" type="font/woff2" crossorigin="anonymous" data-next-font="size-adjust">
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/lxgwwenkai-regular/26.woff2" as="font" type="font/woff2" crossorigin="anonymous" data-next-font="size-adjust">
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/lxgwwenkai-regular/209.woff2" as="font" type="font/woff2" crossorigin="anonymous" data-next-font="size-adjust">
<link rel="preload" href="https://fonts.gstatic.com/s/inter/v20/UcCo3FwrK3iLTcviYwYZ8UA3.woff2" as="font" type="font/woff2" crossorigin="anonymous" data-next-font="size-adjust">
<link rel="preload" href="https://fonts.gstatic.com/s/inter/v20/UcCm3FwrK3iLTcvnUwQT9mI1F54.woff2" as="font" type="font/woff2" crossorigin="anonymous" data-next-font="size-adjust">
`

type UrlMapToRouteDataIndexType =
  '/' |
  '/podman' |
  '/podman-start' |
  '/vite-po' |
  '/dollar-state' |
  '/dollar-effect' |
  '/dollar-derived' |
  '/svelte-checkversion' |
  '/svelte-base-render' |
  '/svelte-code-effect' |
  '/svelte-code-array'

// ADD:
const urlMapToRouteData = {
  '/': {
    title: '什么是podman',
    metaDescription: 'What is podman',
    ogTitle: 'What is podman',
    ogUrl: 'https://blog.hiou.top',
    ogDescription: 'Podman is a container management tool',
  },
  '/podman': {
    title: '什么是podman',
    metaDescription: 'What is podman',
    ogTitle: 'What is podman',
    ogUrl: 'https://blog.hiou.top',
    ogDescription: 'Podman is a container management tool',
  },
  '/podman-start': {
    title: '使用Podman命令创建和启动容器',
    metaDescription: 'Start the Podman container with the command',
    ogTitle: 'Start The Podman Container',
    ogUrl: 'https://blog.hiou.top/podman-start',
    ogDescription: 'Start the Podman container with the command',
  },
  '/podman-persistence': {
    title: 'Podman的服务持久化',
    metaDescription: 'Service persistence of podman',
    ogTitle: 'Service persistence of podman',
    ogUrl: 'https://blog.hiou.top/podman-persistence',
    ogDescription: 'Service persistence of podman',
  },
  '/vite-po': {
    title: 'Vite 文档官网优化分析',
    metaDescription: 'Optimization analysis of Vite document official website',
    ogTitle: 'Optimization analysis of Vite document official website',
    ogUrl: 'https://blog.hiou.top/vite-po',
    ogDescription: 'Optimization analysis of Vite document official website',
  },
  '/dollar-state': {
    title: 'svelte的$state在React中的基础实现',
    metaDescription: 'The Basic Implementation of $state of svelte in React',
    ogTitle: 'The Basic Implementation of $state of svelte in React',
    ogUrl: 'https://blog.hiou.top/dollar-state',
    ogDescription: 'The Basic Implementation of $state of svelte in React',
  },
  '/dollar-effect': {
    title: 'svelte的$effect',
    metaDescription: 'The Basic Implementation of $effect of svelte in React',
    ogTitle: 'The Basic Implementation of $effect of svelte in React',
    ogUrl: 'https://blog.hiou.top/dollar-effect',
    ogDescription: 'The Basic Implementation of $effect of svelte in React',
  },
  '/dollar-derived': {
    title: 'svelte的$derived',
    metaDescription: 'The Basic Implementation of $derived of svelte in React',
    ogTitle: 'The Basic Implementation of $derived of svelte in React',
    ogUrl: 'https://blog.hiou.top/dollar-derived',
    ogDescription: 'The Basic Implementation of $derived of svelte in React',
  },
  '/svelte-checkversion': {
    title: 'Svelte的版本检查更新机制',
    metaDescription: 'Svelte\'s version checking and updating mechanism',
    ogTitle: 'Svelte\'s version checking and updating mechanism',
    ogUrl: 'https://blog.hiou.top/svelte-checkversion',
    ogDescription: 'Svelte\'s version checking and updating mechanism',
  },
  '/svelte-base-render': {
    title: 'Svelte基础渲染流程',
    metaDescription: 'Svelte basic rendering process',
    ogTitle: 'Svelte basic rendering process',
    ogUrl: 'https://blog.hiou.top/svelte-checkversion',
    ogDescription: 'Svelte basic rendering process',
  },
  '/svelte-code-effect': {
    title: 'SVELTE源码分析：如何创建一个effect',
    metaDescription: 'SVELTE source code analysis: how to create an effect',
    ogTitle: 'SVELTE source code analysis: how to create an effect',
    ogUrl: 'https://blog.hiou.top/svelte-code-effect',
    ogDescription: 'SVELTE source code analysis: how to create an effect',
  },
  '/svelte-code-array': {
    title: 'SVELTE源码分析：数组渲染及DIFF算法',
    metaDescription: 'SVELTE source code analysis: array rendering and DIFF algorithm',
    ogTitle: 'SVELTE source code analysis: array rendering and DIFF algorithm',
    ogUrl: 'https://blog.hiou.top/svelte-code-array',
    ogDescription: 'SVELTE source code analysis: array rendering and DIFF algorithm',
  },
}

/**
 * render(url, data, opts)
 * - url: path like '/blog/slug'
 * - data: initialData (article json)
 * - opts.manifest: JS object from dist/client/manifest.json (optional)
 * - opts.entryKey: source entry key to lookup in manifest (default 'src/entry-client.tsx')
 *
 * Returns full HTML string (doctype + html ...).
 */
export async function render(url: string, data: any = null, opts: { manifest?: Manifest, entryKey?: string } = {}) {
  const { manifest = null, entryKey = 'src/entry-client.tsx' } = opts
  const initialData = await getInitialData(url)
  const { query, dataRoutes } = createStaticHandler(getRoutes(initialData || { articleInfos: {} }));

  const queryUrl = new URL(url, origin); // origin 可随意
  const req = new Request(queryUrl.toString(), { method: "GET" });

  // 对当前请求真正“跑 loader/action”
  const context = await query(req) as StaticHandlerContext;

  // 基于 dataRoutes 与 context 创建静态 router 并渲染
  const router = createStaticRouter(dataRoutes, context);

  // 1) render app HTML with StaticRouter and pass initialData as prop
  const { prelude } = await prerenderToNodeStream(
    <StaticRouterProvider router={router} context={context} />,
  )

  let appHtml = '';
  await new Promise((resolve, reject) => {
    prelude.on('data', chunk => {
      appHtml += chunk;
    });
    prelude.on('end', () => resolve(appHtml));
    prelude.on('error', reject);
  });

  // 2) build initial data injection
  const initialDataScript = data ? `<script>window.__INITIAL_DATA__ = ${safeJsonForHtml(data)}</script>` : ''

  // 3) build asset tags from manifest (if provided)
  const { entryTag, scriptTags, cssTags, assetsTags, lowPriorityScriptTags } = tagsFromManifest(manifest, entryKey)
  const googleFontResourceTags = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Noto+Serif+SC:wght@200..900&display=swap" rel="stylesheet">
  `
  const lxgwwenkaiFontTag = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/lxgwwenkai-regular/result.css" />'
  // try {
  //   const { found = [], cleaned } = extractLinksAndClean(appHtml);

  //   const allTagStr = [entryTag, scriptTags, cssTags, assetsTags].join("")

  //   found.forEach(({ tag, href }) => {
  //     if (!allTagStr.includes(href)) {
  //       assetsTags + tag
  //     }
  //   })

  //   appHtml = cleaned;
  // } catch (error) {
  //   console.log(error);
  // }

  // 4) assemble full HTML (you can adapt head meta as needed)

  const headMeta = urlMapToRouteData[url as UrlMapToRouteDataIndexType]

  const html = `<!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <link rel="icon" type="image/png" sizes="32x32" href="/logoz-32.png" />
    <link rel="canonical href="${headMeta.ogUrl}" />
    <meta name="description" content="${headMeta.metaDescription}">
    <meta property="og:type" content="website">
    <meta property="og:image" content="https://blog.hiou.top/logoz-32.png">
    <meta property="og:title" content="${headMeta.ogTitle}">
    <meta property="og:url" content="${headMeta.ogUrl}">
    <meta property="og:description" content="${headMeta.ogDescription}">
    <meta property="og:site_name" content="hiou blog!">
    ${preFonts}
    ${googleFontResourceTags}
    ${lxgwwenkaiFontTag}
    ${initialThemeScript}
    <title>${headMeta.title}</title>
    ${cssTags}
    ${entryTag}
    ${scriptTags}
    ${assetsTags}
    ${lowPriorityScriptTags}
    </head>
    <body>
      <div id="root">${appHtml}</div>
      ${initialDataScript}
    </body>
  </html>`

  return html
}
{/* <style>${themeCss}</style> */ }

// Also export default component for dev SSR loading (optional)
const ServerApp = ({ url, initialData }: { url?: string, initialData?: any }) => {
  return (
    <StaticRouter location={url ?? '/'}>
      <App initialData={initialData} />
    </StaticRouter>
  )
}

export default ServerApp

