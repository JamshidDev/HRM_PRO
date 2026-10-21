import Utils from '@/utils/Utils.js'

// API lavozim qatoridan biriktirish ro'yxati elementi (UIUser uchun data bilan).
export const toWorkerItem = (v) => ({
  id: v.id,
  name: Utils.combineFullName(v.worker),
  position: v.position,
  data: {
    photo: v.worker.photo,
    lastName: v.worker.last_name,
    firstName: v.worker.first_name,
    middleName: v.worker.middle_name,
    position: v.position
  }
})
