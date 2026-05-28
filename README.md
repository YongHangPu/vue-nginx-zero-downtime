# vue-nginx-zero-downtime

一个面向开源分享的 Vue 演示项目，用来整理这套 `Vue 静态站点 + Nginx 无感发布` 的完整方案。

## 快速开始建议

- 如果你是第一次接入这套方案，默认先从 `examples/basic-vite-app` 开始
- 更推荐先复制完整示例并跑通 `pnpm install`、`pnpm dev`、`pnpm build:release`
- `templates/` 更适合已经有现成业务项目，或者已经跑通完整示例之后，再按需摘文件参考

它更适合作为一个“可展示、可复制、可落地”的方案型项目，主要包含：

- 一页式演示站：讲清楚无感发布的原理、SOP 和缓存策略
- 更新提示组件：演示版本检测后如何提示用户刷新
- 模板代码库：包含 `deploy-static-ui.sh`、`prepare-release.mjs`、`nginx` 模板
- 根路径部署与子路径部署两种 `nginx` 配置示例

## 适合什么场景

- Vue 3 / Vite 静态站点发布到 `nginx`
- 前端资源带 hash，希望用户发布时不白屏
- 多项目共用一套服务器发布脚本
- 页面里需要“发现新版本，提示刷新”的用户体验

## 如果你想先快速判断是否适合，先看这段

第一次看这类仓库时，很多人最关心的往往不是“原理”，而是下面这 4 个问题：

- 我到底应该复制整个示例项目，还是只拿几个文件？
- 根仓库里的命令，和 `examples/basic-vite-app` 里的命令，分别是干什么的？
- 我的本地是 Windows / macOS，服务器是 Linux，这套东西到底该在哪边跑？
- 我线上只有一个 `nginx` 静态目录，没有很复杂的发布平台，还能不能用？

如果你的情况和下面类似，这个仓库大概率会比较适合你：

- 你维护的是 Vue / Vite 静态站点，不是 SSR
- 你可以控制 `nginx` 配置，或者至少能让运维帮你改缓存策略
- 你可以接受“新版本发布后，用户看到刷新提示，再自行刷新”的交互
- 你想先用一套简单可落地的方案把发布稳定下来，而不是先搭完整 DevOps 平台

如果你想先尽快跑通一遍流程，而不是先阅读所有模板，建议直接从 `examples/basic-vite-app` 开始。
默认情况下，不建议第一次接入就先拆 `templates/`；更推荐先复制完整示例，跑通后再按需回头摘文件。

## 目录结构

```text
vue-nginx-zero-downtime/
  ├─ src/
  │  ├─ components/
  │  │  └─ VersionUpdateNotification.vue
  │  ├─ composables/
  │  │  └─ useVersionUpdate.ts
  │  ├─ App.vue
  │  └─ style.css
  ├─ templates/
  │  ├─ deploy-static-ui.sh
  │  ├─ nginx-root.conf
  │  ├─ nginx-subpath.conf
  │  ├─ prepare-release.mjs
  │  └─ useVersionUpdate.ts
  ├─ examples/
  │  └─ basic-vite-app/
  │     ├─ public/
  │     └─ src/
  ├─ CONTRIBUTING.md
  ├─ LICENSE
  ├─ README.en-US.md
  ├─ REPOSITORY_PROFILE.md
  └─ README.md
```

## 本地启动

```bash
pnpm install
pnpm dev
```

## 生产构建

```bash
pnpm build
```

这里有一个比较容易混淆的点：

- 根仓库执行 `pnpm dev` / `pnpm build`，启动和构建的是“演示站”
- `build:release` 不在根仓库，而是在 `examples/basic-vite-app` 里
- 如果你想跑通“可上传到服务器的发布包流程”，可以进入 `examples/basic-vite-app`

## 本地与服务器分别跑什么

- 本地开发机可以是 Windows、macOS 或 Linux，用来运行 `pnpm install`、`pnpm dev`、`pnpm build`
- 服务器发布脚本 `deploy-static-ui.sh` 是给 Linux + `nginx` 服务器用的，不是给本地 Windows 直接执行的
- 如果服务器没有 `rsync`，脚本也会退回到 `tar` 方式同步文件
- 页面里的版本检测逻辑跑在浏览器中，依赖的是线上可访问的 `version.json`

## 从哪里开始

如果你是第一次使用这套方案，可以按下面顺序开始：

1. 先直接复制 `examples/basic-vite-app`
2. 进入这个目录后，再跑 `pnpm install`、`pnpm dev`、`pnpm build:release`
3. 先确认本地能产出 `release/<target-path>-<timestamp>-<git-hash>` 目录
4. 再根据自己的项目替换 `VITE_APP_CONTEXT_PATH`、页面内容和服务器目录
5. 如果你已经有现成业务项目，或者已经跑通完整示例，也可以再回到 `templates/` 目录里按需复制单个文件

第一次上手时，可以直接按下面的命令执行：

```bash
cd examples/basic-vite-app
pnpm install
pnpm dev
pnpm build:release
```

`examples/basic-vite-app` 现在已经是一个完整模板项目，不只是最小结构示例，也是当前仓库默认推荐的接入入口。它包含：

- 更新提示组件
- 版本检测 composable
- `public/version.json`
- `vite.config.ts`
- `.env.development` / `.env.production`
- `scripts/prepare-release.mjs`
- `package.json` 里的 `build:release`
- `deploy-static-ui.sh`

## 仓库补充文件

- `LICENSE`：MIT 许可证
- `CONTRIBUTING.md`：贡献指南
- `README.en-US.md`：英文说明
- `REPOSITORY_PROFILE.md`：仓库简介、topics 和 release 文案建议
- `examples/basic-vite-app`：完整模板项目，也是默认推荐入口，建议优先从这里复制

## 最小落地流程

如果你想先快速理解落地流程，可以先把它看成下面 4 步：

1. 在本地业务项目里构建出带 hash 的静态资源，并生成 `version.json`
2. 用 `prepare-release.mjs` 把产物整理成一个单独的 `release` 目录
3. 把这个 `release` 目录上传到服务器临时目录
4. 在服务器上执行 `deploy-static-ui.sh`，先同步资源，最后替换 `index.html`

不需要一开始就理解所有模板细节。先把 `examples/basic-vite-app` 这条完整流程跑通，再回头按需微调会更轻松一些。

## 这几个词分别是什么意思

- `project-name`：项目名，用来拼出类似 `/home/app/<project-name>/ui/...` 的服务器目录
- `target-path`：站点在线上对应的子路径目录名，例如 `basic-vite-app`、`dg`、`monitoring`
- `uploaded-release-dir`：你上传到服务器的那一版发布包目录
- `live-root`：线上正在提供服务的最终目录，传了 `--live-root` 后，脚本就不再帮你推导路径

如果你看到 `project-name + target-path` 还是有点抽象，可以直接按这个例子理解：

- `project-name = demo-project`
- `target-path = basic-vite-app`
- 最终线上目录 = `/home/app/demo-project/ui/basic-vite-app`
- 上传目录 = `/home/app/demo-project/ui/releases/basic-vite-app-20260527120000-a1b2c3`

## 模板说明

### `templates/deploy-static-ui.sh`

服务器通用发布脚本，核心逻辑是：

1. 先同步新资源，但不删除旧 `assets`
2. 最后替换 `index.html`
3. 如果存在 `version.json`，最后一并替换
4. 同时备份旧入口文件，便于回滚

它支持两种路径模式。可以先判断服务器目录模型，再决定怎么调用。

#### 怎么选

- 服务器目录长期统一，就用 `project-name + target-path`
- 只知道线上最终目录，或者路径不规则，就用 `--live-root`
- 如果正式目录能稳定写成 `/home/app/<project-name>/ui/<target-path>`，优先用普通模式
- 如果不同服务器目录差异很大，可以优先考虑 `--live-root`

#### 模式 1：`project-name + target-path`

适用场景：

- 所有项目都放在 `/home/app/<project-name>/ui/<target-path>`
- 不同项目只是 `project-name` 和 `target-path` 不同
- 你希望服务器脚本调用参数尽量统一

命令示例：

```bash
/home/app/deploy-static-ui.sh demo-project basic-vite-app /home/app/demo-project/ui/releases/basic-vite-app-20260527120000-a1b2c3
```

#### 模式 2：`--live-root`

适用场景：

- 正式目录不是 `/home/app/<project-name>/ui/<target-path>`
- 你的线上目录是固定绝对路径，例如 `/mnt/data/app/dist`
- 你不想让脚本再推导项目名和子路径

命令示例：

```bash
/home/app/deploy-static-ui.sh --live-root /mnt/data/app/dist /mnt/data/app/releases/app-20260527120000-a1b2c3
```

如果上传的是 `prepare-release.mjs` 产出的标准 release 目录，而目录下只有一个构建子目录，脚本会自动识别，不需要额外传第 4 个参数。

如果上传目录里存在多个候选子目录，或者你想显式指定构建子目录，也可以再传第 4 个参数：

```bash
/home/app/deploy-static-ui.sh --live-root /mnt/data/app/dist /mnt/data/app/releases/app-20260527120000-a1b2c3 app
```

这里的 `--live-root`，可以直接理解成“线上正式目录”。传入它以后，脚本不会再按项目目录规则自动拼路径，而是直接把这个绝对路径当作最终发布位置。

### `templates/prepare-release.mjs`

本地发布目录整理脚本，核心逻辑是：

1. 读取 `.env.production` 里的 `VITE_APP_CONTEXT_PATH`
2. 从 `dist/<target-path>` 整理出 `release/<target-path>-<timestamp>-<git-hash>`
3. 生成 `deploy-info.json`
4. 每次先清空本地 `release` 目录，只保留最近一次发布包

根路径部署时，脚本会直接读取 `dist`，并产出 `release/root-<timestamp>-<git-hash>/root`。

### `templates/useVersionUpdate.ts`

页面内版本检测逻辑，负责：

1. 优先使用构建时注入的 `__APP_VERSION__` 作为当前页面版本
2. 请求 `${import.meta.env.BASE_URL}version.json` 获取服务器最新版本
3. 定时检查新版本
4. 页面重新聚焦或恢复可见时再次检查
5. 维护“稍后提醒 / 关闭后稍后再提示”的状态

这里的 `templates/` 更适合作为“按需摘文件的参考区”，不是第一次接入时的首选入口。第一次使用时，优先从 `examples/basic-vite-app` 复制会更稳妥。

### `templates/nginx-subpath.conf`

适用于：

- `/dg/`
- `/monitoring/`
- `/analysis-system/`

这类子路径部署场景。

### `templates/nginx-root.conf`

适用于：

- 站点直接部署在根路径 `/`
- 正式目录类似 `/mnt/data/app/dist`

## 核心原则

- 建议不要直接覆盖整包
- 建议不要在发布时立即删除旧 `assets`
- 建议将 `index.html` 和 `version.json` 配置为禁缓存
- 建议将 `assets` 下的 hash 资源配置为强缓存
- 版本检测组件通常基于 `import.meta.env.BASE_URL` 请求 `version.json`

## 直接接入到你的项目

如果你不想复制整个示例项目，而是要接入到已有业务仓库，可以从这一节开始。

### 1. 放入版本提示组件

把 `src/components/VersionUpdateNotification.vue` 放到你的项目组件目录。

### 2. 放入版本检测逻辑

把 `src/composables/useVersionUpdate.ts` 放到你的 `composables` 或 `hooks` 目录。

### 3. 在根布局或 `App.vue` 中接入

```vue
<script setup lang="ts">
import VersionUpdateNotification from '@/components/VersionUpdateNotification.vue'
import { useVersionUpdate } from '@/composables/useVersionUpdate'

const {
  currentVersion,
  latestVersion,
  showNotification,
  applyUpdate,
  remindLater,
  closeNotification
} = useVersionUpdate()

const handleRefresh = () => {
  applyUpdate()
  window.location.reload()
}
</script>

<template>
  <VersionUpdateNotification
    :visible="showNotification"
    :current-version="currentVersion"
    :latest-version="latestVersion"
    @refresh="handleRefresh"
    @later="remindLater"
    @close="closeNotification"
  />
</template>
```

### 4. 确保构建产物里存在 `version.json`

如果你的项目还没有生成 `version.json`，就需要在构建阶段补上这个文件。组件和 composable 的前提都是：

- 浏览器能访问到 `${BASE_URL}version.json`
- 文件里至少包含 `version` 字段
- 构建阶段能提供当前页面版本，例如在 `vite.config.ts` 里通过 `define` 注入 `__APP_VERSION__`

例如：

```json
{
  "version": "v1.0.3"
}
```

## 哪些变量需要替换

### 服务器脚本 `deploy-static-ui.sh`

你要根据自己的服务器目录替换这些变量或参数：

- `project-name`
- `target-path`
- `/home/app/<project-name>/ui`
- `/home/app/<project-name>/ui/releases`

如果你的服务器目录不是这一套模型，也可以使用：

- `--live-root <absolute-live-root> <uploaded-release-dir> [source-subdir]`

例如：

```bash
/home/app/deploy-static-ui.sh --live-root /mnt/data/app/dist /mnt/data/app/releases/app-20260527120000-a1b2c3
```

### `nginx` 模板

子路径部署至少要替换：

- `project-path`
- `<project-name>`

根路径部署至少要替换：

- `/mnt/data/app/dist`

### `prepare-release.mjs`

这个脚本默认适合：

- `Vite`
- `.env.production` 中存在 `VITE_APP_CONTEXT_PATH`

如果你的项目不是 `dist/<target-path>` 这种输出结构，就需要相应调整：

- `distDir`
- `releaseName`
- `releaseAppDir`

## 示例目录说明

如果你想快速理解“业务项目里怎么接入”，建议从这个完整模板项目开始：

- `examples/basic-vite-app/src/App.vue`
- `examples/basic-vite-app/src/components/VersionUpdateNotification.vue`
- `examples/basic-vite-app/src/composables/useVersionUpdate.ts`
- `examples/basic-vite-app/public/version.json`
- `examples/basic-vite-app/scripts/prepare-release.mjs`
- `examples/basic-vite-app/deploy-static-ui.sh`
- `examples/basic-vite-app/.env.production`

这个目录现在是一个可直接运行、也方便按需复制的完整模板项目。

## FAQ

### 为什么根目录没有 `build:release`

因为根仓库主要承担的是“演示站 + 模板展示”的角色，根目录的 `pnpm build` 只会构建这个说明型站点。真正演示“业务项目如何产出发布包”的是 `examples/basic-vite-app`，所以 `build:release` 放在那个示例项目里。

### 为什么发布后不建议立刻删除旧 `assets`

因为用户可能还停留在旧标签页，旧页面仍然引用上一版的 hash 资源。发布时马上删除这些文件，旧页面后续刷新、切路由或触发懒加载时就可能出现 `404`。更稳妥的做法是先保留旧资源，等过一段时间后再统一清理。

### 什么时候该用 `--live-root`

当你的线上目录不是统一的 `/home/app/<project-name>/ui/<target-path>` 结构，或者你更希望直接传线上正式目录绝对路径时，可以使用 `--live-root`。它的意思是：脚本不再推导目录，而是把你给的路径当成最终发布目录。

### 为什么需要 `version.json`

因为页面里的版本检测逻辑需要一个轻量、可禁缓存、可稳定请求的文件来判断服务器上是否已经出现新版本。相比直接比对 `index.html`，`version.json` 更适合作为轮询入口。

### 为什么刚发布完，用户页面不一定马上是最新

这是这套方案的设计结果，不是异常。无感发布的目标是让旧页面继续可用，同时在检测到新版本后再提示刷新；只有当用户刷新页面时，浏览器才会真正切到新的 `index.html` 和新的资源入口。

## 适用前提

- 前端是 `Vite` 或其他会生成 hash 资源名的静态构建项目
- 线上是 `nginx` 静态托管
- 发布流程允许“先同步资源，后切入口”
- 页面支持通过 `version.json` 判断新旧版本

## 不适用场景

- 服务端渲染项目
- 构建产物不带 hash 的静态资源体系
- 线上不是 `nginx` 静态托管，而是 Node 中间层动态渲染
- 强依赖“发布时立即清空旧资源”的场景
