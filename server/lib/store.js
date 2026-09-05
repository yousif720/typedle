import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'

import { statsFilePath, usersFilePath, dataDir } from './config.js'
import {
  createEmptyStatsStore,
  createEmptyUsersStore,
  sanitizeStatsStore,
  sanitizeUsersStore,
} from './sanitize.js'

/**
 * The previous implementation did a full read-modify-write of the JSON file on
 * every request with no coordination, so two concurrent requests could each
 * read the same snapshot and the second write would silently discard the
 * first one's changes (a lost update).
 *
 * This store fixes that by:
 *   1. Loading each file once into memory at boot, so reads never touch disk.
 *   2. Funnelling every mutation through a promise chain, so read-modify-write
 *      cycles are strictly serialized.
 *   3. Persisting via write-to-temp + atomic rename, so a crash mid-write can
 *      never leave a truncated file behind.
 *
 * Note: the in-memory cache assumes a single server instance, which matches the
 * current Render deployment. Running multiple instances against one disk would
 * need a real database instead.
 */
class JsonStore {
  constructor({ filePath, sanitize, createEmpty }) {
    this.filePath = filePath
    this.sanitize = sanitize
    this.createEmpty = createEmpty
    this.cache = null
    this.queue = Promise.resolve()
  }

  async load() {
    await mkdir(dataDir, { recursive: true })

    try {
      const raw = await readFile(this.filePath, 'utf8')
      this.cache = this.sanitize(JSON.parse(raw))
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        console.error(`Could not read ${this.filePath}, starting from an empty store:`, error.message)
      }

      this.cache = this.createEmpty()
      await this.persist(this.cache)
    }

    return this.cache
  }

  read() {
    if (!this.cache) {
      throw new Error(`Store ${this.filePath} was read before load() completed.`)
    }

    return this.cache
  }

  async persist(value) {
    const tempPath = `${this.filePath}.${randomUUID()}.tmp`
    await writeFile(tempPath, JSON.stringify(value, null, 2), 'utf8')
    await rename(tempPath, this.filePath)
  }

  /**
   * Runs `mutator` with exclusive access to the store. The mutator receives the
   * current value and returns the next one; it is never run concurrently with
   * another mutator, so read-modify-write is safe.
   */
  update(mutator) {
    const run = async () => {
      const current = this.read()
      const next = this.sanitize(await mutator(current))
      await this.persist(next)
      this.cache = next
      return next
    }

    // Chain onto the queue but don't let one failure poison later writes.
    const result = this.queue.then(run, run)
    this.queue = result.then(
      () => undefined,
      () => undefined,
    )

    return result
  }
}

export const statsStore = new JsonStore({
  filePath: statsFilePath,
  sanitize: sanitizeStatsStore,
  createEmpty: createEmptyStatsStore,
})

export const usersStore = new JsonStore({
  filePath: usersFilePath,
  sanitize: sanitizeUsersStore,
  createEmpty: createEmptyUsersStore,
})

export async function loadStores() {
  await Promise.all([statsStore.load(), usersStore.load()])
}
