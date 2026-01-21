// greatideaorange@gmail.com

$.each(node, 17, () => things, (thing) => thing.id, ($$anchor, thing) => {
    var li = root_1();
    var text = $.child(li);

    $.reset(li);
    $.template_effect(() => $.set_text(text, `${$.get(thing).id ?? ''} x ${$.get(thing).name ?? ''}`));
    $.append($$anchor, li);
});

// svelte/internal/client/dom/operations.js

export function append(anchor, node) {
    // 1. 执行原生的插入操作
    anchor.parentNode.insertBefore(node, anchor);

    // 2. 【核心魔法】DOM 记录
    // 检查当前是否有正在运行的 Effect
    var effect = active_effect; 
    
    if (effect !== null) {
        // 如果这个 Effect 还没记录过它的起始节点，现在记录！
        if (effect.first === null) {
            effect.first = node; // 抓住你了！<li> 是起点
        }
        
        // 更新结束节点
        effect.last = node;      // <li> 也是终点 (因为只有这一个根节点)
    }
}

$.template_effect(() => {
    // 获取最新的数组数据
    var collection = get_collection(); 
 
    // 3. 核心：调用协调算法 (Reconciliation)
    // 对比 block.items (旧列表) 和 collection (新列表)
    reconcile_keyed_array(
        anchor,     // 插入位置
        block,      // 旧的状态
        collection, // 新的数据
        get_key,    // Key 提取器
        render_item // 渲染函数
    );
});

var item = {
    k: key,          // 唯一标识 (id)
    v: value_signal, // 存储当前数据项的 Signal (用来做 update)
    // DOM 占位 (在 Svelte 5 中通常通过 effect.nodes 查找，这里为了好理解保留)
    d: dom,          // 这一项对应的 DOM 节点（或者 Fragment 的边界）
    e: effect        // 这一项内部的 render effect (用来销毁时做 cleanup)
};

function reconcile_keyed_array(anchor, block, new_items, get_key, render_item) {
    var old_items = block.items;
    var new_len = new_items.length;
    var old_len = old_items.length;
    
    // 如果是第一次渲染（旧列表为空），直接循环创建，这是最快路径
    if (old_len === 0) {
        for (var i = 0; i < new_len; i++) {
            var new_item = new_items[i];
            var item = {
                k: key,              // 键
                v: $.source(new_item),   // 创建 Signal 包裹数据
                e: null,             // Effect 占位，稍后填充
                d: null              // DOM 占位 (在 Svelte 5 中通常通过 effect.nodes 查找，这里为了好理解保留)
            };
            // 执行 render_item 创建 DOM，挂载到 anchor 之前
            // 并保存状态到 block.items
            mount_item(item, anchor, ...); 
        }
        return;
    }

    // --- 复杂的 Diff 算法开始 ---
    
    // 1. 从头向尾遍历，跳过没有变化的项 (Pre-processing)
    var start = 0;
    while (start < new_len && start < old_len && old_items[start].key === get_key(new_items[start])) {
        // 如果 Key 相同，只需要更新内部的数据 (update signal)
        update_item(old_items[start], new_items[start]);
        start++;
    }

    // 2. 从尾向头遍历，跳过没有变化的项 (Post-processing)
    var new_end = new_len - 1;
    var old_end = old_len - 1;
    while (new_end >= start && old_end >= start && old_items[old_end].key === get_key(new_items[new_end])) {
        update_item(old_items[old_end], new_items[new_end]);
        new_end--;
        old_end--;
    }

    // 3. 处理剩下的杂乱部分 (移动/新增/删除)
    // 这里 Svelte 使用了最长递增子序列 (LIS - Longest Increasing Subsequence) 
    // 算法来计算最少移动次数。
    
    if (start > new_end) {
        // 只有删除操作
        remove_items(old_items, start, old_end);
    } else if (start > old_end) {
        // 只有新增操作
        insert_items(new_items, start, new_end, anchor);
    } else {
        // 最复杂的情况：既有移动，又有增删
        // 建立 Map 索引，标记旧节点位置
        // 计算 LIS
        // 执行具体的 DOM insertBefore 操作来移动节点
        // ...
    }
}

function mount_item(item, anchor, render_fn) {
    // 1. 创建该项的 Effect 作用域
    // Svelte 5 中，每个列表项都是一个独立的 Effect 分支
    var cleanup = $.branch(() => {
        
        // 2. 执行渲染函数
        // 参数1: 锚点 (告诉它插在哪里)
        // 参数2: 数据 (通常是一个 Getter/Signal，以便子内部可以监听变化)
        render_fn(anchor, () => $.get(item.v)); 
        
        // 注意：render_fn 内部会执行 $.template_effect
        // 从而创建 li, text, 并 append 到 anchor 之前
    });

    // 3. 保存清理函数 (用于 remove 时销毁这个作用域)
    item.e = cleanup;
}

function update_item(item, new_value) {
    // item.v 是我们在 mount 时创建的一个 Signal (Source)
    // 这里直接设置它的新值。
    $.set(item.v, new_value);
}

// 将 items 列表中的节点，移动到 anchor 之前
function insert_items(items, anchor) {
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        
        // 获取该项对应的 DOM (可能是单个 li，也可能是一组节点)
        var dom_nodes = get_dom(item); 

        if (dom_nodes) {
            // 原生 DOM API：insertBefore
            // 如果节点已经在 DOM 里，insertBefore 会自动把它“剪切”并“粘贴”到新位置
            // 不需要手动 removeChild
            anchor.parentNode.insertBefore(dom_nodes, anchor);
        }
    }
}

function remove_items(items) {
    for (var i = 0; i < items.length; i++) {
        var item = items[i];

        // 1. 销毁 Effect (Teardown)
        // 这会停止监听 Signal，防止内存泄漏
        if (item.e) {
            $.destroy_effect(item.e); 
        }

        // 2. 移除 DOM
        // 实际上 Svelte 5 会把 DOM 移除操作封装在 effect 的销毁逻辑里
        // 或者显式调用 remove
        var dom = get_dom(item);
        if (dom) {
            dom.remove(); // 原生 remove()
        }
    }
}

// 全局变量，指向当前正在运行的那个 Effect
let active_effect = null;

function create_effect(type, fn, sync) {
    // 1. 创建节点
    var effect = {
        parent: active_effect, // 【关键】认爹：谁在运行我，谁就是我爹
        children: null,        // 准备存儿子
        deps: null,            // 准备存 Signal 依赖
        fn: fn,
        first: null,           // DOM 边界
        last: null,
        // ...
    };

    // 2. 【关键】建立父子连接
    if (active_effect) {
        if (active_effect.children === null) active_effect.children = [];
        active_effect.children.push(effect);
    }

    // 3. 执行 (如果是同步的，比如 branch)
    if (sync) {
        // A. 压栈 (Push)
        var previous_effect = active_effect;
        active_effect = effect; // 【切换作用域！】现在“当前作用域”变成了这个新 effect
        
        try {
            // B. 运行函数
            // 在这个 fn 执行期间创建的任何 Signal 订阅或子 Effect，
            // 都会找到 active_effect (也就是我)，从而挂在我下面。
            fn(); 
        } finally {
            // C. 出栈 (Pop)
            active_effect = previous_effect; // 恢复之前的父作用域
        }
    } else {
        schedule(effect);
    }
    
    return effect;
}

// $.branch 本质上就是 create_effect(BRANCH_FLAG, fn, true)

// 当 item 被移除时调用的函数
function destroy_effect(effect) {
    // 1. 停止运行（如果正在列队中）
    // 2. 断开与 Signal 的连接
    unlink(effect); 

    // 3. 销毁所有子 Effect (递归)
    if (effect.children) {
        for (var i = 0; i < effect.children.length; i++) {
            destroy_effect(effect.children[i]);
        }
    }

    // 4. 执行清理回调 (teardown)
    if (effect.teardown) {
        effect.teardown();
    }
    
    // 5. 将自己从父节点移除
    // ...
}

// 计算最长递增子序列，返回的是【索引】的数组
function get_lis(a) {
    var p = a.slice(); // predecessor 数组，用于回溯路径
    var result = [0];  // 存储当前最长序列的索引
    var i, j, u, v, c;
    var len = a.length;

    for (i = 0; i < len; i++) {
        var val = a[i];
        if (val === -1) continue; // 忽略新增项

        j = result[result.length - 1];
        // 如果当前值比序列最后一个值大，直接追加
        if (a[j] < val) {
            p[i] = j;
            result.push(i);
            continue;
        }

        // 二分查找，找到第一个比当前值大的位置替换掉
        // 这一步是为了让序列增长潜力更大（贪心）
        u = 0;
        v = result.length - 1;
        while (u < v) {
            c = (u + v) >> 1;
            if (a[result[c]] < val) {
                u = c + 1;
            } else {
                v = c;
            }
        }

        if (val < a[result[u]]) {
            if (u > 0) p[i] = result[u - 1];
            result[u] = i;
        }
    }

    // 回溯重建路径
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}
/**
Root Effect
    -> $.template_effect //
        -> reconcile
            -> item -> $.branch: ItemBranchEffect
                -> {item.name} -> $.template_effect: TextRenderEffect
                -> {#if item.active} -> $.if: IfBranchEffect
                -> $.append -> $.branch.e

            --> $.destroy_effect(item.e); 
*/

/**
create_effect 新建流程
    -> update_effect 递归清除先前关系 拆除effect 删除关联dom 执行之前卸载函数 执行注册函数建立双向依赖订阅关系
        -> ！！active_effect set会读
        -> destroy_block_effect_children | destroy_effect_children
            -> while(destroy_effect -> next)
                -> set_signal_status
                -> remove_effect_dom 递归删除所有关联dom
                -> 递归 destroy_effect_children
                -> remove_reactions 清理先前依赖订阅关系
                -> set_signal_status
                -> unlink_effect
                    -> 当前effect从叉树拆除 重连兄弟父节点的连接
                -> effect.next ... = null;
        -> execute_effect_teardown 执行上次执行后返回的teardown
        -> update_reaction 新建流程里 执行注册函数设置依赖订阅关系 - 重新设置依赖订阅关系在get里执行
            -> ！！active_reaction get会读
    -> push_effect 将自己加入父effect链表中
*/

/**
each: flags_17, is_controlled_false, hydrating_true
    -> block: flags_0
        -> create_effect(BLOCK_EFFECT | flags, fn, true): BLOCK_EFFECT_16, flags_0
        -> update_reaction 
            -> block func: for__create_item 为每个数组项生成 branch, 
            branch 执行render_func渲染函数
                -> get(each_array)

                -> create_item: 
                    var v= source(value): var signal = {f: 0, v, reactions: null, equals, rv: 0, wv: 0}
                    var item = {i, v, k: key, e: null, o: false, prev, next: null}
                    fragment.append((anchor = create_text()))
                    item.e = branch(() => render_fn((anchor), v, i, get_collection))
                        -> branch: create_effect(BRANCH_EFFECT | EFFECT_PRESERVED, fn, true)
                    prev.next = item

                -> get(each_array)
    -> 
*/

/**
create Item
    -> source - signal
        -> Array Item
*/

/**
数组
    -> derived_safe_equal - derived - signal
        -> get (derived - signal)
            -> is_dirty - update_derived(derived
                    -> update_reaction
                        -> Array
*/

/**
    get (derived_safe_equal_signal)
        -> is_dirty -> dependencies 递归 is_dirty & update_derived
            is_dirty true -> update_derived (derived_safe_equal_signal)
                -> update_derived
                    -> execute_derived: set_active_effect(get_derived_parent_effect(derived)) 很奇怪
                        -> update_reaction
*/

// 很奇怪
is_dirty:
if (dependency.wv > reaction.wv) {
    return true;
}

execute_derived:
derived.wv = increment_write_version()
// 不奇怪了

// 很奇怪
execute_derived:
var prev_active_effect = active_effect;
set_active_effect(get_derived_parent_effect(derived));
// 不奇怪了

active_reaction和active_effect
这里其实主要区分effect和derived

reaction的职责是负责与依赖建立双向依赖订阅关系
effect是专门管理effect的生命周期和链表图谱的

在只有effect的时候，active_reaction和active_effect可以就是同一个东西，
既管理effect的生命周期和链表图谱，又建立双向依赖订阅关系

但是derived出现后，为了轻量化，derived作为一个响应式节点，
只负责建立双向依赖订阅关系，不负责effect的生命周期和链表图谱

为什么effect会有生命周期和链表图谱？
effect可以看作是创建了一个域，这个域里要有三样东西要管理：双向依赖订阅关系、关联的dom、父子effect链表图谱
effect在创建的时候会创建这些东西，销毁的时候也要效果域中所有这些东西
而derived只是这双向依赖订阅关系中的一环，所以当derived中如果技术上出现了子effect，那么这个受这个derived的父effect管理

update_effect将所有如何运行一个effect的逻辑放在了一起，
包括销毁effect，
切换effect上下文，
运行effect，
将运行effect后的teardown挂在当前effect上，
处理边界情况等等，
不管是第一次创建的effect还是旧effect，而新的effect经过判断则不会走销毁流程

destroy_block_effect_children 清理的是子effect
    -> destroy_effect 开始递归调用清理
        -> destroy_effect_children 递归删除关联dom
            -> destroy_effect
        -> remove_reactions 从每个依赖的订阅者列表中删除自身
        -> execute_effect_teardown 执行effect返回的销毁函数
        -> unlink_effect 将当前effect从叉树中拆除 并重新连接兄弟父节点的连接


each
    -> block
        -> create_effect 此时：first = last = null
            -> 同步执行 注册函数
                -> 首次执行为每个数组项 create_item 创建链表项item，并构建数组项的双向链表，每项通过key加入Map集合记录
                    -> create_item: 创建链表项item结构并 branch -> 执行这项的渲染函数 -> 挂载并关联dom
                -> 非首次执行
                    -> 执行 internal_set 更新每项值
                    -> 将每项branch的effect加入异步执行
                    -> 执行 reconcile 重新排序 增加 删除 项
                        -> 遍历新数组
                            -> 新项 if (!item.o) { create_item，将新项插入链表到当前位置，插入关联dom到当前位置 }
                            -> 非新项 
                                -> 开始 对链表 构造连续片段 并形成 间隔片段，移动单项 或 交换连续片段与间隔片段
                                -> 移动或交换的同时 伴随dom移动
                                -> 整理链表完成后 留下已经整理完的 （多个）连续片段、（多个）间隔片段、未遍历的剩余片段
                                -> 清理非连续片段 留下连续片段


清理非连续片段
    -> 将 （多个）间隔片段、剩余片段 加入to_destroy列表
    -> pause_effects开始处理to_destroy列表
        -> pause_children 递归提取所有有结束动画的项
        -> 执行所有结束动画 然后执行注册的清理函数
            -> 执行注册的清理函数
                -> if (fast_path) 可以直接删除整个渲染片段dom
                    -> 删除正片渲染dom clear_text_content(parent_node)
                    -> 将删除的包裹节点再加回去parent_node.append(anchor)
                    -> 直接清空存储所有项item的Map state.items.clear()
                    -> 直接从链表中摘出to_destroy所有项（此时是连贯的） link(state, to_destroy[0].prev, to_destroy[length - 1].next)
                -> 循环遍历to_destroy列表 处理每项清理 destroy_effect
                    -> 销毁 Effect、解绑 Signal
                    -> 如果之前如果之前fast_path = true 那之前已经清理过dom，否则也同时清理dom
                -> 重置state.first 链表起始点
                    如果删除的节点包含state.first，则将to_destroy[0].prev设置为state.first


solidity ether.js
react 算法 promise 大数据量渲染的虚拟列表 富文本

