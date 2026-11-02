// Hujjatning JORIY yuborish tartibi (parallel / ketma-ket) — `/v1/document-route` dan.
// Saqlangan forma holatidagi `oneByOne` eskirgan bo'lishi mumkin (masalan, drawer'dagi «Kelishuvchilar»
// oynasida tartib o'zgartirilgan) — tahrirda shu eski qiymat bilan saqlansa, parallel hujjat
// jimgina ketma-ketga aylanadi. Shu sabab tahrir ochilganda tartib shu yerdan olinadi.
//
// Natija: true — ketma-ket, false — parallel, null — aniqlab bo'lmadi (saqlangan qiymat qoladi).
// Marshrutda 2 tadan kam kelishuvchi bo'lsa backend `mode: 'parallel'` ni sukut bo'yicha beradi —
// bunga ishonilmaydi, tartib kelishuvchilarning `order` laridan hisoblanadi.
export const loadLiveRouteSequential = async (model, documentId) => {
  try {
    const res = await $ApiService.documentService._documentRoute({
      params: { model, document_id: documentId }
    })
    const route = res.data.data
    if (!route || route.locked) return null
    const signers = (route.items || []).filter((v) => v.role !== 'view')
    if (signers.length < 2) return null
    return new Set(signers.map((v) => v.order ?? 1)).size > 1
  } catch {
    return null
  }
}
