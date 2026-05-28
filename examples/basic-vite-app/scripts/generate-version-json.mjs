import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const publicDir = path.join(projectRoot, 'public')
const packageJsonPath = path.join(projectRoot, 'package.json')
const versionJsonPath = path.join(publicDir, 'version.json')

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

const main = async () => {
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
  const gitShortHash = getGitShortHash()
  const createdAt = new Date().toISOString()

  await mkdir(publicDir, { recursive: true })
  await writeFile(
    versionJsonPath,
    `${JSON.stringify(
      {
        version: `v${packageJson.version}`,
        gitShortHash,
        createdAt
      },
      null,
      2
    )}\n`,
    'utf8'
  )

  console.log(`Generated ${path.relative(projectRoot, versionJsonPath)}`)
}

main().catch((error) => {
  console.error('Failed to generate version.json.')
  console.error(error)
  process.exitCode = 1
})
