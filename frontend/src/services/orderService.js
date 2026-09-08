import api from './api'

export const orderService = {
  place: (data) => api.post('/orders/', data),
  myOrders: () => api.get('/orders/my'),
  farmerIncoming: () => api.get('/orders/farmer/incoming'),
  get: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  initiatePayment: (orderId, method) => api.post('/payments/initiate', { order_id: orderId, method }),
  confirmPayment: (paymentId, transactionId) =>
    api.post('/payments/confirm', { payment_id: paymentId, transaction_id: transactionId }),
}
