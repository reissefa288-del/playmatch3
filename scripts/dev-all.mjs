import { spawn } from 'node:child_process'

const isWin = process.platform === 'win32'
const npm = isWin ? 'npm.cmd' : 'npm'

const server = spawn(npm, ['run', 'server:dev'], { stdio: 'inherit', shell: isWin })
const client = spawn(npm, ['run', 'dev'], { stdio: 'inherit', shell: isWin })

function shutdown(code = 0) {
  server.kill()
  client.kill()
  process.exit(code)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

server.on('exit', (code) => {
  if (code && code !== 0) shutdown(code)
})
client.on('exit', (code) => {
  if (code && code !== 0) shutdown(code)
})
