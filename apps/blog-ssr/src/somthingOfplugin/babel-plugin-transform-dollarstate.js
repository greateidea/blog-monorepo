// babel-plugin-transform-dollarstate.js
module.exports = function({ types: t }) {
    // 插件工厂：Babel 在加载插件时会调用这个函数，传入一组工具（我们在这里取出 types 并叫它 t）
    return {
      visitor: {
        // Program 代表整个文件的根节点
        Program: {
          enter(path, state) { // enter 在进入文件时会被调用一次
            // Program.enter 在处理每个文件（模块）开始时调用一次
            // 这里我们用 state 来保存是否需要插入 import 的标志
            state.hasSignalImport = false;
            state.hasEffectImport = false;
  
            // path.node.body 是文件顶层语句的数组（import、function、variable 等）
            // 遍历当前文件最顶层节点，检查是否已经有 import { signal } from '@preact/signals'
            for (const node of path.node.body) {
              if (t.isImportDeclaration(node)) {
                const src = node.source.value;
                if (src === '@preact/signals') {
                  node.specifiers.forEach(spec => {
                    if (t.isImportSpecifier(spec) && spec.imported.name === 'signal') state.hasSignalImport = true;
                    if (t.isImportSpecifier(spec) && spec.imported.name === 'effect') state.hasEffectImport = true;
                  });
                }
              }
            }
          }
        },
  
        // transform let x = $state(...)
        VariableDeclarator(path, state) {
        // VariableDeclarator 对应语法像 let x = something; 的那一块（x 与 = something）
        // const init = path.node.init;（获取等号右边的初始值表达式）
          const init = path.node.init;
          // 判断是不是函数调用（$state(...) 必然是 CallExpression）
          if (!init || !t.isCallExpression(init)) return;
          // 确保函数名是一个简单标识符（不是 obj.$state 或者其他复杂表达式）⚠️：没看懂
          if (!t.isIdentifier(init.callee)) return;
  
          if (init.callee.name === '$state') {
            // 把 callee 名从 $state 改成 signal
            init.callee.name = 'signal';
            // 确保文件顶部有 import { signal } from '@preact/signals'
            const program = path.findParent(p => p.isProgram());
            if (!state.hasSignalImport && !program.__signal_import_added) {
              const imp = t.importDeclaration(
                [t.importSpecifier(t.identifier('signal'), t.identifier('signal'))],
                t.stringLiteral('@preact/signals')
              );
              // 把 import 插入到文件最上面（unshift）
              program.node.body.unshift(imp);
              program.__signal_import_added = true;
              state.hasSignalImport = true;
            }
          }
        },
  
        // transform $effect(fn) -> effect(fn)
        CallExpression(path, state) {
          if (t.isIdentifier(path.node.callee, { name: '$effect' })) {
            path.node.callee.name = 'effect';
            const program = path.findParent(p => p.isProgram());
            if (!state.hasEffectImport && !program.__effect_import_added) {
              const imp = t.importDeclaration(
                [t.importSpecifier(t.identifier('effect'), t.identifier('effect'))],
                t.stringLiteral('@preact/signals')
              );
              program.node.body.unshift(imp);
              program.__effect_import_added = true;
              state.hasEffectImport = true;
            }
          }
        },
  
        // JSX: transform bind:value={$foo} -> value={foo.value} onInput={e => foo.value = e.target.value}
        JSXAttribute(path) {
          const name = path.node.name;
          if (!t.isJSXIdentifier(name) || name.name !== 'bind') return;
  
          // attribute like bind:value={$foo}
          const attrParts = path.node.name.name ? path.node.name.name.split(':') : [];
          // actually babel parsed bind:value as JSX namespaced? Simpler: check name is 'bind:value' by checking raw
          // For simplicity in many parsers, 'bind:value' arrives as JSXNamespacedName; handle both.
          // Handle JSXNamespacedName
        },
  
        // JSXNamespacedName(path) {
        //   // no-op, handled in JSXAttribute
        // }
      }
    };
  };
  