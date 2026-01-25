/**
 * 将字符串首字母大写
 * @param str 输入字符串
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};