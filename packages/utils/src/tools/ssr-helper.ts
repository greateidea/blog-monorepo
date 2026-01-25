// packages/utils/src/ssr-helper.ts

/**
 * 将函数序列化为可执行的 IIFE 字符串
 * @param fn 要执行的函数
 * @param args 函数需要的参数（会被 JSON.stringify 序列化）
 */
export const serializeScript = (fn: (...args: any[]) => void, ...args: any[]): string => {
  // 1. 获取函数源码
  const fnString = fn.toString();
  
  // 2. 序列化参数
  const argsString = args.map(arg => JSON.stringify(arg)).join(',');

  // 3. 拼装成 IIFE (立即执行函数)
  // 格式: (function logic(a,b){...})(arg1, arg2);
  return `(${fnString})(${argsString})`;
};