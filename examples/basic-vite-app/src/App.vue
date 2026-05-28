<script setup lang="ts">
import { ref } from 'vue'
import VersionUpdateNotification from './components/VersionUpdateNotification.vue'
import { useVersionUpdate } from './composables/useVersionUpdate'

declare const __APP_VERSION__: string

const mockServerVersion = ref(__APP_VERSION__)

const {
  currentVersion,
  latestVersion,
  showNotification,
  applyUpdate,
  remindLater,
  closeNotification,
  checkForUpdates
} = useVersionUpdate({
  currentVersion: __APP_VERSION__,
  autoStart: false,
  requestVersion: async () => mockServerVersion.value
})

const versionJsonUrl = `${import.meta.env.BASE_URL}version.json`

const handleRefresh = () => {
  applyUpdate()
}

const simulateRelease = async () => {
  const nextPatch = Number((mockServerVersion.value.split('.').pop() || '0')) + 1
  mockServerVersion.value = `v1.0.${nextPatch}`
  await checkForUpdates()
}
</script>

<template>
  <main class="app">
    <div class="app-card">
      <h1>Basic Integration Example</h1>
      <p>这是一个可直接运行的最小示例，用来演示如何接入版本提示组件和 `useVersionUpdate`。</p>

      <div class="status-box">
        <p>当前页面版本：{{ currentVersion || '初始化中' }}</p>
        <p>服务器最新版本：{{ latestVersion || '初始化中' }}</p>
        <p>访问地址：<code>{{ versionJsonUrl }}</code></p>
      </div>

      <div class="actions">
        <button type="button" @click="simulateRelease">模拟发布新版本</button>
        <button type="button" class="secondary" @click="checkForUpdates">手动检查一次</button>
      </div>
    </div>

    <div class="toast-host">
      <VersionUpdateNotification
        :visible="showNotification"
        :current-version="currentVersion"
        :latest-version="latestVersion"
        @refresh="handleRefresh"
        @later="remindLater"
        @close="closeNotification"
      />
    </div>
  </main>
</template>
