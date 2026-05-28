<script setup lang="ts">
import { computed, ref } from 'vue'
import VersionUpdateNotification from './components/VersionUpdateNotification.vue'
import componentSource from './components/VersionUpdateNotification.vue?raw'
import useVersionUpdateTemplate from '../templates/useVersionUpdate.ts?raw'
import deployScriptTemplate from '../templates/deploy-static-ui.sh?raw'
import nginxRootTemplate from '../templates/nginx-root.conf?raw'
import nginxSubpathTemplate from '../templates/nginx-subpath.conf?raw'
import prepareReleaseTemplate from '../templates/prepare-release.mjs?raw'
import { useVersionUpdate } from './composables/useVersionUpdate'

const selectedTemplate = ref('deploy-script')
const releaseCount = ref(0)
const mockServerVersion = ref('v1.0.0')
const copyFeedback = ref('')
const mockRequestDelayMs = 900

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

const {
  currentVersion,
  latestVersion,
  showNotification,
  isChecking,
  checkForUpdates,
  applyUpdate,
  remindLater,
  closeNotification
} = useVersionUpdate({
  currentVersion: 'v1.0.0',
  autoStart: false,
  requestVersion: async () => {
    await wait(mockRequestDelayMs)
    return mockServerVersion.value
  }
})

const principles = [
  {
    title: '先上资源，后切入口',
    description: '发布阶段先同步新 assets，最后再替换 index.html 和 version.json，避免用户撞上半更新状态。'
  },
  {
    title: '入口不缓存',
    description: '通常会将 index.html 和 version.json 配置为禁缓存，这样浏览器能更快拿到新的版本入口。'
  },
  {
    title: '资源强缓存',
    description: '带 hash 的静态资源可以长期缓存，因为文件名变化本身就是版本边界。'
  }
]

const workflowSteps = [
  {
    step: '01',
    title: '本地生成发布目录',
    detail: '在你的业务项目里接入 prepare-release.mjs，并配置 build:release，产出 release/<target-path>-<timestamp>-<git-hash>。'
  },
  {
    step: '02',
    title: '上传到临时目录',
    detail: '把 release 目录上传到服务器上的临时发布目录，比如 /home/app/<project-name>/ui/releases/ 或 /mnt/data/app/releases/。'
  },
  {
    step: '03',
    title: '服务器脚本发布',
    detail: '可以先判断你的服务器目录模型：统一目录通常用 project-name + target-path；目录不规则时也可以用 --live-root 指向线上最终目录。'
  },
  {
    step: '04',
    title: '重载配置并验证',
    detail: '如果改过 nginx，就先 nginx -t，再 nginx -s reload，最后验证 version.json 和缓存头。'
  }
]

const pathModeGuides = [
  {
    title: 'project-name + target-path 目录模式',
    summary: '适合统一的项目目录模型。脚本会根据项目名和子路径拼出正式目录。',
    useCases: [
      '所有项目都放在 /home/app/<project-name>/ui/<target-path>',
      '不同项目只是 project-name 和 target-path 不同',
      '你希望服务器脚本的调用参数更统一'
    ],
    command: '/home/app/deploy-static-ui.sh demo-project basic-vite-app /home/app/demo-project/ui/releases/basic-vite-app-20260527120000-a1b2c3',
    suggestion: '如果你的服务器目录长期遵循同一套命名规则，可以优先考虑这个模式。'
  },
  {
    title: '`--live-root` 绝对路径模式',
    summary: '适合目录不规则或跨服务器差异较大的场景。你可以直接把线上正式目录的绝对路径传给脚本。',
    useCases: [
      '正式目录不是 /home/app/<project-name>/ui/<target-path>',
      '你的线上目录是固定绝对路径，例如 /mnt/data/app/dist',
      '你不想让脚本再推导项目名和子路径'
    ],
    command: '/home/app/deploy-static-ui.sh --live-root /mnt/data/app/dist /mnt/data/app/releases/app-20260527120000-a1b2c3',
    extraCommand: '/home/app/deploy-static-ui.sh --live-root /mnt/data/app/dist /mnt/data/app/releases/app-20260527120000-a1b2c3 app',
    suggestion: '如果你更关心目录可控性，而不是统一命名规则，可以考虑这个模式。'
  }
]

const pathChoiceTips = [
  '如果服务器目录长期统一，可以考虑 project-name + target-path。',
  '如果只知道线上最终目录，或者路径不规则，可以考虑 --live-root。',
  '拿不准时，可以先看正式目录能不能稳定写成 /home/app/<project-name>/ui/<target-path>。如果能，普通模式通常会更顺手；如果不能，可以考虑 --live-root。'
]

const fitCheckCards = [
  {
    title: '比较适合的项目',
    summary: 'Vue / Vite 静态站点、Nginx 托管、构建产物带 hash，且希望发布时旧页面继续可用。',
    tone: 'fit'
  },
  {
    title: '接入前要确认的事',
    summary: '需要能提供 version.json、调整缓存策略，并准备一个用于上传 release 包的服务器目录。',
    tone: 'check'
  },
  {
    title: '可能不太适合的情况',
    summary: 'SSR、动态服务端渲染、没有 hash 资源体系，或发布时必须立即清空旧资源的项目。',
    tone: 'caution'
  }
]

const startHereCards = [
  {
    title: '先复制完整模板项目',
    summary: '可以从 examples/basic-vite-app 开始，它已经包含组件、composable、version.json、vite 配置、build:release 和双模式服务器发布脚本。',
    action: '查看完整模板',
    href: '#start-here'
  },
  {
    title: '先决定发布路径模式',
    summary: '先判断你的服务器目录是否符合统一的 /home/app/<project-name>/ui/<target-path> 模型，再决定用普通模式还是 --live-root。',
    action: '查看路径选择',
    href: '#path-modes'
  },
  {
    title: '最后再按需拆文件',
    summary: '如果你已经有现成业务项目，也可以再回到 templates 目录按需复制脚本、组件或 nginx 片段。',
    action: '查看模板库',
    href: '#templates'
  }
]

const starterChecklist = [
  '可以先复制 examples/basic-vite-app 整个目录',
  '进入 examples/basic-vite-app 后，再运行 pnpm install、pnpm dev、pnpm build:release',
  '确认 scripts/generate-version-json.mjs 会自动生成 version.json',
  '按部署路径调整 .env.production 里的 VITE_APP_CONTEXT_PATH',
  '先判断发布时用 project-name + target-path 还是 --live-root',
  '确认 scripts/prepare-release.mjs 会整理 release 目录',
  '最后再按需回头看 templates 目录'
]

const copyFileChecklist = [
  'src/components/VersionUpdateNotification.vue',
  'src/composables/useVersionUpdate.ts',
  'public/version.json（或生成它的脚本）',
  'scripts/generate-version-json.mjs',
  'scripts/prepare-release.mjs',
  'deploy-static-ui.sh',
  '.env.production 里的 VITE_APP_CONTEXT_PATH 配置',
  'vite.config.ts 中的 base / outDir 配置',
  'package.json 中的 build:release 脚本'
]

const faqItems = [
  {
    question: '为什么发布后不建议立刻删除旧 assets？',
    answer: '因为用户可能还停留在旧标签页，旧页面引用的还是上一版 hash 资源。你如果在发布瞬间删掉它们，旧页面一刷新或懒加载就可能 404。更稳妥的方式是先保留一段时间，再按策略延迟清理。'
  },
  {
    question: '什么时候该用 --live-root？',
    answer: '当你的线上目录不是统一的 /home/app/<project-name>/ui/<target-path> 结构，或者你更希望直接指定正式目录时，可以使用 --live-root。它表示把你传入的绝对路径当成线上最终目录。'
  },
  {
    question: '为什么还需要 version.json？',
    answer: '因为页面需要一个轻量、可禁缓存的文件来判断服务器上是否已经有新版本。相比直接比对 index.html，version.json 更稳定，也更适合给页面里的版本检测逻辑轮询。'
  },
  {
    question: '为什么我刚发布完，用户页面不一定马上变成最新？',
    answer: '这是预期行为。无感发布的目标不是强制打断用户，而是让旧页面继续可用，并在检测到新版本后再提示刷新。只有当用户刷新页面，浏览器才会加载新的 index.html 和新的资源入口。'
  }
]

const templateOptions = [
  { id: 'deploy-script', label: '服务器发布脚本', language: 'bash', code: deployScriptTemplate },
  { id: 'prepare-release', label: '发布目录整理脚本', language: 'js', code: prepareReleaseTemplate },
  { id: 'use-version-update', label: '版本检测 composable', language: 'ts', code: useVersionUpdateTemplate },
  { id: 'nginx-subpath', label: 'Nginx 子路径模板', language: 'nginx', code: nginxSubpathTemplate },
  { id: 'nginx-root', label: 'Nginx 根路径模板', language: 'nginx', code: nginxRootTemplate },
  { id: 'component', label: '更新提示组件', language: 'vue', code: componentSource }
]

const selectedTemplateContent = computed(() => {
  return templateOptions.find((item) => item.id === selectedTemplate.value) ?? templateOptions[0]
})

const demoStatus = computed(() => {
  if (currentVersion.value === latestVersion.value) {
    return '当前页面已经是最新版本'
  }
  return `检测到新版本 ${latestVersion.value}，等待用户刷新`
})

const triggerNewRelease = async () => {
  releaseCount.value += 1
  mockServerVersion.value = `v1.0.${releaseCount.value}`
  await checkForUpdates()
}

const handleRefresh = () => {
  applyUpdate()
}

const handleLater = () => {
  remindLater()
}

const handleClose = () => {
  closeNotification()
}

const resetDemo = () => {
  releaseCount.value = 0
  mockServerVersion.value = 'v1.0.0'
  currentVersion.value = 'v1.0.0'
  latestVersion.value = 'v1.0.0'
  showNotification.value = false
}

const copyCurrentTemplate = async () => {
  try {
    await navigator.clipboard.writeText(selectedTemplateContent.value.code)
    copyFeedback.value = `已复制 ${selectedTemplateContent.value.label}`
  } catch {
    copyFeedback.value = '复制失败，请手动选择代码'
  }

  window.setTimeout(() => {
    copyFeedback.value = ''
  }, 1800)
}
</script>

<template>
  <div class="app-shell">
    <header class="hero-panel">
      <div class="hero-copy">
        <p class="eyebrow">Vue + Nginx Deployment System</p>
        <h1>vue-nginx-zero-downtime</h1>
        <p class="hero-lead">
          一套专门面向 Vue 静态站点的无感发布方案，覆盖发布目录整理、Nginx 缓存策略、双模式服务器发布脚本，以及页面内的版本更新提示组件。
        </p>
        <div class="hero-actions">
          <a href="#fit-check" class="primary-link">先看是否适合</a>
          <a href="#start-here" class="secondary-link">从完整模板开始</a>
          <a href="#workflow" class="secondary-link">查看发布流程</a>
          <a href="#templates" class="secondary-link">复制模板代码</a>
        </div>
        <p class="hero-note">建议阅读顺序：先判断适用性，再跑完整模板，最后按需看路径模式和模板代码。</p>
      </div>
      <div class="hero-metrics">
        <article>
          <span>发布模型</span>
          <strong>两阶段切换</strong>
          <p>先同步资源，后切入口</p>
        </article>
        <article>
          <span>缓存策略</span>
          <strong>入口禁缓存</strong>
          <p>assets 强缓存 + immutable</p>
        </article>
        <article>
          <span>适配范围</span>
          <strong>多项目 / 多服务器</strong>
          <p>普通模式 + --live-root 双模式</p>
        </article>
      </div>
    </header>

    <section id="fit-check" class="section-block section-spotlight section-fit-check">
      <div class="section-heading">
        <p class="section-kicker">Quick Fit</p>
        <h2>先判断这套方案适不适合你的项目</h2>
      </div>
      <p class="demo-text">
        如果你是第一次看这个仓库，建议先用这 3 张卡片快速判断适用性。确定方向没问题后，再去看完整模板、发布流程和路径模式会更顺。
      </p>
      <div class="start-grid">
        <article v-for="item in fitCheckCards" :key="item.title" class="info-card start-card fit-card" :class="`fit-card-${item.tone}`">
          <h3>{{ item.title }}</h3>
          <p>{{ item.summary }}</p>
        </article>
      </div>
    </section>

    <section id="start-here" class="section-block section-guide section-start">
      <div class="section-heading">
        <p class="section-kicker">Start Here</p>
        <h2>确定适合后，可以先从完整模板项目开始</h2>
      </div>
      <p class="demo-text">
        如果你想先跑通一遍完整流程，可以先复制 <code>examples/basic-vite-app</code>。这个目录已经包含版本提示组件、版本检测逻辑、
        `version.json`、`build:release` 和服务器发布脚本，比较适合第一次接入时作为起点。
      </p>
      <div class="start-grid">
        <article v-for="item in startHereCards" :key="item.title" class="info-card start-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.summary }}</p>
          <a :href="item.href" class="inline-link">{{ item.action }}</a>
        </article>
      </div>
      <div class="starter-checklist">
        <div class="section-heading compact">
          <p class="section-kicker">Copy Checklist</p>
          <h2>第一次接入时的最小操作清单</h2>
        </div>
        <ul class="checklist-list">
          <li v-for="item in starterChecklist" :key="item">{{ item }}</li>
        </ul>
      </div>
      <div class="starter-checklist">
        <div class="section-heading compact">
          <p class="section-kicker">File Checklist</p>
          <h2>如果你只想按需复制文件，可以先看这些</h2>
        </div>
        <ul class="checklist-list">
          <li v-for="item in copyFileChecklist" :key="item">{{ item }}</li>
        </ul>
      </div>
    </section>

    <section id="workflow" class="section-block section-guide section-workflow">
      <div class="section-heading">
        <p class="section-kicker">Workflow</p>
        <h2>一条更容易上手的发布流程</h2>
      </div>
      <p class="demo-text">
        如果你已经确定要落地这套方案，可以先按这 4 步理解整体流程。先跑通一次，再回头微调缓存、目录和模板细节会更容易。
      </p>
      <div class="workflow-list">
        <article v-for="item in workflowSteps" :key="item.step" class="workflow-card">
          <span class="workflow-step">{{ item.step }}</span>
          <div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.detail }}</p>
          </div>
        </article>
      </div>
    </section>

    <section id="path-modes" class="section-block section-detail section-path-modes">
      <div class="section-heading">
        <p class="section-kicker">Path Modes</p>
        <h2>准备发布时，再来看路径模式怎么选</h2>
      </div>
      <p class="demo-text path-modes-intro">
        这套脚本支持两种路径模式。不一定要先记住所有参数，可以先判断自己的服务器目录是不是统一模型，再决定更适合传
        `project-name + target-path`，还是使用 `--live-root` 指向线上正式目录。
      </p>
      <div class="path-mode-grid">
        <article v-for="item in pathModeGuides" :key="item.title" class="info-card path-mode-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.summary }}</p>
          <div class="path-mode-block">
            <p class="path-mode-label">适用场景</p>
            <ul class="checklist-list compact">
              <li v-for="useCase in item.useCases" :key="useCase">{{ useCase }}</li>
            </ul>
          </div>
          <div class="path-mode-block">
            <p class="path-mode-label">命令示例</p>
            <pre><code>{{ item.command }}</code></pre>
          </div>
          <div v-if="item.extraCommand" class="path-mode-block">
            <p class="path-mode-label">嵌套子目录示例</p>
            <pre><code>{{ item.extraCommand }}</code></pre>
          </div>
          <p class="path-mode-tip">{{ item.suggestion }}</p>
        </article>
      </div>
      <div class="starter-checklist">
        <div class="section-heading compact">
          <p class="section-kicker">How To Choose</p>
          <h2>可以这样判断</h2>
        </div>
        <ul class="checklist-list">
          <li v-for="item in pathChoiceTips" :key="item">{{ item }}</li>
        </ul>
      </div>
      <p class="demo-text path-modes-note">
        `live-root` 的字面意思就是“线上正在服务的最终目录”。传入 `--live-root` 后，脚本不再帮你拼
        `/home/app/&lt;project-name&gt;/ui/&lt;target-path&gt;`，而是把你给的绝对路径当成正式发布目录。
      </p>
    </section>

    <section class="section-block section-principles">
      <div class="section-heading">
        <p class="section-kicker">Why This Works</p>
        <h2>理解这 3 个原则，后面的细节会更容易看懂</h2>
      </div>
      <div class="principle-grid">
        <article v-for="item in principles" :key="item.title" class="info-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section class="section-block demo-layout section-demo">
      <div class="demo-copy">
        <div class="section-heading">
          <p class="section-kicker">Component Demo</p>
          <h2>更新提示组件交互演示</h2>
        </div>
        <p class="demo-text">
          这个演示已经接入了 `useVersionUpdate()`。点击“模拟发布新版本”后，会触发一次版本检查流程，再由更新提示组件负责交互展示。
        </p>
        <div class="demo-stats">
          <div>
            <span>当前页面版本</span>
            <strong>{{ currentVersion }}</strong>
          </div>
          <div>
            <span>服务器最新版本</span>
            <strong>{{ latestVersion }}</strong>
          </div>
        </div>
        <p class="demo-status">{{ demoStatus }}</p>
        <p class="demo-checking">检查状态：{{ isChecking ? '正在请求 version.json...' : '当前空闲' }}</p>
        <div class="demo-actions">
          <button type="button" class="primary-button" @click="triggerNewRelease">模拟发布新版本</button>
          <button type="button" class="secondary-button" @click="checkForUpdates">手动检查一次</button>
          <button type="button" class="secondary-button" @click="resetDemo">重置演示</button>
        </div>
      </div>

      <div class="demo-stage">
        <div class="demo-browser">
          <div class="browser-bar">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="browser-content">
            <p class="browser-path">/project-path/dashboard</p>
            <h3>你现在看到的是一个旧标签页</h3>
            <p>
              当服务器发布了新版本后，页面不会立刻白屏；只有检测到 `version.json` 变化时，才提示用户主动刷新。
            </p>
          </div>
        </div>

        <div class="toast-anchor">
          <VersionUpdateNotification
            :visible="showNotification"
            :current-version="currentVersion"
            :latest-version="latestVersion"
            @refresh="handleRefresh"
            @later="handleLater"
            @close="handleClose"
          />
        </div>
      </div>
    </section>

    <section class="section-block section-faq">
      <div class="section-heading">
        <p class="section-kicker">FAQ</p>
        <h2>最常见的 4 个问题</h2>
      </div>
      <div class="faq-list">
        <article v-for="item in faqItems" :key="item.question" class="faq-card">
          <p class="faq-question">{{ item.question }}</p>
          <p class="faq-answer">{{ item.answer }}</p>
        </article>
      </div>
    </section>

    <section id="templates" class="section-block section-reference">
      <div class="section-heading">
        <p class="section-kicker">Template Library</p>
        <h2>可按需复制的模板代码</h2>
      </div>
      <div class="template-tabs">
        <button
          v-for="item in templateOptions"
          :key="item.id"
          type="button"
          class="template-tab"
          :class="{ active: selectedTemplate === item.id }"
          @click="selectedTemplate = item.id"
        >
          {{ item.label }}
        </button>
      </div>
      <div class="code-shell">
        <div class="code-meta">
          <span>{{ selectedTemplateContent.label }}</span>
          <div class="code-meta-actions">
            <button type="button" class="copy-button" @click="copyCurrentTemplate">复制代码</button>
            <code>{{ selectedTemplateContent.language }}</code>
          </div>
        </div>
        <pre><code>{{ selectedTemplateContent.code }}</code></pre>
      </div>
      <p v-if="copyFeedback" class="copy-feedback">{{ copyFeedback }}</p>
    </section>
  </div>
</template>
