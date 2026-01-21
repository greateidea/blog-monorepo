// export * as 'podman-delta' from './podman/podman-delta'
// export * as 'podman-start-delta' from './podman-start/podman-start-delta'

// ADD:
export const getDeltaData = async () => {
    return {
        'podman-delta': await import('./podman/podman-delta'),
        'podman-start-delta': await import('./podman-start/podman-start-delta'),
        'podman-persistence-delta': await import('./podman-persistence/podman-persistence-delta'),
        'vite-po-delta': await import('./vite-po/vite-po-delta'),
        'dollar-state-delta': await import('./dollar-state/dollar-state-delta'),
        'dollar-effect-delta': await import('./dollar-effect/dollar-effect-delta'),
        'dollar-derived-delta': await import('./dollar-derived/dollar-derived-delta'),
        'svelte-checkversion-delta': await import('./svelte-checkversion/svelte-checkversion-delta'),
        'svelte-base-render-delta': await import('./svelte-base-render/svelte-base-render-delta'),
        'svelte-code-effect-delta': await import('./svelte-code-effect/svelte-code-effect-delta'),
        'svelte-code-array-delta': await import('./svelte-code-array/svelte-code-array-delta'),
    }
}
