import style from './tip.module.css'
import { Progress } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { articleLoadEventsOnce } from '../View/index'
import { debounce, elementScrollIntoViewByOffset, syncWaite } from '../../utils'
import GuidePointer from './GuidePointer'
import gsap from 'gsap'

const awaitTime = syncWaite(600)

const observerOptions = {
    root: null,
    rootMargin: '-15% 0px -55% 0px', // 表示视口上方往下 25% 到下方 55% 的范围为“触发区”
    threshold: [1]
};

let ticking = false;

type H2ListType = {
    content: string, id: number | string, scrollIntoView: Function
}[]

const Tip: React.FC<{ title: string }> = ({ title }) => {
    const [tipText, setTipText] = useState<string>();
    const [articleProgress, setArticleProgress] = useState<number>(0)
    const [isListShow, setIsListShow] = useState(false)
    const [h2List, setH2list] = useState<H2ListType>([])
    const [active, setActive] = useState<any>(null)
    const tipContainerRef = useRef<any>(null);
    const tipListContainerRef = useRef<any>(null);
    const ulRef = useRef<any>(null);
    const tipContainerTweenRef = useRef<any>(null);
    const tipListTweenRef = useRef<any>(null);
    const tipListTweenScaleRef = useRef<any>(null);

    const docHeightRef = useRef<number>(null);
    const winHeightRef = useRef<number>(null);
    const animationTime = 0.29 // s
    const scaleAnimationTime = 0.33 // s

    // 注意⚠️功能：
    // 检测当前进入选定视口范围的所有二级标题
    // 排序后选择离顶部最近的标题 即排序后的第一个 作为当前标题列表的高亮标题
    const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
        // 我们按交叉比例排序，取最大的那个（最近进入视口/最明显的）
        const visibleNodes = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      
        if (visibleNodes.length > 0) {
        //   setTipText(visibleNodes[0].target.textContent || title)
          setActive(visibleNodes[0].target.id)
        }
      
        // 如果没有任何是 intersecting（快速滚动到顶部/底部），我们可选择：
        // - 根据滚动方向选择上一个或下一个；
        // - 或者不高亮任何项。
    }, [title]);
    const headingsRef = useRef<Element[]>(null)

    // 设置：1.滚动百分比 2.监测视口标题出入 3.列出标题导航
    useEffect(() => {
        let head1 = document.querySelectorAll('body h1')?.[0]
        const intersectionObserverRef = new IntersectionObserver(observerCallback, observerOptions)
         // 整个文档高度 包含视口之外的部分
        docHeightRef.current = document.documentElement.scrollHeight
        winHeightRef.current = window.innerHeight; // 当前可见窗口的高度

        // 设置滚动回调计算百分比
        const scrollEventCb = () => {
            // 注意⚠️优化点
            // ticking 表示每次计算完高度了 下次的scrollEventCb触发才允许继续计算
            if (!ticking) {
                // 注意⚠️优化点
              window.requestAnimationFrame(() => {
                const scrollTop = window.scrollY; // 内容向上滚动的高度
                const docHeight = docHeightRef.current!;
                const winHeight = winHeightRef.current!;
          
                // 这里分母为什么是docHeight - winHeight呢
                // 想想拉到最底部时 应该是100% 但此时可见窗口里的内容是不能继续向上拉到顶的
                // 也就是说拉到底时 内容向上滚动的高度最大值就是：
                // 整个文档高度 - 当前可见窗口高度
                const percent = (scrollTop / (docHeight - winHeight)) * 100;
                // console.log('window scroll cb percent: ', percent)
                
                let currentArticleProgress = percent;
                if (percent > 100) currentArticleProgress = 100
                if (percent < 0) currentArticleProgress = 0
                setArticleProgress(currentArticleProgress)
          
                ticking = false; // 计算完了 下次scrollEventCb触发允许继续计算
              });
              ticking = true;
            }
        }

        // 窗口高度变化重置高度
        // 注意⚠️优化点：debounce
        const resizeEventCb = debounce(() => {
            docHeightRef.current = document.documentElement.scrollHeight
            winHeightRef.current = window.innerHeight
        }, 200)

        const showH2List = (h2s: Element[]) => {
            setH2list(h2s.map(h => ({
                content: h.textContent || '',
                id: h.id,
                scrollIntoView: () => elementScrollIntoViewByOffset(h)
            })))
        }

        headingsRef.current = Array.from(document.querySelectorAll('article h2'));

        window?.addEventListener('resize', resizeEventCb);
        if (headingsRef.current?.length) { // 如果是在服务端渲染 这里就能直接取到article h2
            window?.addEventListener('scroll', scrollEventCb);
            const h2s = headingsRef.current;
            showH2List(h2s);
            [head1, ...h2s].forEach(h => intersectionObserverRef.observe(h))
        } else {
            head1 = document.querySelectorAll('body h1')?.[0]
            articleLoadEventsOnce.push(() => {
                // 如果是客户端渲染就把这些操作加入任务 等到页面有article h2内容了 再操作
                // 
                window?.addEventListener('scroll', scrollEventCb);
                resizeEventCb(); // 有内容了此时文档高度有变化重新设置
                // 有内容了这时再取'article h2'
                const h2s = Array.from(document.querySelectorAll('article h2'));
                showH2List(h2s);
                [head1, ...h2s]?.forEach(h => intersectionObserverRef.observe(h));
            })
        }

        return () => {
            window.removeEventListener('scroll', scrollEventCb)
            window.removeEventListener('resize', resizeEventCb)
        }
    }, [title])

    // 设置：标题和初始进度0
    useEffect(() => {
        setTipText(title)
        setArticleProgress(0)
    }, [title])

    // 设置：动画控制实例
    useEffect(() => {
        if (!title) {
            // title没有的时候不要显示 不然有一个闪烁问题
            gsap.set(
                tipContainerRef.current, {
                display: 'none'
            })
        } else if (title) {
            // 横向展示标题栏
            gsap.from(
                tipContainerRef.current, 
                {
                    duration: 0.45,
                    // scale: 0.8,
                    opacity: 0,
                    filter: 'blur(10)',
                    // y: -20,
                    width: '50px',
                    delay: 0.45
                },
            )

            // 整个外层扩展到固定宽度400px
            tipContainerTweenRef.current = gsap.to(
                tipContainerRef.current, 
                {
                    duration: animationTime,
                    width: 400,
                    border: 0,
                    paused: true,
                },
            )

            // 容纳列表的 ul 高度扩展至内容高度
            tipListTweenRef.current = gsap.to(
                tipListContainerRef.current, 
                {
                    duration: animationTime,
                    height: () => {
                        return ulRef.current.offsetHeight
                    },
                    paused: true,
                }
            )

            // 包裹ul的层 开始scale opacity filter变化
            tipListTweenScaleRef.current = gsap.from(
                tipListContainerRef.current, 
                {
                    duration: scaleAnimationTime,
                    transformOrigin: "10% center",
                    scale: 0.8,
                    opacity: 0.1,
                    filter: 'blur(10px)',
                    delay: 0.08,
                    paused: true,
                }
            )
        }
    }, [title])

    const playAnimation = useCallback(() => {
        tipContainerTweenRef.current.play()
        tipListTweenRef.current.play()
        tipListTweenScaleRef.current.play()
        // 解决超出height的隐藏内容也能触发hover背景模糊效果
        gsap.set(tipListContainerRef.current, { visibility: 'visible' })
    }, [])

    const reverseAnimation = useCallback(() => {
        tipContainerTweenRef.current.reverse()
        tipListTweenRef.current.reverse()
        tipListTweenScaleRef.current.reverse()
        // 解决超出height的隐藏内容也能触发hover背景模糊效果
        setTimeout(() => {
            gsap.set(tipListContainerRef.current, { visibility: 'hidden' })
        }, 600)
    }, [])

    // const onTipClickMemo = useCallback(() => {

    // } ,[h2List, isListShow])


    return <div className={style['tip_display']}
        style={{
            transform: `translateX(-50%) ${tipText ? 'scale(1)' : 'scale(0)'}`
        }}
    >
        <nav
            // tabIndex={0}
            // onBlur={() => {
            //     // 这里解决不一个奇怪的bug:
            //     // 使用fixed布局，tab="0"，overflow: hidden，
            //     // 然后失去焦点，结果里面的内容会重新垂直居中排列
            //     tipContainerRef.current.style.overflow = ''
            //     if (isListShow) {
            //         reverseAnimation()
            //         setIsListShow(pre => !pre)
            //     }
            // }}
            // onFocus={() => {
            //     // 这里解决不一个奇怪的bug:
            //     // 使用fixed布局，tab="0"，overflow: hidden，
            //     // 然后失去焦点，结果里面的内容会重新垂直居中排列
            //     tipContainerRef.current.style.overflow = 'hidden'
            // }}
            ref={(navRefNode) => {
                tipContainerRef.current = navRefNode
            }}
            style={{ transition: `padding 480ms ease`, overflowY: 'hidden' }}
            
            className={`${style['tip_container']} ${isListShow ? style['tip_container_showlist'] : ''}`}
        >
            <div className={`${style['tip_content']}`}
                onClick={() => {
                    if (!h2List.length || !awaitTime()) return
                    setTimeout(() => {
                        if (isListShow) {
                            reverseAnimation()
                        } else {
                            playAnimation()
                        }
                        setIsListShow(pre => !pre)
                    })
                }}
            >
                <Progress
                    size={18}
                    percent={articleProgress}
                    type="circle" 
                    format={(number) => `${number}%`}
                    strokeWidth={12}
                    trailColor='#424c5f'
                    strokeColor='#c6d9fc'
                />
                <span className={style['tip_title']}>{tipText}</span>
                <div 
                    className={`${style['tip_down']}${isListShow ? ` ${style['tip_to_up']}` : '' }`}
                >
                </div>
            </div>
            <div
                ref={tipListContainerRef}
                style={{
                    height: 0,
                }}
                // tabIndex={0}
                // onBlur={() => {
                //     // 这里解决不一个奇怪的bug:
                //     // 使用fixed布局，tab="0"，overflow: hidden，
                //     // 然后失去焦点，结果里面的内容会重新垂直居中排列
                //     tipContainerRef.current.style.overflow = ''
                //     if (isListShow) {
                //         reverseAnimation()
                //         setIsListShow(pre => !pre)
                //     }
                // }}
                // onFocus={() => {
                //     // 这里解决不一个奇怪的bug:
                //     // 使用fixed布局，tab="0"，overflow: hidden，
                //     // 然后失去焦点，结果里面的内容会重新垂直居中排列
                //     tipContainerRef.current.style.overflow = 'hidden'
                // }}
            >
                {/* <ul style={isListShow ? {}: {display: 'none'}} ref={(ulRefNode) => { */}
                <ul 
                    ref={(ulRefNode) => {
                        ulRef.current = ulRefNode
                    }}
                    // style={{ transition: `filter ${scaleAnimationTime}s ease` }}
                >
                    {h2List.map(h2 => {
                        return <li tabIndex={0} key={`li-${h2.id}`} >
                            <div className={style['tip_guide_container']}>
                                {active === h2.id ? <GuidePointer /> : null}
                                <a
                                    href={`#${h2.id}`}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        h2.scrollIntoView()
                                        setActive(h2.id)
                                    }}
                                >
                                    {h2.content}
                                </a>
                            </div>
                        </li>
                    })}
                </ul>
            </div>
        </nav>
    </div>
}

export default Tip;
