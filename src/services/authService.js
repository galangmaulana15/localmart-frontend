import api from './api'

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password
    })

    const token = response.data?.data?.token

    if (token) {
      localStorage.setItem('token', token)
    }

    return response
  },

  register: async (data) => {
    const requestData = {
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      ...(data.phone && { phone: data.phone }),
      ...(data.address && { address: data.address })
    }

    return api.post('/auth/register', requestData)
  },

  getMe: async () => {
    return api.get('/auth/profile')
  },

  logout: async () => {
    localStorage.removeItem('token')

    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.log('Logout lokal berhasil')
    }
  }
}