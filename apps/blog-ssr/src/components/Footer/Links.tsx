import { useNavigate } from "react-router"
import { useLocation } from "react-router-dom"
import { preLoadAssets, syncWaite } from "../../utils"
import podmanDeltaUrl from '../../dataFile/podman/podman-delta.ts?url'
import podmanStartDeltaUrl from '../../dataFile/podman-start/podman-start-delta.ts?url'
import podmanPersistenceDeltaUrl from '../../dataFile/podman-persistence/podman-persistence-delta.ts?url'
import vitePoDeltaUrl from '../../dataFile/vite-po/vite-po-delta.ts?url'
import dollarState from '../../dataFile/dollar-state/dollar-state-delta.ts?url'
import dollarEffect from '../../dataFile/dollar-effect/dollar-effect-delta.ts?url'
import dollarDerived from '../../dataFile/dollar-derived/dollar-derived-delta.ts?url'
import svelteCheckversion from '../../dataFile/svelte-checkversion/svelte-checkversion-delta?url'
import svelteBaseRender from '../../dataFile/svelte-base-render/svelte-base-render-delta?url'
import svelteCodeEffect from '../../dataFile/svelte-code-effect/svelte-code-effect-delta?url'
import svelteCodeArray from '../../dataFile/svelte-code-array/svelte-code-array-delta?url'
import style from './links.module.css'

const awaitTimeInLink = syncWaite(600)

// ADD:
type PathMapToAssetsMapType =
    'podman' |
    'podman-start' |
    'podman-persistence' |
    'vite-po' |
    'dollar-state' |
    'dollar-effect' |
    'dollar-derived' |
    'svelte-base-render' |
    'svelte-code-effect' |
    'svelte-code-array'

const pathMapToAssetsMap = {
    'podman': podmanDeltaUrl,
    'podman-start': podmanStartDeltaUrl,
    'podman-persistence': podmanPersistenceDeltaUrl,
    'vite-po': vitePoDeltaUrl,
    'dollar-state': dollarState,
    'dollar-effect': dollarEffect,
    'dollar-derived': dollarDerived,
    'svelte-checkversion-delta': svelteCheckversion,
    'svelte-base-render': svelteBaseRender,
    'svelte-code-effect': svelteCodeEffect,
    'svelte-code-array': svelteCodeArray,
}

const Links: React.FC<{ links: { des: string, link: string, code: string, date: string }[] }> = ({ links }) => {
    const navigate = useNavigate()
    const { pathname } = useLocation()

    return <section className={style.links_container}>
        <div className={style.links}>
            <div className={style.links_title}>Links </div>
            <div className={style.links_list}>
                {
                    links.map(({ link, code, des, date }) => {
                        return <div key={code} className={style.link_item}>
                            <a
                                className={style.link_a} href={link}
                                onMouseEnter={() => {
                                    const assetsUrl = (pathMapToAssetsMap[code as PathMapToAssetsMapType] as string)?.split("?")?.[0]
                                    assetsUrl && preLoadAssets(assetsUrl)
                                }}
                                onClick={(e) => {
                                    if (!awaitTimeInLink()) return
                                    e?.preventDefault();   // 阻止默认行为
                                    e?.stopPropagation();  // 阻止冒泡

                                    let currentCode = ''
                                    try {
                                        if (pathname === '/') {
                                            currentCode = 'podman'
                                        } else {
                                            currentCode = pathname?.split('/')?.[1]
                                        }
                                    } catch (error) {
                                        console.log(error)
                                    }

                                    if (currentCode === code) return

                                    // navigate(`/${code === 'podman' ? '' : code}`, {
                                    //     preventScrollReset: true,
                                    //     viewTransition: true
                                    // })
                                    navigate(`/${code}`, {
                                        preventScrollReset: true,
                                        viewTransition: true
                                    })
                                    window.requestIdleCallback(() => {
                                        window.scrollTo({
                                            top: 0,
                                            behavior: 'smooth'
                                        })
                                    })
                                }}
                            >
                                {des}
                            </a>
                            <span className={`${style.link_date} text_digit_font`}>{date}</span>
                        </div>
                    })
                }
            </div>
        </div>
        {/* <div className={style.divider}></div> */}
    </section>
}

export default Links
