import { RunnerType } from "../$effect"
import { RecomputeRunnerType } from "../$derived"

export default class TargetSubs {
    // target -> prop map
    private targetPropSubsMap = new WeakMap<object, Map<any, Set<RunnerType | RecomputeRunnerType>>>()

    addSubsIfNeed(target: object, prop: any, sub: RunnerType | RecomputeRunnerType) {
        let targetMap = null
        let targetPropSet = null

        if (!this.targetPropSubsMap.has(target)) {
            targetPropSet = new Set([sub])
            this.targetPropSubsMap.set(target,  new Map([[prop, targetPropSet]]))

            console.log('[TargetSubs] [add] 初始化 Target Map', this.targetPropSubsMap)

            return targetPropSet
        }

        targetMap = this.targetPropSubsMap.get(target)!

        if (!targetMap.has(prop)) {
            targetPropSet = new Set([sub])
            targetMap.set(prop, targetPropSet)
            console.log('[TargetSubs] [add] 初始化 Prop Set', targetMap)

            return targetPropSet
        }

        targetPropSet = targetMap.get(prop)!

        if (!targetPropSet.has(sub)) {
            console.log('[TargetSubs] [add] 新增 target prop 依赖', targetPropSet)

            targetPropSet.add(sub)
        }

        return targetPropSet
    }

    getSubs(target: object, prop: any) {
        return this.targetPropSubsMap.get(target)?.get(prop)
    }
}
