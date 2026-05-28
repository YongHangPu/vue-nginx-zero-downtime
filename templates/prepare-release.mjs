import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const releaseBaseDir = path.join(projectRoot, 'release')
const packageJsonPath = path.join(projectRoot, 'package.json')
const productionEnvPath = path.join(projectRoot, '.env.production')

const getReleaseContext = async () => {
  const envContent = await readFile(productionEnvPath, 'utf8')
  const matched = envContent.match(/^\s*VITE_APP_CONTEXT_PATH\s*=\s*['"]?([^'"\r\n]+)['"]?\s*$/m)
  const contextPath = matched?.[1]?.trim() || '/'
  const normalizedPath = contextPath === '/' ? '' : contextPath.replace(/^\/+|\/+$/g, '')

  return {
    appDirName: normalizedPath || 'root',
    distDirName: normalizedPath
  }
}

const getGitShortHash = () => {
  try {
    return execSync('git rev-parse --short HEAD', {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()
  } catch {
    return 'nogit'
  }
}

const formatTimestamp = (date) => {
  const pad = (value) => `${value}`.padStart(2, '0')
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
}

const main = async () => {
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
  const { appDirName, distDirName } = await getReleaseContext()
  const distDir = distDirName ? path.join(projectRoot, 'dist', distDirName) : path.join(projectRoot, 'dist')

  const releaseTimestamp = formatTimestamp(new Date())
  const gitShortHash = getGitShortHash()
  const releaseName = `${appDirName}-${releaseTimestamp}-${gitShortHash}`
  const releaseRoot = path.join(releaseBaseDir, releaseName)
  const releaseAppDir = path.join(releaseRoot, appDirName)

  // 本地只保留最近一次打出来的发布目录，避免手工上传时选错包。
  await rm(releaseBaseDir, { recursive: true, force: true })
  await mkdir(releaseRoot, { recursive: true })
  await cp(distDir, releaseAppDir, { recursive: true })

  const deployInfo = {
    projectName: packageJson.name,
    projectVersion: packageJson.version,
    releaseName,
    appDirName,
    buildOutput: distDirName ? `dist/${distDirName}` : 'dist',
    releasePath: `release/${releaseName}`,
    createdAt: new Date().toISOString(),
    gitShortHash
  }

  await writeFile(path.join(releaseRoot, 'deploy-info.json'), `${JSON.stringify(deployInfo, null, 2)}\n`, 'utf8')

  console.log(`Release prepared: release/${releaseName}`)
  console.log(`Upload directory: ${releaseRoot}`)
}

main().catch((error) => {
  console.error('Failed to prepare release package.')
  console.error(error)
  process.exitCode = 1
})
