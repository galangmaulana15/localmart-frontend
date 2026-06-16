const DEFAULT_LOCAL_API_BASE_URL = 'http://localhost:5000/api'
const DEFAULT_REMOTE_API_BASE_URL = 'https://localmart-backend-fbyw.onrender.com/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? DEFAULT_LOCAL_API_BASE_URL
    : DEFAULT_REMOTE_API_BASE_URL)

class ApiError extends Error {
  constructor(message, { status = 0, data = null, headers = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.response = {
      status,
      data,
      headers,
    }
  }
}

const buildUrl = (path = '') => {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const normalizedBase = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`
  const normalizedPath = String(path || '').replace(/^\//, '')
  return new URL(normalizedPath, normalizedBase).toString()
}

const getAuthHeaders = () => {
  const headers = {}
  const token = localStorage.getItem('token')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

const parseBody = async (response) => {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }

  try {
    return await response.text()
  } catch {
    return null
  }
}

const handleUnauthorized = (status) => {
  if (status === 401) {
    localStorage.removeItem('token')
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }
}

const request = async (method, path, data = undefined, config = {}) => {
  const headers = {
    ...(config.headers || {}),
    ...getAuthHeaders(),
  }

  const options = {
    method,
    credentials: 'include',
    ...config,
    headers,
  }

  if (data !== undefined) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
    if (isFormData) {
      delete options.headers['Content-Type']
      options.body = data
    } else {
      options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json'
      options.body = typeof data === 'string' ? data : JSON.stringify(data)
    }
  }

  try {
    const response = await fetch(buildUrl(path), options)
    const responseData = await parseBody(response)

    if (!response.ok) {
      handleUnauthorized(response.status)
      const message =
        responseData?.message ||
        responseData?.error ||
        responseData?.error_message ||
        `Request gagal (${response.status})`

      throw new ApiError(message, {
        status: response.status,
        data: responseData,
        headers: response.headers,
      })
    }

    return {
      data: responseData,
      status: response.status,
      headers: response.headers,
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(`Request gagal: ${error.message}`, {
      status: 0,
      data: null,
      headers: null,
    })
  }
}

const api = {
  get: (path, config = {}) => request('GET', path, undefined, config),
  post: (path, data, config = {}) => request('POST', path, data, config),
  put: (path, data, config = {}) => request('PUT', path, data, config),
  delete: (path, config = {}) => request('DELETE', path, undefined, config),
  patch: (path, data, config = {}) => request('PATCH', path, data, config),
}

export default api
