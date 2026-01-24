import { useRef } from "react"
import { RecomputeRunnerType } from './$derived'

export type RunnerType = {
    (): void;
    __run: () => void;
    deps: Set<RunnerDepsType>;
    cleanup: unknown | null | never;
    stop: () => void;
    running: boolean;
}

export type RunnerDepsType = {
    _subs: Set<RunnerType | RecomputeRunnerType>
}

type EffectFnResult = unknown | null | never | void
type EffectFn = () => EffectFnResult

const RUNNER_STACK: (RunnerType | RecomputeRunnerType)[] = []

export const getCurrentRunner = () => RUNNER_STACK[RUNNER_STACK.length - 1]

export function pushRunner(runner: RunnerType | RecomputeRunnerType) {
    RUNNER_STACK.push(runner)
    console.log('[pushRunner]: 当前 Runner 栈 ', RUNNER_STACK)
}
  
// helper: safely pop runner and validate it's the same one
export function popRunnerExpect(runner: RunnerType | RecomputeRunnerType) {
    const topRunner = RUNNER_STACK[RUNNER_STACK.length - 1]
    if (topRunner === runner) {
        RUNNER_STACK.pop()
        return
    } else if (RUNNER_STACK.length > 0) {
        // use splice to keep the original variable reference unchanged
        const runnerIndex = RUNNER_STACK.findIndex(r => r === runner)
        RUNNER_STACK.splice(runnerIndex, 1)
        // throw new Error("sync pop runner error")
    }
}
  
function makeRunner(fn: EffectFn): RunnerType {
    console.log('[makeRunner] 进入 makeRunner')

    function runner() {
        // Clean previous deps: remove runner from each previous signal's subs
        runner._cleanupDependencies()
    
        console.log('[makeRunner] [runner] 入栈 pushRunner ')
        // Enter runner global context
        pushRunner(runner)
        try {
            console.log('[makeRunner] [runner] 开始执行注册 fn');

            (runner.cleanup as EffectFnResult) = fn(); // rebuild dependencies
            runner.running = false;
        } finally {
            console.log('[makeRunner] [runner] 出栈 popRunnerExpect')
            // Pop but validate it's the same runner
            popRunnerExpect(runner)
        }
    }

    runner.running = false
    runner.stopped = false
    runner.cleanup = null
    runner.deps = new Set<RunnerDepsType>()
  
    // wrapped version used by scheduler to ensure no direct external calls bypassing __run
    runner.__run = function() {
      if (runner.stopped) return

      // TODO：版本检查
      // ...

      if (!runner.running) {
            console.log('[makeRunner] [__run] 开始将 runner 推入微任务队列')
            runner.running = true // merge all execution requests during this period before the actual start
            queueMicrotask(() => {
                if (runner.running) {
                    console.log('[makeRunner] [__run] [queueMicrotask] 微任务执行 runner()')

                    runner();
                }
            });
        }
    }


    runner._cleanupDependencies = () => {
        console.log('[runner._cleanupDependencies] 开始清理依赖')

        // Clean previous deps: remove runner from each previous signal's subs
        for (const sig of runner.deps) {
            sig._subs.delete(runner)
        }
        runner.deps.clear()

        
        if (runner.cleanup) {
            console.log('[runner._cleanupDependencies cleanup] 执行返回清理函数');

            (runner.cleanup as () => void)()
            runner.cleanup = null
        }
    }
  
    runner.stop = function() {
      // remove from current dependencies
      for (const sig of runner.deps) sig._subs.delete(runner)
      runner.deps.clear()
      runner.stopped = true
    };
  
    return runner
}
  
export function effect(fn: EffectFn) {
    console.log("[effect]: 进入")

    // 如果 $effect 是嵌套声明的则弹出所有runner并直接执行注册的 fn 后返回
    if (RUNNER_STACK.length) {
        const _copy_runner_stack = RUNNER_STACK.splice(0)
        fn()
        RUNNER_STACK.push(..._copy_runner_stack)
        return
    }

    const r = makeRunner(fn)

    console.log("[effect]: 首次挂载时执行 r()");
    // initial sync run to collect deps
    r()
    // return stop
    return () => r.stop()
}

export const $effect = (fn: EffectFn) => {
    console.log("[$effect]: 进入")

    const __fn_ref = useRef<EffectFn>(null);
    if (!__fn_ref.current) {
        console.log("[$effect]: 通过条件 -> !__fn_ref.current")

        __fn_ref.current = fn
        effect(__fn_ref.current)
    }
}
