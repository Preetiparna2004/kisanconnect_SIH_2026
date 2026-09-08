import api from './api'

export const aiService = {
  recommendCrops: (data) => api.post('/ai/crop-recommend', data),
  forecastDemand: (data) => api.post('/ai/demand-forecast', data),
  optimizeRoute: (data) => api.post('/ai/route-optimize', data),
}
