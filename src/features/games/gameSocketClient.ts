import type { Socket } from 'socket.io-client'

type IoFactory = typeof import('socket.io-client').io
type SocketConnectOpts = NonNullable<Parameters<IoFactory>[1]>

let ioFactory: IoFactory | null = null
let loadPromise: Promise<IoFactory> | null = null

async function getIoFactory(): Promise<IoFactory> {
  if (ioFactory) return ioFactory
  if (!loadPromise) {
    loadPromise = import('socket.io-client').then((mod) => {
      ioFactory = mod.io
      return ioFactory
    })
  }
  return loadPromise
}

export async function createGameSocket(opts: SocketConnectOpts): Promise<Socket>
export async function createGameSocket(uri: string, opts?: SocketConnectOpts): Promise<Socket>
export async function createGameSocket(
  uriOrOpts: string | SocketConnectOpts,
  maybeOpts?: SocketConnectOpts,
): Promise<Socket> {
  const io = await getIoFactory()
  if (typeof uriOrOpts === 'string') {
    return io(uriOrOpts, maybeOpts)
  }
  return io(uriOrOpts)
}

export type { Socket }
