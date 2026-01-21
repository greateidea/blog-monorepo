import { useRef } from "react";
import { getCurrentRunner, pushRunner, popRunnerExpect, RunnerType } from "./$effect"

export type RecomputeRunnerType = {
    (): DerivedFnResultType;
    __run: Function;
    _version?: number;
    deps: Set<RecomputeRunnerDepsType>;
}

type DerivedFnResultType = any
type DerivedFntType = () => DerivedFnResultType

type RecomputeRunnerDepsType = {
    _subs: Set<RunnerType | RecomputeRunnerType>;
    _version_snapshot?: number;
    target?: { _version: number; checkDepsVersion?: () => any}
}

// notify all react subscribers (effect derived etc.)
function notifyReactSubRun(reactSubs?: Set<RunnerType | RecomputeRunnerType>) {
    reactSubs?.forEach(reactSub => {
      reactSub.__run()
  });
}

export function derived(fn: DerivedFntType) {
    console.log('%c[derived] 开始 derived', "color:orange;padding: 6px 0;")

    let cached: DerivedFnResultType
    let status: 'DIRTY' | 'MAYBE_DIRTY' | 'CLEAN' = 'DIRTY'

    const subs = new Set<RunnerType | RecomputeRunnerType>()
  
    // 内部的 recompute runner：在其执行期间会收集依赖 signal（像 effect）
    function recomputeRunner() {
        console.log('%c[recomputeRunner] 进入 recomputeRunner 开始入栈', "color:orange;padding: 6px 0;")

        // 清理之前的依赖（如果有）
        recomputeRunner._cleanupDependencies()
    
        pushRunner(recomputeRunner)
        try {
            console.log('%c[recomputeRunner] 开始执行注册函数', "color:orange;padding: 6px 0;")
            
            const newValue = fn() // rebuild dependencies
            if (newValue !== cached) {
                console.log('%c[recomputeRunner] 新值更新 开始版本更新', "color:orange;padding: 6px 0;")
                
                recomputeRunner._version += 1
                cached = newValue
            } else {
                console.log('%c[recomputeRunner] 新值更新后未变 开始版不更新', "color:orange;padding: 6px 0;")
            }

            return newValue
        } finally {
            console.log('%c[recomputeRunner] 开始出栈', "color:orange;padding: 6px 0;")

            status = 'CLEAN'
            popRunnerExpect(recomputeRunner)
        }
    }

    recomputeRunner.deps = new Set<RecomputeRunnerDepsType>()
    recomputeRunner._version = 0;
    recomputeRunner.__run = () => {
        console.log('%c[recomputeRunner] 开始 __run 设置 MAYBE_DIRTY -> true', "color:orange;padding: 6px 0;")

        status = 'MAYBE_DIRTY'
        notifyReactSubRun(subs)
    }
    recomputeRunner._cleanupDependencies = () => {
        console.log('%c[recomputeRunner] 开始清理依赖关系', "color:orange;padding: 6px 0;")
        if (recomputeRunner.deps) {
            for (const sig of recomputeRunner.deps) sig._subs.delete(recomputeRunner)
        }
        recomputeRunner.deps.clear()
    }
    recomputeRunner.checkDepsVersion = () => {
        console.log('%c[derived] [checkDepsVersion] -> 开始逐级[依赖版本检查]', "color:orange;padding: 6px 0;")

        recomputeRunner.deps?.forEach(dep => {
            dep.target?.checkDepsVersion?.()

            if (dep?._version_snapshot !== dep.target?._version) {
                console.log(`%c[derived] [checkDepsVersion] -> 版本有更新 开始重新计算并更新 ${dep?._version_snapshot}->${dep.target?._version}`, "color:orange;padding: 6px 0;")

                return recomputeRunner()
            }

            console.log(`%c[derived] [checkDepsVersion] -> 未发现有版本有更新 ${dep?._version_snapshot}->${dep.target?._version}`, "color:orange;padding: 6px 0;")
        })
    }

    return {
        get value() {
            console.log('%c[derived] 访问 -> derived 值', "color:orange;padding: 6px 0;")

            if (status === 'DIRTY') {
                console.log('%c[derived] 访问 -> derived 值 -> [脏检查] DIRTY', "color:orange;padding: 6px 0;")

                recomputeRunner() // 更新依赖关系 更新状态 更新最新值
            } else if (status === 'MAYBE_DIRTY') { // 建立依赖前先检查依赖版本和更新状态
                console.log('%c[derived] 访问 -> derived 值 -> [依赖版本检查] MAYBE_DIRTY', "color:orange;padding: 6px 0;")
                
                // 依赖检查并更新
                recomputeRunner.checkDepsVersion()
            }

            // 如果被外部 effect 调用，则要把外部 runner 注册为依赖于这个 computed
            const current = getCurrentRunner()
            if (current) {
                console.log('%c[derived] 访问 -> derived 值: 处于 effect 上下文中 开始构建依赖关系', "color:orange;padding: 6px 0;")
                subs.add(current)
                current.deps.add({ // NOTE: for cleanup we need a signal-like ref
                    // trick: use a small wrapper so stop logic can remove recomputeRunner from subs
                    _subs: subs,
                    target: recomputeRunner,
                    _version_snapshot: recomputeRunner._version,
                })
            }

            return cached
        }
    }
}

export const $derived = (fn: DerivedFntType) => {
    let _derived_result_ref = useRef<{value: any}>(null)

    if (!_derived_result_ref.current) {
        console.log('%c[derived] 开始创建 已进入 _derived_result_ref.current', "color:orange;padding: 6px 0;")

        _derived_result_ref.current = derived(fn)
    }

    return _derived_result_ref.current
}
