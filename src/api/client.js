import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token — uses ref_ prefix to avoid clashing with main app
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ref_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Refresh token on 401
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (original.url?.includes('/auth/token/refresh/')) {
      doLogout(); return Promise.reject(error)
    }
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }
      original._retry = true
      isRefreshing = true
      const refresh = localStorage.getItem('ref_refresh_token')
      if (!refresh) { doLogout(); return Promise.reject(error) }
      try {
        const { data } = await axios.post(`${BASE_URL}/api/v1/auth/token/refresh/`, { refresh })
        localStorage.setItem('ref_access_token', data.access)
        processQueue(null, data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch (err) {
        processQueue(err, null); doLogout(); return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

function doLogout() {
  localStorage.removeItem('ref_access_token')
  localStorage.removeItem('ref_refresh_token')
  localStorage.removeItem('nexcribe-ref-auth')
  window.dispatchEvent(new Event('auth:logout'))
}

export default api