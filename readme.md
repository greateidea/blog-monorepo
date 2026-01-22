### pnpm
· --filter 参数：指定要把包安装到哪里
pnpm add ui-lib --filter web-admin

<!-- pnpm add vitest -D -w // 根目录包安装命令 -->


打开 apps/web-admin/package.json，你会看到：
{
  "dependencies": {
    "react": "^18.2.0",
    // 注意这个版本号！
    "ui-lib": "workspace:*" 
  }
}

关键点解析：workspace:* 是什么？这是 pnpm 特有的协议。
· 开发时：它告诉 pnpm，“去 workspace 里找最新的那个 ui-lib，
  直接做一个软链接 (Symlink) 过来”。这意味着你在 ui-lib 里改了一行代码，web-admin 刷新一下立马生效，完全不需要构建和发包。

· 发布时：当你做 npm publish 时，pnpm 会自动把 workspace:* 
  替换成真实的版本号（比如 ^1.0.0），保证发出去的包是正常的。

将公共tsconfig配置安装在各个项目里：
pnpm add @blog/tsconfig@workspace:\* -D --filter @blog/SpringCatTech-blog
pnpm add @blog/tsconfig@workspace:\* -D --filter @blog/blog-ssr


### turbo
turbo.json：
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    // 1. 构建任务 (最关键的配置)
    "env": ["NODE_ENV", "VITE_API_URL"],
    "build": {
      // 【核心概念】依赖拓扑
      // "^build" 的意思是：在构建“我”之前，必须先把所有“依赖我的人”构建好。
      // 比如：web-admin 依赖 ui-lib。Turbo 会先去构建 ui-lib，成功后再构建 web-admin。
      "dependsOn": ["^build"],

      // 【核心概念】输出缓存
      // 告诉 Turbo：构建完成后，产物通常放在哪里？
      // 下次如果缓存命中，Turbo 会直接把这个文件夹“变”出来，根本不去跑 build 命令。
      "outputs": ["dist/**", ".next/**", "build/**"]
    },

    // 2. 开发任务
    "dev": {
      // dev 通常不需要依赖顺序（你可以同时启动前端和后端）
      // 也不产生实体文件，所以 cache: false，并且没有 outputs
      "cache": false,
      "persistent": true
    },

    // 3. 类型检查 & Lint
    "check-types": {
      // 纯 CPU 计算，没有依赖关系，非常适合 Turbo 并行跑
      "outputs": []
    },
    "lint": {
      "outputs": []
    }
  }
}


turbo怎么知道变了没变？
当你运行 turbo run build 时，Turbo 会为当前任务计算一个唯一的哈希字符串（Hash Key）
这个哈希值是由以下几个因子组合计算出来的：
  · 源码文件的 Hash：它会扫描你项目里所有的文件（除去 .gitignore 里的），计算文件内容的 Hash。只要你改了一个空格，这个 Hash 就变了。
  · 依赖项的 Hash：它会读取 pnpm-lock.yaml。如果你升级了 react 的版本，锁文件变了，Hash 就变了。
  · Turbo 配置：turbo.json 和根目录 package.json 的内容。
  · 环境变量：这里接你的第二个问题，它会把你在配置里声明的 env 变量的值算进去

判定逻辑：
  · 计算：Turbo 算出当前的 Hash = a1b2c3d4。
  · 查找：去 node_modules/.cache/turbo 文件夹里找，有没有一个叫 a1b2c3d4 的文件夹？
  · 命中 (Hit)：如果有，说明之前在完全一样的环境和代码下构建过。直接把那个文件夹里的 dist 复制出来，不跑命令。
  · 未命中 (Miss)：如果没有，说明这是新的情况。跑命令，然后把结果存成 a1b2c3d4。

turbo怎么知道项目环境变量"VITE_API_URL"变了？
VITE_API_URL环境变量只有在打包的时候动态编译替换，对于静态源码来说，没有任何变化
  注意⚠️情况 B：变量在 CI/CD 流水线里注入 (System Environment Variables)
    服务器上没有 .env 文件，而是运行命令时注入
      Turbo 在计算哈希时，会专门去读取当前进程里的 process.env.VITE_API_URL 的值，
      把它拼到哈希字符串里去算：

        第一次：Hash(代码 + "https://test.com") = Hash_A
        第二次：Hash(代码 + "https://prod.com") = Hash_B

        因为 Hash_A !== Hash_B，缓存失效，强制重构。


magic：
{
  "pipeline": {
    // 对应 package.json 里的 "build:prod"
    "build:prod": {
      "dependsOn": ["^build:prod"], // 依赖子包的 build:prod
      "outputs": ["dist/**"]
    },
    // 对应 package.json 里的 "build:stage"
    "build:stage": {
      "dependsOn": ["^build:stage"],
      "outputs": ["dist/**"]
    },

    "dev": {
      // “对于这个命令，永远不要读缓存，也永远不要存缓存。每次都给我老老实实地从头跑一遍。”
      "cache": false,
      "persistent": true
    },
  }
}

给某个应用单独增加依赖项：
  pnpm add <包名> --filter <子项目package.json里的name>
  pnpm add react-router@^7.9.3 --filter @blog/blog-ssr

场景：只开发 web-admin
不要 cd 进去。在根目录执行

· 开发环境
  pnpm dev --filter web-admin

· 打包环境
  pnpm build --filter web-admin


· "release": "turbo run build --filter=...[HEAD^1] && changeset publish"
  (注意：release 命令通常要先跑 build，再 publish。这里用了 Turbo 的过滤器技巧，只 build 变动过的包，这属于高级优化，暂时先理解逻辑即可。)

· 为什么这样做更好？
· 享受缓存：如果 web-admin 依赖了 ui-lib，Turbo 会智能判断 ui-lib 需不需要重构。
· 心智负担小：你不需要在不同的文件夹之间切来切去（Context Switching）。
· 并行能力：如果你想同时修两个应用，
· pnpm dev --filter app-a --filter app-b 可以同时启动它们，日志还会聚合在一起，非常爽。


# Changeset使用流程 changeset -> changeset version -> changeset publish
· npx changeset
  或者如果你把命令封装到了 scripts 里：pnpm changeset

交互式选择：
  终端问：“哪个包变了？” -> 你空格选中 ui-lib。
  终端问：“这是什么级别的变更？” -> 你选 patch (修复 Bug)。
  终端问：“写点 Changelog 吧？” -> 你输入：“修复了按钮点击不灵敏的问题”。

会在 .changeset 目录下生成一个随机文件名的 Markdown 文件
这个文件就是你的“发版意图”。它长这样：

  ---
  "ui-lib": patch
  ---

  修复了按钮点击不灵敏的问题

把这个 .md 文件连同你的代码一起 git commit & git push

· 合并代码到 main 分支后
  npx changeset version
    · 它读取 .changeset/ 下所有的 .md 文件。
    
    · 它发现 ui-lib 需要升一级 patch，于是把 packages/ui-lib/package.json 的  version 从 1.0.0 改为 1.0.1。

    · 依赖联动：如果 web-admin 依赖了 ui-lib，它会自动检测并更新 web-admin 里的依赖版本（视配置而定）。

    · 生成文档：它会自动往 packages/ui-lib/CHANGELOG.md 里写入刚才那句“修复了按钮...”。

    · 清理：删掉那些 .md 文件（因为已经被“消耗”了）。


· 发布到仓库 npx changeset publish
  · 它会执行 pnpm publish，把更新过的包发布到 npm registry
  · 如果是 private: true 的包，会跳过发布，只更新版本号（非常智能）


### changeset 版本号合并逻辑
  · 10人改同一个包
  · changeset version 读取这 10 个并合并 CHANGELOG
  · 计算最大版本：9 个人是 patch，1 人是 minor，最终结果 Minor（升一级）

  #### 依赖被动更新的 web-admin 会发生什么？
  · 依赖版本更新：把 apps/web-admin/package.json 里的依赖版本更新（如果需要的话）
  · 应用版本更细：Changeset 默认给 web-admin Patch 升级（从 2.0.0 -> 2.0.1）
    注：这个行为可以通过配置 updateInternalDependencies 来控制，但默认是开启的

  · 写入 Changelog：
    · 它会自动在 apps/web-admin/CHANGELOG.md 里写一行：
        Dependencies updated: ui-lib@1.0.1

  · 关于 Commit：
    · npx changeset version 只负责修改文件，不自动 Git Commit
    · 需要手动（或CI 脚本里）执行 git add . 和 git commit -m "Version Packages"

  · 被动修改的 web-admin 会被强制发布吗？
    · private: true：不会
    · "private": false： 会


### 只需在最外层根目录创建 Git (git init)
1. 为什么只在根目录建 Git？
  Monorepo 的核心定义就是 "Monolithic Repository"（单体仓库）
  它的灵魂在于 “原子提交 (Atomic Commits)”

  · 正确的 Monorepo (根目录一个 Git)：
    · 你执行 git commit -m "fix: update button style"
    · 一个 Commit 同时包含了 packages/ui-lib 和 apps/web-admin 的修改
    · 价值：回滚时，两个项目的同时回滚，保证系统一致性。代码仓库的状态是“对齐”的

  · 错误的嵌套 Git (子目录也有 Git)：
    · Git 会把子目录识别为 Submodule（子模块）
    · 最外层的 Git 看不见 子目录里的代码变动
    · TurboRepo 和 Changesets 会失效
        因为它们依赖根目录的 Git Diff 来计算哈希和发版

  #### 清理移动时残留的旧 .git 文件夹
    删掉了子目录的 .git：

    · cd apps/web-admin 进入子应用目录

    · ls -a 检查是否有 .git

    · rm -rf .git如果有，删掉它（斩断旧情）

### Changesets Action


### Vitest + RTL + husky
· 在 packages/test-config 目录下：pnpm add vitest jsdom -D
    配置文件

· 注意⚠️在 根 目录下创建 vitest.workspace.ts：
    export default [
      'apps/*',
      'packages/*'
    ];
    要求根目录下husky拦截执行 "vitest related --run" 的时候，
    自动匹配 执行的测试文件 对应的应用vitest配置
  

· 应用各自继承公共配置 @blog-org/test-config + 安装RTL
  · 使用 workspace 协议安装本地配置包
      pnpm add @blog/test-config@workspace:\* -D --filter @blog/SpringCatTech-blog

      pnpm add @blog/test-config@workspace:\* -D --filter @blog/blog-ssr

  · 应用各自 安装 React 测试库
      pnpm add @testing-library/react @testing-library/user-event @testing-library/jest-dom -D --filter @blog/SpringCatTech-blog

      pnpm add @testing-library/react @testing-library/user-event @testing-library/jest-dom -D --filter @blog/blog-ssr

  · 应用各自 安装Vitest
      在根目录:
        pnpm add vitest -D --filter @blog/SpringCatTech-blog
        pnpm add vitest -D --filter @blog/blog-ssr

  · 应用各自 创建 Setup 文件
      apps/web-admin/src/test/setup.ts：
        import '@testing-library/jest-dom';

  · 子应用 TypeScript 类型生命
      子应用 的 tsconfig.json (apps/web-admin/tsconfig.json)：
      {
        {
          "extends": "@blog-org/tsconfig/base.json",
          "compilerOptions": {
            "baseUrl": ".",
            // 【关键修复】显式引入 vitest 的全局类型
            // 这样 TS 就能识别 describe, it, expect 了
            "types": ["vitest/globals", "@testing-library/jest-dom"], 
            "paths": {
              "@/*": ["src/*"]
            }
          },
          "include": ["src"]
        }
      }

  配置：
    · turbo:
      "pipeline": {
        "test": {
            "outputs": [],
            "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts"]
        },
        ...
      \}
    
    · 根 package.json 配置husky：
      "lint-staged": {
          "apps/**/*.{js,jsx,ts,tsx}": [
              "vitest related --run"
          ]
      }

    · 配置 .husky/pre-commit：
      #!/bin/sh
      . "$(dirname "$0")/_/husky.sh"

      npx lint-staged
    
    · 各应用package.json:
      "scripts": {
        "test": "vitest",
        "test:run": "vitest run"
    },


### 关于：依赖变更合并主分支changeset version时时，未开发的另一个应用App B受到影响
  · 机器人默认给App B 升一级 patch
    机器人自动修改 App B 的 package.json 和 CHANGELOG.md。
      Changelog 内容通常是：Dependencies updated: SharedPackage@1.0.1

  · 自动化测试
       CI 脚本应该所有测 “受影响的包 (Affected Packages)”
          # 在 CI 里执行测试时
          # --filter=...[HEAD^1] 的意思是：
          # 找出自上次提交以来变动的包，以及“依赖它们的所有上层包”
            -> pnpm turbo run test --filter=...[HEAD^1]

  · 控制这种“躺枪”（高级配置）
    · 默认行为是推荐的，但 Changesets 也提供了配置项来控制这种**“连锁升级”**的力度
      .changeset/config.json：
        {
          // 这个字段控制：当依赖更新时，我是否要升级？
          // 默认是 "patch"，即：只要依赖变了，我就升 patch 版本。
          "updateInternalDependencies": "patch" 
        }

      · 可选策略：
        "patch" (推荐，标准做法)：
          最安全。只要依赖变，应用就重发。保证线上代码最新。
        "minor"：
          只有当依赖发生 minor 或 major 变更时，应用才重发。Patch 变更忽略。
          风险：如果不重发应用，线上可能无法获得 Bug 修复

  #### 关联受影响应用 Owner
    如果你修改的 SharedPackage 非常核心，影响了别人的 App B
    在仓库根目录配置 .github/CODEOWNERS
      apps/web-admin/  @admin-team-lead
      apps/h5-app/     @h5-team-lead
      packages/ui-lib/ @infra-team

    提交 PR 时，虽然你只改了 ui-lib，
      但如果 CI 机器人（或者你手动）涉及到了 App B 的文件变动，
      Git 平台会自动把 App B 的负责人拉进来 Review

总后总的来说：
  pnpm + turbo + changeset 这一套既是一个monorepo的多应用管理架构
  同时也是协作的基础，协作的核心是 「自动化测试」和「changeset」
    「自动化测试」可以自动测试所有关联部分，这就需要严格要求编写测试用例
    「changeset」最终会把变更所有关联的范围在git上体现出来
