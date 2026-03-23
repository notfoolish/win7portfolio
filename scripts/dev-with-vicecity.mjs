import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const viceCityDirCandidates = [
  path.join(projectRoot, 'public', 'games', 'reVCDOS-main'),
  path.join(projectRoot, 'public', 'games', 'revcdos-main'),
]

const viceCityDir = viceCityDirCandidates.find((dir) => fs.existsSync(path.join(dir, 'server.py')))

const pythonCandidates = process.platform === 'win32'
  ? ['python', 'py']
  : ['python3', 'python']

function spawnProcess(command, args, options = {}) {
  return spawn(command, args, {
    stdio: 'inherit',
    windowsHide: true,
    shell: process.platform === 'win32',
    ...options,
  })
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function pingViceCity() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:8000/', (res) => {
      res.resume()
      resolve(true)
    })

    req.on('error', () => resolve(false))
    req.setTimeout(1500, () => {
      req.destroy()
      resolve(false)
    })
  })
}

async function waitForViceCityReady(maxAttempts = 20, intervalMs = 500) {
  for (let i = 0; i < maxAttempts; i += 1) {
    const ok = await pingViceCity()
    if (ok) return true
    await wait(intervalMs)
  }
  return false
}

async function startViceCityServer() {
  if (!viceCityDir) {
    throw new Error('Could not find reVCDOS server folder (expected public/games/reVCDOS-main).')
  }

  const packedBinPath = path.join(viceCityDir, 'revcdos.bin')
  if (!fs.existsSync(packedBinPath)) {
    throw new Error(`Missing packed file: ${packedBinPath}`)
  }

  for (const cmd of pythonCandidates) {
    try {
      const args = cmd === 'py'
        ? ['-3', 'server.py', '--packed', 'revcdos.bin', '--custom_saves', '--port', '8000']
        : ['server.py', '--packed', 'revcdos.bin', '--custom_saves', '--port', '8000']

      const child = spawnProcess(cmd, args, { cwd: viceCityDir })

      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, 1000)
        child.once('exit', (code) => {
          clearTimeout(timer)
          if (code === 0) resolve()
          else reject(new Error(`${cmd} exited early (${code ?? 'unknown'})`))
        })
        child.once('error', (err) => {
          clearTimeout(timer)
          reject(err)
        })
      })

      const ready = await waitForViceCityReady()
      if (!ready) {
        try {
          child.kill('SIGTERM')
        } catch {
          // noop
        }
        throw new Error('Vice City backend did not become ready on http://127.0.0.1:8000')
      }

      return child
    } catch {
      // try next candidate
    }
  }

  throw new Error('Could not start Vice City backend. Install Python deps: pip install -r public/games/reVCDOS-main/requirements.txt')
}

function startVite() {
  const cmd = 'npm'
  return spawnProcess(cmd, ['run', 'dev:web'], { cwd: projectRoot })
}

const children = []
let shuttingDown = false

function shutdown(signal = 'SIGTERM') {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) {
    if (!child.killed) {
      try {
        child.kill(signal)
      } catch {
        try {
          child.kill()
        } catch {
          // noop
        }
      }
    }
  }
}

process.on('SIGINT', () => {
  shutdown('SIGINT')
  process.exit(0)
})

process.on('SIGTERM', () => {
  shutdown('SIGTERM')
  process.exit(0)
})

try {
  const viceCity = await startViceCityServer()
  children.push(viceCity)

  const vite = startVite()
  children.push(vite)

  vite.on('error', (err) => {
    console.error(`Failed to start Vite: ${err.message}`)
    shutdown('SIGTERM')
    process.exit(1)
  })

  vite.on('exit', (code) => {
    shutdown('SIGTERM')
    process.exit(code ?? 0)
  })

  viceCity.on('exit', (code) => {
    if (!shuttingDown) {
      console.error(`Vice City backend stopped (code: ${code ?? 'unknown'}).`)
      shutdown('SIGTERM')
      process.exit(typeof code === 'number' ? code : 1)
    }
  })
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
