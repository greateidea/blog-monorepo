// useDeepStore.ts
import { useSyncExternalStore, useRef } from 'react';
import { createStore } from './$stateProxy';
import { getCurrentRunner } from './$effect';

type ExternalStoreType<T> = {
    subscribe: (onStoreChange: () => void) => () => void,
    getSnapshot: () => T,
}

function useTodoStore<T extends { proxy?: any }>(externalStore?: ExternalStoreType<T>) {
    let store = externalStore
    if(!externalStore) {
        store = {
            subscribe: () => () => {},
            getSnapshot: () => ({} as T),
        }
    }
    const pc = useSyncExternalStore(
        store!.subscribe,
        () => store!.getSnapshot()
    )
    return pc.proxy
}

const $state = (value: any) => {
    const createStoreRef = useRef<ExternalStoreType<{ proxy?: any }> | undefined>(undefined)
    
    if (!createStoreRef.current) {
        createStoreRef.current = createStore(value)
    }

    const todoStore = useTodoStore(createStoreRef.current)

    // 如果是在 $effect 里声明的变量 则直接返回原值
    if (getCurrentRunner()) {
        return value
    }

    return todoStore
}

function useTodoStoreWrapper(value: any) {
    return useTodoStore(createStore(value))
}

const $contextState = (value: any) => useTodoStoreWrapper(value)
// const $contextState = (value: any) => () => useTodoStore(createStore(value))

export const CountHook = $contextState({ value: { value: 0 } })

export default $state
