import Utils from '@/utils/Utils.js'

// API lavozim qatoridan biriktirish ro'yxati elementi (UIUser uchun data bilan).
export const toWorkerItem = (v) => ({
  id: v.id,
  name: Utils.combineFullName(v.worker),
  position: v.position,
  // Shu davrdagi boshqa smena(lar) — tanlansa saqlashda ko'chirish tasdig'i so'raladi.
  shifts: (v.rangeSchedules ?? []).map((r) => r.type_name).filter(Boolean),
  data: {
    photo: v.worker.photo,
    lastName: v.worker.last_name,
    firstName: v.worker.first_name,
    middleName: v.worker.middle_name,
    position: v.position
  }
})
