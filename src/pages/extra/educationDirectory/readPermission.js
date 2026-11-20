import { useRoute } from 'vue-router'
import { AppPaths, appPermissions } from '@/utils/index.js'

// Ta'lim katalogi ikki menyudan ochiladi (DAS-15974), sahifa bitta:
//  - Admin (/admin/admin-others) — har bob o'z ruxsati bilan (universities / specialities / languages -read);
//  - Extra (/extra/admin-others) — hammasi bitta `educations-structure-menu` ruxsati bilan.
// Qaysi URL'dan ochilgan bo'lsa, o'shaning ruxsati tekshiriladi — hech kim kirishdan mahrum bo'lmaydi.
const ADMIN_READ = {
  1: appPermissions.universitiesRead,
  2: appPermissions.specialitiesRead,
  3: appPermissions.languagesRead
}

export const useEducationReadPermission = () => {
  const route = useRoute()
  // tab: 1 — oliygohlar, 2 — mutaxassisliklar, 3 — tillar
  return (tab) =>
    route.path.startsWith(AppPaths.Admin + '/') ? ADMIN_READ[tab] : appPermissions.educationsStructureMenu
}
