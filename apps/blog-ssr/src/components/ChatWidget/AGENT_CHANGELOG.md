# ChatWidget 开发总结

## 版本历史

| 版本  | 日期       | 说明                                 |
| ----- | ---------- | ------------------------------------ |
| 1.0.0 | 2026-02-26 | 初始版本 - 使用 iframe 嵌入 RAG 应用 |

---

## 需求概述

在博客每篇页面右下角添加一个聊天气泡，点击后展开与 AI Agent 对话的聊天框，获取当前博客相关的信息。

### 技术选型

- **嵌入方式**: iframe (非 micro-app)
- **主应用**: blog-ssr (Vite + React SSR)
- **子应用**: RAG App (https://rag-app-fe.vercel.app/chat-widget)

---

## 完成的功能

### 1. 核心功能

- [x] 聊天气泡按钮 (右下角固定)
- [x] 点击展开聊天框
- [x] iframe 嵌入 RAG 应用
- [x] 传入 blogKey 参数
- [x] 关闭按钮
- [x] 骨架屏加载动画
- [x] 预加载优化 (页面加载 2 秒后)
- [x] 切换博客时更新 iframe src

### 2. UI/UX

- [x] 简约深色主题风格
- [x] 展开/收起动画
- [x] Hover 提示 "Ask AI"
- [x] 移动端适配

---

## 踩过的坑和犯过的错

### 1. 定位问题 (最严重)

**问题**: 聊天框位置始终不对，气泡按钮位置飘忽不定

**原因**:

- 最初使用 `left: -320px` 定位聊天框，但 wrapper 缺少正确的定位
- 混用 `right/bottom` 和 `left/top` 导致位置计算混乱

**教训**:

- 固定定位的元素要明确使用 `right + bottom` 或 `left + top`，不要混用
- 使用 `display: none/block` 控制显示，不要依赖 `opacity + visibility` 的组合

### 2. iframe 不显示问题

**问题**: 点击后 iframe 内容不显示

**原因**:

- 使用 `visibility: hidden` 时，iframe 内部渲染可能被阻塞
- 关闭后原位置仍可点击 (`visibility` 不能完全阻止事件)

**解决方案**: 使用 `display: none` 控制显示

### 3. 条件渲染导致 iframe 重建

**问题**: 使用 `isOpen && <iframe/>` 时，每次打开都会重新创建 iframe

**原因**: 条件渲染导致 DOM 节点被销毁和重建

**解决方案**:

- iframe 始终存在于 DOM 中
- 用 CSS `display` 控制显示/隐藏
- 预加载通过更新 `src` 实现

### 4. CSS 语法错误

**问题**: 构建失败，PostCSS 解析错误

**原因**:

```css
/* 错误 */
.toggleBtn {
  width: 44px;
  height;  /* 缺少值 */
  border-radius: 44px: 50%; /* 错误语法 */
}
```

**教训**: 写入 CSS 时要仔细检查语法

### 5. React 组件错误

**问题**: 嵌套的 button 标签

**原因**: Fragments (`<> </>`) 没有正确关闭

**教训**: 使用 Fragment 时确保正确配对

### 6. 拖动功能问题

**问题**: 拖动时气泡消失、位置错乱

**原因**:

- 拖动时同时触发了点击事件
- 位置计算使用相对定位但元素是 fixed 定位

**最终决策**: 暂时移除拖动功能，简化实现

---

## 经验总结

### 布局技巧

1. 固定定位用 `right + bottom` 明确边距
2. 聊天框用 `position: absolute` 相对于按钮定位
3. 使用 `flex` 或 `grid` 前确保理解布局模型

### React 最佳实践

1. 不要用条件渲染控制频繁切换的元素，用 CSS 控制显示
2. iframe 等重型元素始终保持存在，只控制显示/隐藏
3. 避免在拖动时触发点击，使用 `e.preventDefault()`

### CSS 技巧

1. `display: none` vs `visibility: hidden`: 前者彻底移除元素，后者只是不可见
2. `pointer-events: none` 可以阻止点击但不阻止渲染
3. 动画用 `transform` 和 `opacity`，避免影响布局

---

## 当前代码结构

```
apps/blog-ssr/src/components/ChatWidget/
├── index.tsx        # React 组件
└── styles.module.css # 样式
```

### 组件逻辑

```tsx
// 核心逻辑
1. 预加载: setTimeout 2秒后设置 iframe.src
2. 显示控制: isOpen 状态控制 display: none/block
3. blogKey 变化: 更新 iframe.src 但不重建元素
```

---

## 待优化项

1. [ ] 拖动功能 (当前已移除)
2. [ ] 记忆用户拖动位置 (localStorage)
3. [ ] 点击外部关闭聊天框
4. [ ] 键盘快捷键 (Esc 关闭)
5. [ ] 深度集成 micro-app (如需要样式隔离)

---

## 附录: 关键代码片段

### 组件结构

```tsx
<div className={wrapper}>
  <div className={isOpen ? panelOpen : panel}>
    <iframe src={...} />
    <button className={closeButton} />
  </div>
  <button className={circleButton} onClick={() => setIsOpen(!isOpen)} />
</div>
```

### 样式要点

```css
.wrapper {
  position: fixed;
  right: 24px;
  bottom: 90px;
  z-index: 9999;
}

.panelOpen {
  position: absolute;
  bottom: 54px; /* 按钮上方 */
  right: 0;
  display: none;
}

.panelOpen {
  display: block;
} /* 展开时 */
```

---

_本文档将持续更新，记录后续迭代中的经验教训_
