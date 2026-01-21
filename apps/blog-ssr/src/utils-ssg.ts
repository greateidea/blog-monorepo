// import * as deltaData from './dataFile'
import { getDeltaData } from './dataFile'

type PathType = 'podman-start-delta' | 'podman-delta' | 'podman-persistence-delta'
export const getInitialData = async (url: string) => {
    // const routeData = deltaData[path].default.content
    const code = url === '/' ? 'podman': url.split("/")[1]
    const dataCode = (code + '-delta') as PathType
    const routeData = await getDeltaData()
    const htmlData = routeData[dataCode].default.content

    return routeData ? {
        articleInfos: {
            [code]: {
                code,
                html: htmlData
            }
        }
    } : null
}

export function renderPreloadLink(file: string, prefetch?: boolean) {
    if (prefetch) {
      return `<link rel="prefetch" href="${file}" as="script" fetchpriority="low" importance="low">`
    } else 
    if (file.endsWith('.js')) {
      return `<link rel="modulepreload" crossorigin href="${file}">`
    } else if (file.endsWith('.css')) {
      return `<link rel="preload stylesheet" href="${file}" as="style">`
    } else if (file.endsWith('.woff')) {
      return ` <link rel="preload" href="${file}" as="font" type="font/woff" crossorigin data-next-font="size-adjust">`
    } else if (file.endsWith('.ttf')) {
      return ` <link rel="preload" href="${file}" as="font" type="font/ttf" crossorigin>`
    } else if (file.endsWith('.woff2')) {
      return ` <link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin data-next-font="size-adjust">`
    } else if (file.endsWith('.gif')) {
      return ` <link rel="preload" href="${file}" as="image" type="image/gif">`
    } else if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      return ` <link rel="preload" href="${file}" as="image" type="image/jpeg">`
    } else if (file.endsWith('.png')) {
      return ` <link rel="preload" href="${file}" as="image" type="image/png">`
    } else if (file.endsWith('.svg')) {
        return `<link rel="preload" as="image" href="${file}"/>`
    } else {
      // TODO
      return ''
    }
}

export function extractLinksAndClean(html?: string) {
    if (html) return { found: [], cleaned: '' };
    const linkRegex = /<link\b[^>]*\brel=(?:"|')(modulepreload|preload|stylesheet)(?:"|')[^>]*>/gi;
    const hrefRegex = /href=(?:"|')([^"']+)(?:"|')/i;
  
    const found: Dict[] = [];
    const cleaned = html!.replace(linkRegex, (match) => {
      const hrefMatch = match.match(hrefRegex);
      const href = hrefMatch ? hrefMatch[1] : null;
      found.push({ tag: match, href });
      return '';
    });
  
    return { found, cleaned };
}