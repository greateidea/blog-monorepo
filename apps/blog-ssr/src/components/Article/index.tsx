// import { getSafeDOM } from '../../utils'
import { lazy, useEffect } from 'react'
import View from '../View'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router'
import { useAppContext } from '../../context/appContext'
import { updateHeadMeta } from '../../utils'
import { saveWAccessInfo } from '../../remote/remoteTask'
// import SideBar from '../SideBar'
import Head from '../Head'
// import Tip from '../Tip'
import style from './article.module.css'

// ADD:
export const sideBarData = [
    { code: "podman",
        des: '什么是podman？',
        metaDescription: 'What is podman',
        dateStr: 'MAY 9, 2025',
        ogDescription: 'Podman is a container management tool',
        ogTitle: 'What is podman',
        ogUrl: import.meta.env.DEV ? 'http://localhost:5173/podman' : 'https://blog.hiou.top/podman',
        href: "hiou.top/podman/index.html",
        containerStyle: {maskImage: 'linear-gradient(to bottom, black 96.9%, transparent 100%)'},
        headerDes: ['The sky was clear.', '&amp; the sun was shining.', 'MAY 9, 2025']
    },
    { code: "podman-start",
        des: '使用Podman命令创建和启动容器',
        dateStr: 'October 30, 2025',
        ogDescription: 'Start the Podman container with the command',
        metaDescription: 'Start the Podman container with the command',
        ogTitle: 'Start The Podman Container',
        ogUrl: import.meta.env.DEV ? 'http://localhost:5173/podman-start' : 'https://blog.hiou.top/podman-start',
        href: "hiou.top/podman-start/index.html",
        containerStyle: { maskImage: 'linear-gradient(to bottom, black 98.9%, transparent 100%)' },
        headerDes: ['The weather is getting cooler.', '&amp; The streets are still lively.', 'October 30, 2025']
    },
    { code: "podman-persistence",
        des: 'Podman的服务持久化',
        dateStr: 'November 4, 2025',
        ogDescription: 'Service persistence of podman',
        metaDescription: 'Service persistence of podman',
        ogTitle: 'Service persistence of podman',
        ogUrl: import.meta.env.DEV ? 'http://localhost:5173/podman-persistence' : 'https://blog.hiou.top/podman-persistence',
        href: "hiou.top/podman-persistence/index.html",
        containerStyle: { maskImage: 'linear-gradient(to bottom, black 98.6%, transparent 100%)' },
        headerDes: ['The heater is turned on.', '&amp; A kitten named Little/Old Bread.', 'November 4, 2025']
    },
    { code: "vite-po",
        des: 'Vite 文档官网优化分析',
        dateStr: 'November 10, 2025',
        ogDescription: 'Optimization analysis of Vite document official website',
        metaDescription: 'Optimization analysis of Vite document official website',
        ogTitle: 'Optimization analysis of Vite document official website',
        ogUrl: import.meta.env.DEV ? 'http://localhost:5173/vite-op' : 'https://blog.hiou.top/vite-op',
        href: "hiou.top/vite-op/index.html",
        containerStyle: { maskImage: 'linear-gradient(to bottom, black 99.1%, transparent 100%)' },
        headerDes: ['Suitable temperature.', '&amp; The food is delicious.', 'November 10, 2025']
    },
    { code: "dollar-state",
        des: 'svelte的$state在React中的基础实现',
        dateStr: 'November 14, 2025',
        ogDescription: 'The Basic Implementation of $state of svelte in React',
        metaDescription: 'The Basic Implementation of $state of svelte in React',
        ogTitle: 'The Basic Implementation of $state of svelte in React',
        ogUrl: import.meta.env.DEV ? 'http://localhost:5173/dollar-state' : 'https://blog.hiou.top/dollar-state',
        href: "hiou.top/dollar-state/index.html",
        containerStyle: { maskImage: 'linear-gradient(to bottom, black 99.1%, transparent 100%)' },
        headerDes: ['Warm coffee.', '&amp; The cat flipping its belly.', 'November 14, 2025']
    },
    { code: "dollar-effect",
        des: 'svelte的$effect在React中的基础实现',
        dateStr: 'November 19, 2025',
        ogDescription: 'The Basic Implementation of $effect of svelte in React',
        metaDescription: 'The Basic Implementation of $effect of svelte in React',
        ogTitle: 'The Basic Implementation of $effect of svelte in React',
        ogUrl: import.meta.env.DEV ? 'http://localhost:5173/dollar-effect' : 'https://blog.hiou.top/dollar-effect',
        href: "hiou.top/dollar-effect/index.html",
        containerStyle: { maskImage: 'linear-gradient(to bottom, black 99.1%, transparent 100%)' },
        headerDes: ['The setting sun shines golden light.', '&amp; The kitten is snoring.', 'November 19, 2025']
    },
    { code: "dollar-derived",
        des: 'svelte的$derived在React中的基础实现',
        dateStr: 'November 20, 2025',
        ogDescription: 'The Basic Implementation of $derived of svelte in React',
        metaDescription: 'The Basic Implementation of $derived of svelte in React',
        ogTitle: 'The Basic Implementation of $derived of svelte in React',
        ogUrl: import.meta.env.DEV ? 'http://localhost:5173/dollar-derived' : 'https://blog.hiou.top/dollar-derived',
        href: "hiou.top/dollar-derived/index.html",
        containerStyle: { maskImage: 'linear-gradient(to bottom, black 98.8%, transparent 100%)' },
        headerDes: ['People lie on the lawn in the sun.', '&amp; AI is getting smarter.', 'November 19, 2025']
    },
    { code: "svelte-checkversion",
        des: 'Svelte的版本检查更新机制',
        dateStr: 'November 25, 2025',
        ogDescription: 'Svelte\'s version checking and updating mechanism',
        metaDescription: 'Svelte\'s version checking and updating mechanism',
        ogTitle: 'Svelte\'s version checking and updating mechanism',
        ogUrl: import.meta.env.DEV ? 'http://localhost:5173/svelte-checkversion' : 'https://blog.hiou.top/svelte-checkversion',
        href: "hiou.top/svelte-checkversion/index.html",
        containerStyle: { maskImage: 'linear-gradient(to bottom, black 98.8%, transparent 100%)' },
        headerDes: ['The winter in the south is not so cold.', '&amp; Learning makes me feel warm.', 'November 25, 2025']
    },
    { code: "svelte-base-render",
        des: 'Svelte基础渲染流程',
        dateStr: 'November 28, 2025',
        ogDescription: 'Svelte basic rendering process',
        metaDescription: 'Svelte basic rendering process',
        ogTitle: 'Svelte basic rendering process',
        ogUrl: import.meta.env.DEV ? 'http://localhost:5173/svelte-base-render' : 'https://blog.hiou.top/svelte-base-render',
        href: "hiou.top/svelte-base-render/index.html",
        containerStyle: { maskImage: 'linear-gradient(to bottom, black 98.8%, transparent 100%)' },
        headerDes: ['The winter in the south is not so cold.', '&amp; Learning makes me feel warm.', 'November 25, 2025']
    },
    { code: "svelte-code-effect",
        des: 'SVELTE源码分析：如何创建一个effect',
        dateStr: 'December 9, 2025',
        ogDescription: 'SVELTE source code analysis: how to create an effect',
        metaDescription: 'SVELTE source code analysis: how to create an effect',
        ogTitle: 'SVELTE source code analysis: how to create an effect',
        ogUrl: import.meta.env.DEV ? 'http://localhost:5173/svelte-code-effect' : 'https://blog.hiou.top/svelte-code-effect',
        href: "hiou.top/svelte-code-effect/index.html",
        containerStyle: { maskImage: 'linear-gradient(to bottom, black 98.8%, transparent 100%)' },
        headerDes: ['The winter in the south is not so cold.', '&amp; Learning makes me feel warm.', 'November 25, 2025']
    },
    { code: "svelte-code-array",
        des: 'SVELTE源码分析：数组渲染及DIFF算法',
        dateStr: 'December 12, 2025',
        ogDescription: 'SVELTE source code analysis: array rendering and DIFF algorithm',
        metaDescription: 'SVELTE source code analysis: array rendering and DIFF algorithm',
        ogTitle: 'SVELTE source code analysis: array rendering and DIFF algorithm',
        ogUrl: import.meta.env.DEV ? 'http://localhost:5173/svelte-code-array' : 'https://blog.hiou.top/svelte-code-array',
        href: "hiou.top/svelte-code-array/index.html",
        containerStyle: { maskImage: 'linear-gradient(to bottom, black 99.5%, transparent 100%)' },
        headerDes: ['The winter in the south is not so cold.', '&amp; Learning makes me feel warm.', 'November 25, 2025']
    },
    // { code: "podman-secret", des: '使用podman的secret', href: "hiou.top/podman-secret/index.html" },
]


const Tip = lazy(() => import('../Tip'))
const Footer = lazy(() => import('../Footer'))
let shouldGetRemoteData = false;

const Article: React.FC<{ htmlString?: string }> = ({ htmlString }) => {
    // const safeHtmlString = !!htmlString ? getSafeDOM(htmlString) : ''
    const { articleInfos, dispatch } = useAppContext()
    const { pathname } = useLocation()
    const code = pathname.slice(1) || 'podman'
    const html = htmlString || articleInfos?.[code]?.html
    const navigate = useNavigate()
    const { des: title = '', containerStyle, headerDes } = sideBarData.find(v => v.code === code) || {}
    // const title = sideBarData.find(v => v.code === code)?.des || ''
    // mask-image: linear-gradient(to bottom, black 98.9%, transparent 100%);
    // const containerStyle = sideBarData.find(v => v.code === code)?.containerStyle || {}
    
    useEffect(() => {
        saveWAccessInfo(code)
    }, [code])

    useEffect(() => {
        // console.log("[pathname]: ", pathname)
        const active = pathname.slice(1)
        const currentSideBarData = sideBarData.find(v => v.code === (active || 'podman'));
        // 切换路由修改head 
        currentSideBarData && updateHeadMeta({
            title: currentSideBarData?.des || '',
            canonical: currentSideBarData?.href || '',
            ogDescription: currentSideBarData?.ogDescription || '',
            metaDescription: currentSideBarData?.metaDescription || '',
            ogTitle: currentSideBarData?.ogTitle || '',
            ogUrl: currentSideBarData?.ogUrl || ''
        })
    }, [pathname])

    useEffect(() => {
        // console.log("[appData]: ", articleInfos)
        // 这里是客户端的逻辑 客户端加载了js代码后会开始执行 这时客户端是没有html的
        if (!html && shouldGetRemoteData) {
            // 获取数据
            import(`../../dataFile/${code}/${code}-delta.ts`).then(r => {
                // console.log(`dataFile${pathname}: `, r?.default)
                dispatch!({
                    type: 'setArticleInfos',
                    payload: {
                        code,
                        html: r?.default.content
                    }
                })
            })
        } else {
           shouldGetRemoteData = true
        }
    }, [html, code])

    return <div style={{ isolation: 'isolate' }}>
        <div className={style['article_container']} style={containerStyle || { maskImage: 'linear-gradient(to bottom, black 98.9%, transparent 100%)' }}>
            <Tip title={title} key={`${title}`}/>
            <div className={style.article}>
                <Head title={title} headerDes={headerDes} code={code}/>
                {
                    import.meta.env.DEV ? <>
                        <button style={{ marginTop: 16 }} onClick={(e) => {
                            e?.preventDefault();   // 阻止默认行为
                            e?.stopPropagation();  // 阻止冒泡
                            navigate(`/podman-start`, {
                                preventScrollReset: true,
                                viewTransition: true
                            })
                            // history.replaceState({}, '', href); // 修正 URL 显示 .html
                        }}>跳转 /podman-start</button>
                        <button onClick={(e) => {
                            e?.preventDefault();   // 阻止默认行为
                            e?.stopPropagation();  // 阻止冒泡
                            navigate(`/`, {
                                preventScrollReset: true,
                                viewTransition: true
                            })
                            // history.replaceState({}, '', href); // 修正 URL 显示 .html
                        }}>跳转 /</button>
                        <button onClick={(e) => {
                            e?.preventDefault();   // 阻止默认行为
                            e?.stopPropagation();  // 阻止冒泡
                            saveWAccessInfo(code)
                            // history.replaceState({}, '', href); // 修正 URL 显示 .html
                        }}>记录访问</button>
                        <button onClick={() => {
                            const currentTheme = document.documentElement.getAttribute('data-theme')
                            document.documentElement.setAttribute('data-theme', currentTheme === 'Dark' ? 'Light' : 'Dark')
                        }}>切换主题</button>
                    </> : null
                }
                {/* <SideBar data={sideBarData} active={pathname} onClick={({ code }) => {
                    // TODO: 1.拦截a标签跳转行为 2.切换路由 3.当前路由点击无效 4.修正 URL 显示 .html
                    if (code === pathname) return
                    navigate(`/${code}`, {
                        preventScrollReset: true,
                        viewTransition: true
                    })
                }}/> */}
                <main className={style.view_container}>
                    <View html={html || ''}/>
                </main>
                <div className={`${style.view_footer_mask} ${style.fix_bottom}`}/>
            </div>
        </div>
        <Footer />
    </div>
};

export default Article;


