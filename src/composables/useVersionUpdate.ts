import { onMounted, onUnmounted, ref } from 'vue'

declare const __APP_VERSION__: string | undefined

export interface UseVersionUpdateOptions {
  currentVersion?: string
  versionUrl?: string
  requestVersion?: () => Promise<string | null>
  checkInterval?: number
  autoStart?: boolean
  checkOnVisibility?: boolean
  visibilityDelay?: number
  remindLaterMs?: number
  remindAfterCloseMs?: number
}

const isClient = typeof window !== 'undefined'
const buildVersion = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__.trim() : ''

export const useVersionUpdate = (options: UseVersionUpdateOptions = {}) => {
  const baseUrl =
    isClient && import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`

  const versionUrl = options.versionUrl ?? `${baseUrl}version.json`
  const checkInterval = options.checkInterval ?? 5 * 60 * 1000
  const autoStart = options.autoStart ?? true
  const checkOnVisibility = options.checkOnVisibility ?? true
  const visibilityDelay = options.visibilityDelay ?? 1000
  const remindLaterMs = options.remindLaterMs ?? 10 * 60 * 1000
  const remindAfterCloseMs = options.remindAfterCloseMs ?? 30 * 60 * 1000

  const initialVersion = options.currentVersion ?? buildVersion
  const currentVersion = ref(initialVersion)
  const latestVersion = ref(initialVersion)
  const showNotification = ref(false)
  const isChecking = ref(false)

  let checkTimer: ReturnType<typeof setInterval> | null = null
  let remindTimer: ReturnType<typeof setTimeout> | null = null
  let visibilityTimer: ReturnType<typeof setTimeout> | null = null

  const clearRemindTimer = () => {
    if (!remindTimer) {
      return
    }

    clearTimeout(remindTimer)
    remindTimer = null
  }

  const scheduleReminder = (delay: number) => {
    clearRemindTimer()

    remindTimer = setTimeout(() => {
      if (latestVersion.value && latestVersion.value !== currentVersion.value) {
        showNotification.value = true
      }
    }, delay)
  }

  const defaultRequestVersion = async (): Promise<string | null> => {
    const response = await fetch(`${versionUrl}?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.version || null
  }

  const requestVersion = options.requestVersion ?? defaultRequestVersion

  const initializeCurrentVersion = async () => {
    if (currentVersion.value) {
      latestVersion.value = currentVersion.value
      return
    }

    try {
      const version = await requestVersion()
      if (version) {
        currentVersion.value = version
        latestVersion.value = version
      }
    } catch (error) {
      console.error('[useVersionUpdate] 初始化版本失败:', error)
    }
  }

  const checkForUpdates = async () => {
    if (isChecking.value) {
      return
    }

    isChecking.value = true

    try {
      if (!currentVersion.value) {
        await initializeCurrentVersion()
      }

      const version = await requestVersion()
      if (!version) {
        return
      }

      latestVersion.value = version

      if (currentVersion.value && version !== currentVersion.value) {
        clearRemindTimer()
        showNotification.value = true
      }
    } catch (error) {
      console.error('[useVersionUpdate] 检查更新失败:', error)
    } finally {
      isChecking.value = false
    }
  }

  const applyUpdate = () => {
    if (latestVersion.value) {
      currentVersion.value = latestVersion.value
    }
    showNotification.value = false
    clearRemindTimer()
  }

  const remindLater = () => {
    showNotification.value = false
    scheduleReminder(remindLaterMs)
  }

  const closeNotification = () => {
    showNotification.value = false
    scheduleReminder(remindAfterCloseMs)
  }

  const handleVisibilityChange = () => {
    if (!checkOnVisibility || document.hidden) {
      return
    }

    if (visibilityTimer) {
      clearTimeout(visibilityTimer)
    }

    visibilityTimer = setTimeout(() => {
      checkForUpdates()
    }, visibilityDelay)
  }

  const start = async () => {
    await initializeCurrentVersion()

    if (checkTimer || checkInterval <= 0) {
      return
    }

    checkTimer = setInterval(() => {
      checkForUpdates()
    }, checkInterval)

    if (checkOnVisibility && isClient) {
      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('focus', handleVisibilityChange)
    }
  }

  const stop = () => {
    if (checkTimer) {
      clearInterval(checkTimer)
      checkTimer = null
    }

    clearRemindTimer()

    if (visibilityTimer) {
      clearTimeout(visibilityTimer)
      visibilityTimer = null
    }

    if (checkOnVisibility && isClient) {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleVisibilityChange)
    }
  }

  onMounted(() => {
    if (autoStart) {
      start()
    }
  })

  onUnmounted(() => {
    stop()
  })

  return {
    currentVersion,
    latestVersion,
    showNotification,
    isChecking,
    versionUrl,
    checkForUpdates,
    applyUpdate,
    remindLater,
    closeNotification,
    start,
    stop
  }
}
