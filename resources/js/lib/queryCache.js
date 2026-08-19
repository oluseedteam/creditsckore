const store = new Map()

export function getCached(key) {
  return store.get(key) ?? null
}

export function setCached(key, data) {
  store.set(key, { data, fetchedAt: Date.now() })
}

export function isStale(key, staleTime = 60_000) {
  const entry = store.get(key)
  if (!entry) return true
  return Date.now() - entry.fetchedAt > staleTime
}

export function invalidateCache(keyOrPrefix) {
  if (!keyOrPrefix) {
    store.clear()
    return
  }

  for (const key of store.keys()) {
    if (key === keyOrPrefix || key.startsWith(`${keyOrPrefix}:`)) {
      store.delete(key)
    }
  }
}
