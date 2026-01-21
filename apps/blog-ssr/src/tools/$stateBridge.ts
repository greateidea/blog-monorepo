// useDeepStore.ts
import { useSyncExternalStore, useRef } from 'react';
import { createStore } from './$stateProxy';
import { getCurrentRunner } from './$effect';

type ExternalStoreType<T> = {
    subscribe: (onStoreChange: () => void) => () => void,
    getSnapshot: () => T,
}

function useTodoStore<T extends { proxy?: any }>(externalStore?: ExternalStoreType<T>) {
    if(!externalStore) return {};
    const pc = useSyncExternalStore(
        externalStore.subscribe,
        () => externalStore.getSnapshot()
    )
    return pc?.proxy
}

const $state = (value: any) => {
    // 如果实在 $effect 里声明的变量 则直接返回原值
    if (getCurrentRunner()) {
        return value
    }

    let createStoreRef = useRef<ExternalStoreType<{ proxy?: any }> | undefined>(undefined)
    if (!createStoreRef.current) {
        createStoreRef.current = createStore(value)
    }

    return useTodoStore(createStoreRef.current)
}

const $contextState = (value: any) => () => useTodoStore(createStore(value))

export const CountHook = $contextState({ value: { value: 0 } })

export default $state
