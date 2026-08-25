import axios from '../../index.js'

// Brauzer FCM tokenini yozadi/o'chiradi. Login'dan KEYIN ruxsat berilganda ishlatiladi.
const _updateFcm = async (payload) => {
  return await axios.post(`/v1/user/mobile/update-fcm`, payload.data)
}

export default {
  _updateFcm
}
