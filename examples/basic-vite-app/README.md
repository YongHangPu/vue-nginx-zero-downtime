# basic-vite-app

这是一个可直接运行、也方便复制到你自己仓库里的完整模板项目，也是当前仓库默认推荐的接入入口。

## 目录说明

```text
examples/basic-vite-app/
  ├─ scripts/
  │  ├─ generate-version-json.mjs
  │  └─ prepare-release.mjs
  ├─ .env.development
  ├─ .env.production
  ├─ deploy-static-ui.sh
  ├─ package.json
  ├─ vite.config.ts
  ├─ public/
  │  └─ version.json
  └─ src/
     ├─ components/
     │  └─ VersionUpdateNotification.vue
     ├─ composables/
     │  └─ useVersionUpdate.ts
     ├─ App.vue
     ├─ main.ts
     └─ style.css
```

## 运行方式

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
```

整理发布目录：

```bash
pnpm build:release
```

## 这个示例现在包含什么

- 版本提示组件
- 版本检测 composable
- `public/version.json`
- `vite.config.ts` 中的子路径构建配置
- `.env.production` 中的 `VITE_APP_CONTEXT_PATH`
- `scripts/prepare-release.mjs`
- `scripts/generate-version-json.mjs`
- `package.json` 中的 `build:release`
- `deploy-static-ui.sh` 服务器发布脚本

## 用户怎么使用

### 方式 1：把这个示例目录作为模板起点

你可以复制整个 `basic-vite-app` 目录到你自己的仓库，再按项目实际情况调整这些地方：

- `package.json` 项目名
- `.env.production` 里的 `VITE_APP_CONTEXT_PATH`
- `deploy-static-ui.sh` 的调用模式
- `src/App.vue` 里的业务页面内容

如果你是第一次接入这套方案，建议优先使用这种方式，而不是先去 `templates/` 里手动拆文件。

### 方式 2：只复制你需要的文件到现有业务项目

这一种更适合已经有现成业务项目、并且已经理解完整发布链路的人使用。

最少需要复制这些：

- `src/components/VersionUpdateNotification.vue`
- `src/composables/useVersionUpdate.ts`
- `public/version.json`
- `scripts/generate-version-json.mjs`
- `scripts/prepare-release.mjs`
- `deploy-static-ui.sh`
- `vite.config.ts` 中与 `base / outDir / __APP_VERSION__` 相关的配置
- `package.json` 中的 `build:release`

## 首次接入步骤

如果你准备把这个示例项目复制到自己的仓库，可以按下面顺序操作：

1. 修改 `.env.production` 里的 `VITE_APP_CONTEXT_PATH`
2. 根据你的业务内容调整 `src/App.vue` 或替换成自己的页面
3. 执行 `pnpm install`、`pnpm dev`，先确认本地可以跑起来
4. 执行 `pnpm build:release`，确认能生成标准的 `release` 目录
5. 判断服务器目录模型，决定发布时使用 `project-name + target-path` 还是 `--live-root`
6. 把 `release` 目录上传到服务器上的临时发布目录
7. 在服务器执行 `deploy-static-ui.sh` 完成正式发布
8. 如果改过 `nginx`，最后执行 `nginx -t` 和 `nginx -s reload`

### `deploy-static-ui.sh` 路径模式怎么选

这个示例项目里的发布脚本同样支持两种路径模式。可以先看服务器目录模型，再决定怎么调用。

#### 怎么选

- 如果服务器目录长期统一，可以考虑 `project-name + target-path`
- 如果只知道线上最终目录，或者路径不规则，可以考虑 `--live-root`
- 如果正式目录能稳定写成 `/home/app/<project-name>/ui/<target-path>`，普通模式通常会更顺手
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

如果上传的是 `prepare-release.mjs` 产出的标准 release 目录，而且目录下只有一个构建子目录，脚本会自动识别，不需要额外传第 4 个参数。

如果上传目录里存在多个候选子目录，或者你想显式指定构建子目录，也可以再传第 4 个参数：

```bash
/home/app/deploy-static-ui.sh --live-root /mnt/data/app/dist /mnt/data/app/releases/app-20260527120000-a1b2c3 app
```

这里的 `--live-root`，可以理解成“线上正式目录”。传入它以后，脚本不会再按项目目录规则自动拼路径，而是把这个绝对路径当作最终发布位置。

## 注意

- 这个目录现在是“完整模板项目”，不只是结构示意
- `version.json` 会在执行 `pnpm build` / `pnpm build:release` 前自动生成
- 首次接入时，可以先跑通上面的“首次接入步骤”，再去调整模板细节
- 你复制到自己项目后，最少要按实际环境修改：
  - `VITE_APP_CONTEXT_PATH`
  - 服务器目录
  - `project-name` / `target-path`
  - 或者改成 `--live-root` 这种绝对目录调用方式
