import { getCurrentRunner, RunnerType } from "./$effect"
import { RecomputeRunnerType } from "./$derived"
import TargetSubs from "./helper/TargerSubs"

// deepStore.ts
type Subscriber = () => void

function isObject(o: any) {
  return o !== null && typeof o === 'object'
}

export function createStore<T extends object>(initial: T) {
  const subscribers = new Set<Subscriber>()
  // underlying original object (we keep it for snapshot reference)
  const root = initial
  let proxyContainerRoot: { proxy: any } = { proxy: null };

  // notify all subscribers (we batch via microtask to coalesce)
  let scheduled = false
  function notifyRender() {
    if (scheduled) return
    scheduled = true
    Promise.resolve().then(() => {
      scheduled = false
      for (const s of Array.from(subscribers)) s()
    })
  }

  // notify all react subscribers (effect derived etc.)
  function notifyReactSubRun(reactSubs?: Set<RunnerType | RecomputeRunnerType>) {
      reactSubs?.forEach(reactSub => {
        reactSub.__run()
    });
  }

  // cache of proxies to avoid rewrapping same object
  const proxyCache = new WeakMap<object, any>()
  const targetSubs = new TargetSubs()

  function makeProxy(obj: any) {
    if (!isObject(obj)) return obj
    const cached = proxyCache.get(obj)
    if (cached) return cached

    // 因为不能知道将自己这个特殊的Proxy类型对象传给对方
    // 所以构建一个普通对象代表自己 只要包含对方想要的信息即可
    const targetForDeps = { _version: 0 };

    const proxy = new Proxy(obj, {
      get(target, key, receiver) {
        const currentRunner = getCurrentRunner()
        console.log('[proxy] [get] 访问响应式变量 开始获取 currentRunner')

        if (currentRunner) { // sync get current effect runner if it is running
          console.log('[proxy] [get] 已获取 currentRunner')

          currentRunner.deps.add({ // add runner deps
            _subs: targetSubs.addSubsIfNeed(target, key, currentRunner),
            _version_snapshot: targetForDeps._version,
            target: targetForDeps
          })
        }

        const res = Reflect.get(target, key, receiver)
        // lazily wrap nested objects
        return isObject(res) ? makeProxy(res) : res
      },
      set(target, key, value, receiver) {
        const old = (target as any)[key]
        if (old === value) return true

        targetForDeps._version++
        const result = Reflect.set(target, key, value, receiver)
        proxyContainerRoot = { proxy: proxyContainerRoot.proxy }
        // if new value is object, wrap its children too (so further sets are tracked)
        // no need to replace with proxy here; getter will wrap on read
        // checkIfSnapshotChanged
        notifyRender()

        const subs = targetSubs.getSubs(obj, key)
        console.log(`[proxy] [set] [notifyReactSubRun ] 变量（${String(key).toString()}）更新 通知订阅者执行`, subs)

        notifyReactSubRun(subs)
        return result
      },
      deleteProperty(target, key) {
        const existed = key in target
        const result = Reflect.deleteProperty(target, key)
        if (existed && result) notifyRender()
        return result
      }
    })

    proxyCache.set(obj, proxy)
    return proxy
  }

  proxyContainerRoot.proxy = makeProxy(root)

  return {
    // proxy: proxyContainerRoot as T,
    subscribe(cb: Subscriber) {
      subscribers.add(cb)
      return () => subscribers.delete(cb)
    },
    getSnapshot() {
      // return the underlying root (note: it's mutable). If you want immutable snapshot, clone here.
      
      // function checkIfSnapshotChanged(inst) {
      //   var latestGetSnapshot = inst.getSnapshot;
      //   inst = inst.value;
      //   try {
      //     var nextValue = latestGetSnapshot();
      //     return !objectIs(inst, nextValue);
      //   } catch (error) {
      //     return true;
      //   }
      // }

      return proxyContainerRoot as T
    },
    // full replace
    // set(newRoot: T) {
    //   root = newRoot
    //   // clear cache because object identity changed
    //   proxyCache = new WeakMap<object, any>()
    //   notify()
    // }
  }
}
