import { useCallback, useEffect, useRef, useState } from 'react'
import { getCached, isStale, setCached } from '../lib/queryCache'

/**
 * Cached API query hook with stale-while-revalidate behaviour.
 */
export function useApiQuery(cacheKey, fetcher, options = {}) {
  const {
    enabled = true,
    staleTime = 60_000,
    initialData = null,
  } = options

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const cached = getCached(cacheKey)
  const [data, setData] = useState(cached?.data ?? initialData ?? null)
  const [loading, setLoading] = useState(enabled && !cached)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const hasLoadedRef = useRef(!!cached)

  const run = useCallback(async (force = false) => {
    const hit = getCached(cacheKey)

    if (!force && hit && !isStale(cacheKey, staleTime)) {
      setData(hit.data)
      setLoading(false)
      setError(null)
      hasLoadedRef.current = true
      return hit.data
    }

    if (!hasLoadedRef.current && !hit) setLoading(true)
    else setIsRefreshing(true)

    try {
      const result = await fetcherRef.current()
      const normalized = result ?? initialData ?? null
      setCached(cacheKey, normalized)
      setData(normalized)
      setError(null)
      hasLoadedRef.current = true
      return normalized
    } catch (err) {
      setError(err)
      if (hit?.data) {
        setData(hit.data)
        return hit.data
      }
      throw err
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [cacheKey, staleTime])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    run().catch(() => {})
  }, [enabled, cacheKey, run])

  const refetch = useCallback(() => run(true), [run])

  return { data, loading, error, isRefreshing, refetch, setData }
}
