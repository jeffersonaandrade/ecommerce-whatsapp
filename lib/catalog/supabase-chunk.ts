import 'server-only'

const CHUNK_SIZE = 150

export async function runInChunks<T>(
  items: T[],
  chunkSize: number,
  worker: (chunk: T[]) => Promise<void>
): Promise<void> {
  for (let i = 0; i < items.length; i += chunkSize) {
    await worker(items.slice(i, i + chunkSize))
  }
}

export { CHUNK_SIZE }
