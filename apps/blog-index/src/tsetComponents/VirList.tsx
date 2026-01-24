// 思维阐述（建模）：
//     “虚拟列表的核心原理就两句话：‘只渲染可视区域’ 和 ‘撑开滚动条’。

// 将 DOM 结构分为三层：
//     1. 外部容器 (Container)：提供 overflow-y: scroll 和固定高度。
//     2. 撑开高度层 (Phantom)：一个空的 div，高度等于 总条数 * itemHeight。
//         它的作用是让滚动条看起来像是真的有 10 万条数据。
//     3. 实际渲染层 (List)：利用 absolute 定位或 transform，
//         根据当前的 startIndex 计算出 offsetY（此时需要向下偏移的量），始终将其移动到可视区域的位置。”

// · Transform vs Top：
//     “在移动列表容器时，我使用了 translate3d 而不是 top。
//         因为 top 会触发浏览器的 Reflow (重排)，而 transform 只会触发 Composite (合成)，
//             利用 GPU 加速，这在快速滚动时对帧率（FPS）影响巨大。”

// · 缓冲区 (Buffer) 设计：
//     “我引入了 buffer 变量。如果不加缓冲区，用户快速拖拽滚动条时，
//         计算还没完成，屏幕会出现短暂的白屏。
//             上下各多渲染 5 个节点，可以显著提升用户体验。”

// · Will-change：
//     “我给列表容器加了 will-change: transform，这是一个给浏览器的 Hint，
//         告诉它这个元素即将发生变形，浏览器会提前创建图层（Layer），减少主线程压力。”



// · 下一步
//     “现在这个是固定高度（Fixed Height）的。如果每个列表项的高度是不确定的
//     （例如包含不同字数的评论），你怎么实现？

// 逻辑必须清晰：
//     “不定高场景下，我们无法通过 index * fixedHeight 直接算出偏移量。
//         必须维护一个 高度缓存列表 (Height Cache)。

// 核心思路：
//     1. 预估高度：初始化时，给所有未渲染项一个‘预估高度’（比如 50px），计算出一个粗略的总高度。
//     2. 真实高度获取：当 Item 被渲染到页面后，
//         利用 ResizeObserver 或 useEffect + getBoundingClientRect 拿到它的真实 DOM 高度。
//     3. 更新缓存与偏移：将真实高度更新到缓存表中，并重新计算后续所有元素的 offset
//     4. 修正滚动条：由于高度变了，可能会导致滚动条跳动（Scroll Jumping）。
//         需要在高度更新后，根据差值（Delta）手动调整 scrollTop，保持视觉上的位置不变。

//     这是一个相对复杂的工程问题，如果要自己实现，通常使用 二分查找 (Binary Search) 
//         去在缓存列表中快速找到当前的 startIndex（查找 offset 大于 scrollTop 的第一个元素），
//             将时间复杂度从 O(n) 降到 O(log n)。”



import React, { useState, useMemo, UIEvent } from 'react';

interface VirtualListProps {
  list: unknown[];          // 数据源
  itemHeight: number;   // 固定行高
  containerHeight: number; // 容器高度
}

const VirtualList: React.FC<VirtualListProps> = ({ 
  list, 
  itemHeight, 
  containerHeight 
}) => {
  // 1. 状态维护：当前滚动的距离
  const [scrollTop, setScrollTop] = useState(0);

  // 2. 核心计算：总高度（撑开滚动条用）
  const totalHeight = list.length * itemHeight;

  // 3. 核心计算：可视区域能放下多少个元素
  // 多渲染 1 个是为了解决边缘显示不全的问题
  const visibleCount = Math.ceil(containerHeight / itemHeight); // 注意⚠️这是向上取整

  // 4. 优化：缓冲区 (Buffer)
  // 上下多渲染几个，防止滚动过快出现白屏
  const buffer = 5; 

  // 5. 计算起始和结束索引
  const startIndex = Math.floor(scrollTop / itemHeight); // 向上划过了几个 此时刚好对应数组下一个的下标

  // 渲染区间的 Start (考虑 buffer，不能小于 0) 注意⚠️这是数组下标
  const renderStart = Math.max(0, startIndex - buffer); // 注意⚠️取最大值
  // 渲染区间的 End (考虑 buffer，不能超过总长度) 注意⚠️这是数组下标
  const renderEnd = Math.min(list.length, startIndex + visibleCount + buffer); // 注意⚠️ 是startIndex 然后取最小值 

  // 6. 截取当前需要渲染的数据
  const visibleData = useMemo(() => {
    return list.slice(renderStart, renderEnd);
  }, [list, renderStart, renderEnd]);

  // 7. 计算偏移量 (Offset)
  // 渲染层需要向下偏移，否则会一直停留在顶部
  // 注意：偏移量应该是 renderStart * itemHeight

  // 注意⚠️尤其注意个偏移量什么时候会变化
  // 它的变化是在renderStart变化的时候
  // renderStart的变化发生在 Math.floor(scrollTop / itemHeight)
  // Math.floor(scrollTop / itemHeight)着向下取整
  // 向下取整意味着一个单位向上滚动的时候 完整的滚过了上顶线才会变化
  // 这个时候renderStart变化 重续渲染数组选定区间内容 但此时停留在顶部
  // 因此此时要向下移动一个单位translate3d(0, ${offsetY}px, 0)
  /**
    没有buffer的情况下，可视区域容纳3个单位，列表一共4个单位：
    数组 startIndex：0 - 第1个单位 --- renderStart：0 - 第1个单位
    数组 renderEnd：2 - 第3个单位

        -> 第一个单位完整向上划过顶部
            -> 此时 数组 startIndex ：1 - 第2个单位 --- renderStart：1 - 第2个单位
                数组 renderEnd：3 - 第4个单位

                    -> 重新渲染列表第 2 3 4 项
                        注意⚠️但此时在顶部
                            -> translate3d(0, ${offsetY}px, 0)

        startIndex -> renderStart & renderEnd -> 渲染的列表数据（visibleData） -> offsetY
  */
  const offsetY = renderStart * itemHeight; // renderStart此时也表示向上移动了几个单位

  // 8. 滚动事件处理
  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    // requestAnimationFrame 可以在这里做节流优化，
    // 但现代浏览器 React 的 setState 批处理通常足够快，
    // 面试中可以直接写简单版，口述优化点。
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div 
      style={{ 
        height: containerHeight, 
        overflowY: 'auto', 
        position: 'relative',
        // border: '1px solid orange'
      }}
      onScroll={onScroll}
    >
      {/* 幽灵层：撑开高度 */}
      <div style={{ height: totalHeight, position: 'absolute', top: 0, left: 0, right: 0, zIndex: -1 }} />

      {/* 渲染层：使用 transform 进行偏移，性能优于 top */}
      <div 
        style={{ 
          transform: `translate3d(0, ${offsetY}px, 0)`, 
          willChange: 'transform' // 提示浏览器开启 GPU 加速
        }}
      >
        {visibleData.map((item, index) => {
          // 注意：key 最好用 item.id，这里演示简单用真实索引
          const realIndex = renderStart + index; 
          return (
            <div 
              key={realIndex} 
              style={{ height: itemHeight, lineHeight: `${itemHeight}px`, borderBottom: '1px solid #ccc' }}
            >
              {realIndex} : {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default VirtualList;
