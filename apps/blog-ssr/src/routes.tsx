// import { Suspense, lazy } from "react";
import Article from "./components/Article"
import AppContainer from "./AppContainer"
import LandingPage from "./components/LandingPage"
import { unshiftTagToHead, displayProfile } from "./utils"
// import podmanData from './dataFile/podman/podman-delta'
import { getDeltaData } from './dataFile'

if (typeof window !== "undefined") {
  displayProfile()
}

if (import.meta.env.DEV) {
  // 开发模式下加载字体cdn资源
  const googleapisPreconnectTagObj = {
    type: "link",
    attributes: {
      rel: "preconnect",
      href: "https://fonts.googleapis.com"
    }
  }

  const googleFontsGstaticPreconnectTagObj = {
    type: "link",
    attributes: {
      rel: "preconnect",
      href: "https://fonts.gstatic.com"
    }
  }

  const googleFontsTagObj = {
    type: "link",
    attributes: {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Noto+Serif+SC:wght@200..900&display=swap"
      // href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=VT323&display=swap"
    }
  }

  // <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/lxgwwenkai-regular/result.css" />
  const lxgwwenkaiFontTagObj = {
    type: "link",
    attributes: {
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/lxgwwenkai-regular/result.css"
    }
  }

  unshiftTagToHead([
    googleapisPreconnectTagObj,
    googleFontsGstaticPreconnectTagObj,
    googleFontsTagObj,
    lxgwwenkaiFontTagObj
  ])
}

const PodmanApp = (initialData?: { htmlString?: string }) => <Article htmlString={initialData?.htmlString} />
// const PodmanAppWrapper = (Component: any, initialData?: { htmlString?: string }) => (
//   <Suspense fallback={<div>Loading…</div>}>
//     <Component htmlString={initialData?.htmlString ?? "<p>app index</p><p>app podman podman</p>"} />
//   </Suspense>
// );

// ADD:
let TestInitialData: InitialDataType = {
  articleInfos: {
    podman: {
      code: 'podman',
      html: import.meta.env.DEV ? ((await getDeltaData())["podman-delta"].default.content || "<p>podman index</p><p>podman podman podman</p>") : ''
    },
    'podman-start': {
      code: 'podman-start',
      html: import.meta.env.DEV ? ((await getDeltaData())["podman-start-delta"].default.content || "<p>podman start index</p><p>podman start podman start podman start</p>") : ''
    },
    'podman-persistence': {
      code: 'podman-persistence',
      html: import.meta.env.DEV ? ((await getDeltaData())["podman-persistence-delta"].default.content || "<p>podman persistence index</p><p>podman persistence podman persistence podman persistence</p>") : ''
    },
    'vite-po': {
      code: 'vite-po',
      html: import.meta.env.DEV ? ((await getDeltaData())["vite-po-delta"].default.content || "<p>vite-po index</p><p>vite-po vite-po vite-po</p>") : ''
    },
    'dollar-state': {
      code: 'dollar-state',
      html: import.meta.env.DEV ? ((await getDeltaData())["dollar-state-delta"].default.content || "<p>dollar-state index</p><p>dollar-state dollar-state dollar-state</p>") : ''
    },
    'dollar-effect': {
      code: 'dollar-effect',
      html: import.meta.env.DEV ? ((await getDeltaData())["dollar-effect-delta"].default.content || "<p>dollar-effect index</p><p>dollar-effect</p>") : ''
    },
    'dollar-derived': {
      code: 'dollar-derived',
      html: import.meta.env.DEV ? ((await getDeltaData())["dollar-derived-delta"].default.content || "<p>dollar-derived index</p><p>dollar-derived</p>") : ''
    },
    'svelte-checkversion': {
      code: 'svelte-checkversion',
      html: import.meta.env.DEV ? ((await getDeltaData())["svelte-checkversion-delta"].default.content || "<p>svelte-checkversion-delta index</p><p>svelte-checkversion-delta") : ''
    },
    'svelte-base-render': {
      code: 'svelte-base-render',
      html: import.meta.env.DEV ? ((await getDeltaData())["svelte-base-render-delta"].default.content || "<p>svelte-base-render index</p><p>svelte-base-render</p>") : ''
    },
    'svelte-code-effect': {
      code: 'svelte-code-effect',
      html: import.meta.env.DEV ? ((await getDeltaData())["svelte-code-effect-delta"].default.content || "<p>svelte-code-effect index</p><p>svelte-code-effect</p>") : ''
    },
    'svelte-code-array': {
      code: 'svelte-code-array',
      html: import.meta.env.DEV ? ((await getDeltaData())["svelte-code-array-delta"].default.content || "<p>svelte-code-array index</p><p>svelte-code-array</p>") : ''
    },
  },
}

// console.log('[podmanData podmanData podmanData]: ', podmanData)

type InitialDataType = {
  articleInfos: {
    [index: string]: {
      code: string,
      html: string
    }
  }
}

// ADD:
const getRoutes = (initialData?: InitialDataType) => [
  {
    path: "/",
    element: <AppContainer initialState={initialData || TestInitialData}/>,
    children: [
      {
        index: true,
        element: PodmanApp({ htmlString: initialData?.articleInfos?.['podman']?.html || undefined })
      },
      // {
      //   path: "/app",
      //   element: PodmanAppWrapper(lazy(() => import('./components/Test')), initialData)
      // },
      // {
      //   path: "/app",
      //   lazy: async () => {
      //     const mod = await import("./components/Article");
      //     // App.jsx 中可以 export async function loader(...) { ... }
      //     const loader = async () => {

      //     }
      //     return { Component: mod.default, loader: loader }; 
      //   }
      // },
      {
        path: "podman",
        element: PodmanApp({ htmlString: initialData?.articleInfos?.['podman']?.html || undefined })
        // element: PodmanApp({ htmlString: initialData?.htmlString ?? "<p>podman index</p><p>podman podman podman</p>" })
      },
      {
        path: "podman-start",
        element: PodmanApp({ htmlString: initialData?.articleInfos?.['podman-start']?.html || undefined })
      },
      {
        path: "podman-persistence",
        element: PodmanApp({ htmlString: initialData?.articleInfos?.['podman-persistence']?.html || undefined })
      },
      {
        path: "vite-po",
        element: PodmanApp({ htmlString: initialData?.articleInfos?.['vite-po']?.html || undefined })
      },
      {
        path: "main",
        element: <LandingPage />
      },
      {
        path: "dollar-state",
        element: PodmanApp({ htmlString: initialData?.articleInfos?.['dollar-state']?.html || undefined })
      },
      {
        path: "dollar-effect",
        element: PodmanApp({ htmlString: initialData?.articleInfos?.['dollar-effect']?.html || undefined })
      },
      {
        path: "dollar-derived",
        element: PodmanApp({ htmlString: initialData?.articleInfos?.['dollar-derived']?.html || undefined })
      },
      {
        path: "svelte-checkversion",
        element: PodmanApp({ htmlString: initialData?.articleInfos?.['svelte-checkversion']?.html || undefined })
      },
      {
        path: "svelte-base-render",
        element: PodmanApp({ htmlString: initialData?.articleInfos?.['svelte-base-render']?.html || undefined })
      },
      {
        path: "svelte-code-effect",
        element: PodmanApp({ htmlString: initialData?.articleInfos?.['svelte-code-effect']?.html || undefined })
      },
      {
        path: "svelte-code-array",
        element: PodmanApp({ htmlString: initialData?.articleInfos?.['svelte-code-array']?.html || undefined })
      },
    ]
  }
]

export default getRoutes;