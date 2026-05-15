import api from './client'

export const authAPI = {
  login:        (data) => api.post('/auth/login/', data),
  logout:       (data) => api.post('/auth/logout/', data),
  refreshToken: (data) => api.post('/auth/token/refresh/', data),
}

export const usersAPI = {
  getMe:           ()    => api.get('/users/me/'),
  getWallets:      ()    => api.get('/users/wallets/'),
  getVirtualCard:  ()    => api.get('/users/virtual-card/'),
  getTransactions: (p)   => api.get('/users/transactions/', { params: p }),
  getReferral:     ()    => api.get('/users/referral/'),
}

export const affiliatesAPI = {
  getNode:          ()      => api.get('/affiliates/node/'),
  getDownlineLevel: (level) => api.get(`/affiliates/downline/${level}/`),
  getCommissions:   (p)     => api.get('/affiliates/commissions/', { params: p }),
  getEarnings:      ()      => api.get('/affiliates/earnings/'),
}

export const paymentsAPI = {
  requestDeposit:    (data) => api.post('/payments/deposit/', data),
  getDeposits:       ()     => api.get('/payments/deposits/'),
  requestWithdrawal: (data) => api.post('/payments/withdraw/', data),
  getWithdrawals:    ()     => api.get('/payments/withdrawals/'),
  getMpesaDetails:   ()     => api.get('/payments/mpesa-details/'),
}

export const notificationsAPI = {
  getUnreadCount: () => api.get('/notifications/unread-count/'),
}