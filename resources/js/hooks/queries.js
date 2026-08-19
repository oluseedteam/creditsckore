import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApiQuery } from './useApiQuery'

export function useUsersQuery(options = {}) {
  const { getAllUsers } = useAuth()
  return useApiQuery('users', getAllUsers, { staleTime: 30_000, initialData: [], ...options })
}

export function useCbtTestsQuery(options = {}) {
  const { api } = useAuth()
  const fetcher = useCallback(async () => {
    const res = await api.get('/cbt-tests')
    return res.data ?? []
  }, [api])
  return useApiQuery('cbt-tests', fetcher, { staleTime: 60_000, initialData: [], ...options })
}

export function useCbtTestQuery(id, options = {}) {
  const { api } = useAuth()
  const fetcher = useCallback(async () => {
    const res = await api.get(`/cbt-tests/${id}`)
    return res.data
  }, [api, id])
  return useApiQuery(`cbt-tests:${id}`, fetcher, { enabled: !!id, staleTime: 30_000, ...options })
}

export function useCurriculumQuery(options = {}) {
  const { api } = useAuth()
  const fetcher = useCallback(async () => {
    const res = await api.get('/curriculum-frameworks')
    return (res.data ?? []).sort((a, b) => a.week - b.week)
  }, [api])
  return useApiQuery('curriculum-frameworks', fetcher, { staleTime: 60_000, initialData: [], ...options })
}

export function useMessagesQuery(options = {}) {
  const { api } = useAuth()
  const fetcher = useCallback(async () => {
    const res = await api.get('/messages')
    return res.data ?? []
  }, [api])
  return useApiQuery('messages', fetcher, { staleTime: 30_000, initialData: [], ...options })
}

export function useCbtResultsQuery(options = {}) {
  const { api } = useAuth()
  const fetcher = useCallback(async () => {
    const res = await api.get('/cbt-results')
    return res.data ?? []
  }, [api])
  return useApiQuery('cbt-results', fetcher, { staleTime: 30_000, initialData: [], ...options })
}

export function useMyCbtResultsQuery(options = {}) {
  const { api } = useAuth()
  const fetcher = useCallback(async () => {
    const res = await api.get('/cbt-results/me')
    return res.data ?? []
  }, [api])
  return useApiQuery('cbt-results:me', fetcher, { staleTime: 30_000, initialData: [], ...options })
}

export function useQuizCatalogQuery(options = {}) {
  const { api } = useAuth()
  const fetcher = useCallback(async () => {
    const [testsRes, resultsRes] = await Promise.all([
      api.get('/cbt-tests'),
      api.get('/cbt-results/me'),
    ])
    const takenTestIds = (resultsRes.data ?? []).map((r) => r.cbt_test_id)
    return (testsRes.data ?? []).map((t) => ({
      ...t,
      alreadyTaken: takenTestIds.includes(t.id),
    }))
  }, [api])
  return useApiQuery('quiz-catalog', fetcher, { staleTime: 60_000, initialData: [], ...options })
}
