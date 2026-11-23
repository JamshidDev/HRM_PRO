import axios from '@/service/index.js'

// Shtatdan tashqari mehmonlar (HikCentral'dagi odam JSHSHIR bo'yicha biriktiriladi).
const _index = async (payload) => {
  return await axios.get(`/v1/turnstile/guests`, { params: payload?.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/turnstile/guests`, payload.data)
}

const _update = async (payload) => {
  return await axios.put(`/v1/turnstile/guests/${payload.id}`, payload.data)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/turnstile/guests/${payload.id}`)
}

const _events = async (payload) => {
  return await axios.get(`/v1/turnstile/guests/${payload.id}/events`, { params: payload.params })
}

export default { _index, _create, _update, _delete, _events }
