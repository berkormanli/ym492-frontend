// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// API endpoints
export const API_ENDPOINTS = {
  // Prediction endpoints
  predict: '/api/predict',
  predictions: {
    history: '/api/predictions/history',
    details: (id: string) => `/api/predictions/${id}`,
    image: (id: string) => `/api/predictions/${id}/image`,
    heatmap: (id: string) => `/api/predictions/${id}/heatmap`,
    stats: '/api/predictions/stats',
    bulk: '/api/predictions/bulk',
    export: '/api/predictions/export',
    recent: '/api/predictions/recent',
    summary: '/api/predictions/summary',
  },

  // Dataset endpoints
  dataset: {
    upload: '/api/dataset/upload',
    list: '/api/dataset',
    details: (id: string) => `/api/dataset/${id}`,
    update: (id: string) => `/api/dataset/${id}`,
    delete: (id: string) => `/api/dataset/${id}`,
    stats: '/api/dataset/stats',
    bulk: '/api/dataset/bulk',
    thumbnail: (id: string) => `/api/dataset/${id}/thumbnail`,
    image: (id: string) => `/api/dataset/${id}/image`,
  },

  // Model endpoints
  models: {
    list: '/api/models',
    train: '/api/models/train',
    training: {
      status: '/api/models/training/status',
      logs: '/api/models/training/logs',
      stop: '/api/models/training/stop',
      sessions: '/api/models/training/sessions',
    },
    switch: '/api/models/switch',
    versions: (name: string) => `/api/models/${name}/versions`,
    metrics: (name: string) => `/api/models/${name}/metrics`,
    delete: (name: string, version: string) => `/api/models/${name}/${version}`,
    current: '/api/models/current',
    compare: '/api/models/compare',
  },

  // Dashboard endpoints
  dashboard: {
    stats: '/api/dashboard/stats',
    usage: '/api/dashboard/usage',
    performance: '/api/dashboard/performance',
    recent: '/api/dashboard/recent',
    overview: '/api/dashboard/overview',
    comparison: '/api/dashboard/models/comparison',
    charts: {
      predictions: '/api/dashboard/charts/predictions',
      accuracy: '/api/dashboard/charts/accuracy',
    },
    export: '/api/dashboard/export',
    health: '/api/dashboard/health',
    updateStats: '/api/dashboard/stats/update',
  },

  // System endpoints
  health: '/api/health',
  info: '/api/info',
}

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`
}

// Helper function for API calls
export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const url = buildApiUrl(endpoint)
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const mergedOptions = { ...defaultOptions, ...options }

  // Don't set Content-Type for FormData
  if (options?.body instanceof FormData) {
    delete mergedOptions.headers
  }

  const response = await fetch(url, mergedOptions)
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
