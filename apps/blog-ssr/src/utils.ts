import DOMPurify from 'dompurify'
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html"

export const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'b','i','em','strong','a','p','br','ul','ol','li','img','h1','h2','h3','h4','h5','h6',
    'blockquote','pre','code','span','div','figure','figcaption','table','thead','tbody','tr','td','th'
  ],
  // 允许常见属性；注意：style 会带来风险，默认不允许
  ALLOWED_ATTR: ['href','src','alt','title','width','height','class','id','data-*','role'],
  // 允许 data URI 的图片（根据需求决定是否允许）
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|ftp):|data:image\/)|^blob:/i
};

export const getSafeDOM = (dangerousHtml: string) => {
  if (import.meta.env.DEV) {
    return DOMPurify.sanitize(dangerousHtml, PURIFY_CONFIG)
  } else {
    return dangerousHtml
  }
}
type UpdateHeadMetaType = (params: {
  title: string,
  canonical: string,
  ogTitle: string,
  ogDescription: string,
  metaDescription: string,
  ogUrl: string,
}) => void

export const updateHeadMeta:UpdateHeadMetaType = ({
  title, canonical, ogTitle, ogDescription, metaDescription, ogUrl } ) => {
  // 1. 更新标题
  if (title) document.title = title;

  // 2. 更新 og:title
  if (ogTitle) {
    let ogTag = document.querySelector('meta[property="og:title"]');
    ogTag && ogTag.setAttribute('content', ogTitle);
  }

  // 3. 更新 canonical link
  if (canonical) {
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    canonicalLink && canonicalLink.setAttribute('href', canonical);
  }

  if (ogDescription) {
    let ogDescriptionLink = document.querySelector('meta[property="og:description"]');
    ogDescriptionLink && ogDescriptionLink.setAttribute('content', ogDescription);
  }

  if (metaDescription)  {
    let metaDescriptionLink = document.querySelector('meta[name="description"]');
    metaDescriptionLink && metaDescriptionLink.setAttribute('content', metaDescription);
  }

  if (ogUrl)  {
    let ogUrlLink = document.querySelector('meta[property="url"]');
    ogUrlLink && ogUrlLink.setAttribute('content', ogUrl);
  }

}

export const unshiftTagToHead = (tagObjs: Dict[]) => {
  tagObjs?.forEach(tagObj => {
    const contentTag = document.createElement(tagObj.type);
    Object.assign(contentTag, tagObj.attributes)
    document.head.appendChild(contentTag)
  })
}

export const getSafeHtmlFromDelta = (delta: any) => {
  const converter = new QuillDeltaToHtmlConverter(delta.ops, {});
  converter.renderCustomWith(function(customOp, contextOp){
    if (customOp.insert.type === 'blue700-tag') {
      let val = customOp.insert.value;
      return `<span class=${val.className}>${val.text}</span>`;
    } else if (typeof customOp.insert.value === 'string') {
      return customOp.insert.value
    } else {
        if (import.meta.env.DEV) {
          console.log('Unmanaged custom blot! customOp: ', customOp)
        }
        return '';
    }
});
  const html = converter.convert();

  return getSafeDOM(html)
}

export const debounce = (fn: Function, delay = 200) => {
  let timer: any = undefined
  return function (...args: any[]) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export const throttle = (fn: Function, delay = 200) => {
  let lastTime = 0
  return function (...args: any[]) {
    const now = Date.now()
    if (!lastTime) {
      fn.apply(this, args)
    } else if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}


export const syncWaite = (delay = 500) => {
  let lastTime = 0
  return function () {
    const now = Date.now()
    if (!lastTime || now - lastTime >= delay) {
      lastTime = now
      return true
    } else {
      return false
    }
  }
}

export const displayProfile = () => {
  // console.log(
  //   '%c上面基础,下面就不基础\n%c嗨! 👋你好, 这里是Spring Cat. 一个有想法前端工程师😊，目前在找合适的工作中。\n如果你感兴趣或有任何疑问，👉 请联系：%cbigbigorange@yeah.net%c，简历可查看：https://maimai.cn/contact/share/card?u=g4jmfwipfdkq&_share_channel=copy_link',
  //   "color:orange;padding: 6px 0;",
  //   "color:black;padding-bottom: 6px;",
  //   "color:blue;",
  //   "color:black;"
  // )
  console.log("👋你好")
}

export const elementScrollIntoViewByOffset = (element: Element) => {
  const headerOffset = 64
  const rect = element.getBoundingClientRect()
  // rect.top：当前元素距离顶部的距离 不管是否在视口外
  // window.scrollY： 当前内容已经向上滚动的距离
  const scrollTop = window.scrollY + rect.top - headerOffset

  window.scrollTo({
    top: scrollTop,
    behavior: 'smooth'
  })
  
  // scrollIntoView: () => h.scrollIntoView({
  //     behavior: 'smooth',
  //     block: 'start'
  // })
}

const REMOTE_PREFIX = import.meta.env.VITE_PROXY_REMOTE_PREFIX;
const WREMOTE_PREFIX = import.meta.env.VITE_PROXY_WREMOTE_PREFIX;
const isPro = !import.meta.env.DEV;

export const proxyUrl = (url: string, prefix?: string) => {
  const pre = prefix || REMOTE_PREFIX;
  return isPro ? `//api.hiou.top${url}` : `${pre}${url}`;
}

export const proxyWUrl = (url: string, prefix?: string) => {
  const pre = prefix || WREMOTE_PREFIX;
  return isPro ? `//blog.hiou.top${url}` : `${pre}${url}`;
}


const preLoadAssetsRecord: string[] = [];
export const preLoadAssets = (src: string) => {
  if (preLoadAssetsRecord.includes(src)) return

  preLoadAssetsRecord.push(src)
  const head = document.querySelector('head')
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = src
  link.as = 'script'
  link.fetchPriority='low'
  link.importance = 'low'
  head?.appendChild(link)
}

// const TestDeltaString = {"ops":[{"insert":"Hello kitiok this"},{"attributes":{"header":1},"insert":"\n"},{"insert":"This is a powered App, open and read this article, you'll get unlimited force.\ncommon go get it! let's up! you will be the best one!\nOSome "},{"insert":"initial","attributes":{"bold":true}},{"insert":" "},{"insert":"content","attributes":{"underline":true}},{"insert":"\n"}]}

