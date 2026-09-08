import api from './api'

export const cropService = {
  list: (params) => api.get('/crops/', { params }),
  get: (id) => api.get(`/crops/${id}`),
  create: (data) => api.post('/crops/', data),
  update: (id, data) => api.put(`/crops/${id}`, data),
  delete: (id) => api.delete(`/crops/${id}`),
  myListings: () => api.get('/crops/my/listings'),
  farmerCrops: (farmerId) => api.get(`/farmers/${farmerId}/crops`),
}
