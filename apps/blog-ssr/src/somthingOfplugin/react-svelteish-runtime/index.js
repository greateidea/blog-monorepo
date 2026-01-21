// ./react-svelteish-runtime/index.js
import { signal, effect } from '@preact/signals-react';

/**
 * 最小实现：__s$state 返回一个 Proxy，
 * - 读取 obj.prop -> 返回 signal.value[prop]
 * - 写入 obj.prop = v -> 替换 signal.value 为新的对象（shallow merge）
 * - 支持访问 .value 获取/设置完整对象
 * 
 * 这是"粗粒度的 per-property proxy"实现的简化版：简单、安全、易于理解。
 */

export function __s$state(initial) {
  const s = signal(initial ?? {});
  const handler = {
    get(_, prop) {
      if (prop === '__s_signal') return s;
      if (prop === 'value') return s.value;
      // allow methods like toJSON etc by delegating to s.value
      const v = s.value;
      return v == null ? undefined : v[prop];
    },
    set(_, prop, value) {
      if (prop === 'value') {
        s.value = value;
        return true;
      }
      // shallow merge: keep other props
      s.value = Object.assign({}, s.value || {}, { [prop]: value });
      return true;
    },
    has(_, prop) {
      if (prop === 'value' || prop === '__s_signal') return true;
      return (s.value || {}).hasOwnProperty(prop);
    },
    ownKeys() {
      return Object.keys(s.value || {});
    },
    getOwnPropertyDescriptor(_, prop) {
      return {
        configurable: true,
        enumerable: true,
        value: (s.value || {})[prop],
        writable: true
      };
    }
  };
  return new Proxy({}, handler);
}

export function __s$effect(fn) {
  // 将用户传进来的函数包装到 signals effect
  return effect(fn);
}

export function __s_assign(target, prop, value) {
  // 将 prop 写入 target，如果 target 是我们的 signal-proxy，则写入 signal
  if (target && target.__s_signal) {
    const s = target.__s_signal;
    s.value = Object.assign({}, s.value || {}, { [prop]: value });
    return;
  }
  try {
    target[prop] = value;
  } catch (err) {
    console.warn('[__s_assign] failed to assign', err);
  }
}
