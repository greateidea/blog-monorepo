import { useCallback, useState } from "react"

const useAutoRectAnimationHook = (container: HTMLElement | null, options: { duration?: number, easing?: string, disableAutoComputeRect?: 'width' | 'height' }) => {
    const [startRect, setStartRect] = useState<{ startW: number, startH: number }>()
    const [isInitialLock, setIsInitialLock] = useState(false)
    const { duration = 800, easing = 'ease', disableAutoComputeRect } = options

    const lockOriginRect = useCallback(() => {
        if (!container) return
        // 2) 锁定为起始像素尺寸（以避免 instant layout jump）
        container!.style.width = container.offsetWidth + 'px';
        container!.style.height = container.offsetHeight + 'px';
        setStartRect({ startW: container.offsetWidth, startH: container.offsetHeight })
        container!.getBoundingClientRect()
    }, [container])

    const tryLockOnce = useCallback(() => {
        if (!isInitialLock) {
            setIsInitialLock(true)
            lockOriginRect()
        }
    }, [isInitialLock, container])

    const applyAnimation = useCallback(() => {
        if (!startRect || !container ) return
        const endW = container!.scrollWidth;
        const endH = container!.scrollHeight;
        if (endW === startRect.startW && endH === startRect.startH) {
            // 恢复到 auto，去掉临时内联样式
            lockOriginRect()
            return;
        }
        // 给出过渡并设置目标尺寸
        container.style.transition = `width ${duration}ms ${easing}, height ${duration}ms ${easing}, padding 20000ms ${easing}`;
        // 需要把目标值用像素显示出来以便 transition 可计算
        // container.style.width = endW + 'px';
        container.style.width = disableAutoComputeRect === 'width' ? '' : endW + 'px';
        container.style.height = disableAutoComputeRect === 'height' ? '' : endH + 'px';
        container.addEventListener('transitionend', onTransitionEnd);
    }, [container, startRect, isInitialLock])

      // 7) 过渡结束后清理内联样式（恢复 auto 布局）
    const onTransitionEnd = useCallback((e: any) => {
        // 等待 width 或 height 的任何一个结束（其中一个结束即可）
        if (container && (e.propertyName === 'width' || e.propertyName === 'height')) {
            container.style.transition = '';
            container.style.width = '';
            container.style.height = '';
            container.removeEventListener('transitionend', onTransitionEnd);
        }
    }, [container])

    return {
        tryLockOnce,
        applyAnimation
    }
}

export default useAutoRectAnimationHook


