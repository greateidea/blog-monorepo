// normalize-trailing-slash.js  （在 import React... 或 hydrateRoot(...) 之前）
function normalizeTrailingSlash() {
    const { pathname, search, hash } = window.location;
  
    // 只处理非根路径并且以 '/' 结尾的情况
    if (pathname.length > 1 && pathname.endsWith('/')) {
      // 去掉结尾的所有斜杠，保证 '/' 的特殊情况不会变成空串
      const newPath = pathname.replace(/\/+$/, '');
      const newUrl = newPath + (search || '') + (hash || '');
      // 不产生历史记录、不刷新页面（用户按后退不会回到带斜杠的地址）
      window.history.replaceState({}, '', newUrl);
      // console.log('normalized url:', newUrl);
    }
};

normalizeTrailingSlash()

export default normalizeTrailingSlash
