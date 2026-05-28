<script setup lang="ts">
withDefaults(
  defineProps<{
    visible: boolean
    currentVersion: string
    latestVersion: string
    title?: string
    description?: string
    refreshText?: string
    laterText?: string
    closable?: boolean
  }>(),
  {
    title: '发现新版本',
    description: '应用已发布新版本，刷新页面后即可切换到最新资源。',
    refreshText: '立即刷新',
    laterText: '稍后',
    closable: true
  }
)

defineEmits<{
  refresh: []
  later: []
  close: []
}>()
</script>

<template>
  <Transition name="toast-fade">
    <article v-if="visible" class="version-toast">
      <button v-if="closable" type="button" class="toast-close" aria-label="关闭提示" @click="$emit('close')">×</button>
      <div class="toast-icon">UP</div>
      <div class="toast-body">
        <p class="toast-title">{{ title }}</p>
        <p class="toast-desc">{{ description }}</p>
        <div class="toast-version-row">
          <span>当前 {{ currentVersion }}</span>
          <span>最新 {{ latestVersion }}</span>
        </div>
        <div class="toast-actions">
          <button type="button" class="toast-primary" @click="$emit('refresh')">{{ refreshText }}</button>
          <button type="button" class="toast-secondary" @click="$emit('later')">{{ laterText }}</button>
        </div>
      </div>
    </article>
  </Transition>
</template>
