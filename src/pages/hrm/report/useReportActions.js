import {
  useAccountStore,
  useComponentStore,
  useDepartmentStore,
  useReport2Store
} from '@/store/modules/index.js'
import { AppPaths } from '@utils'
import router from '@/router/index.js'

// Bo'linma/lavozim/xodim amallari — ro'yxat (kartochka) va jadval
// ko'rinishlari bir xil modal va so'rovlardan foydalanadi.
export const useReportActions = () => {
  const store = useReport2Store()
  const dpStore = useDepartmentStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const deleteDepartment = (v) => {
    if (store.busy) return
    store.department.selectedId = null
    store.department.elementId = v.id
    store._deleteDepartment()
  }

  const editDepartment = (v) => {
    if (store.busy) return
    dpStore.elementId = v.id
    dpStore.visibleType = false
    store.department.visible = true
    dpStore.payload.name = v.name
    dpStore.payload.name_ru = v.name_ru
    dpStore.payload.name_en = v.name_en
    dpStore.payload.comment = v.comment
    dpStore.payload.level = v.level.id
    dpStore.showParent = Boolean(v.parent_id)
    dpStore.payload.parent_id = v.parent_id
    dpStore._level()
    componentStore._departments()
  }

  const addPosition = (v) => {
    if (store.busy) return
    store.position.visible = true
    store.position.visibleType = true
    store.resetPositionPayload()
    store.positionPayload.department_id = v.id
    componentStore.departmentList = [v]
    componentStore._departments()
  }

  const editPosition = (item) => {
    if (store.busy) return
    if (!accStore.checkAction(accStore.pn.hrReportWrite)) return
    store.onEdit(item)
  }

  // `departmentId` — jadval ko'rinishida faqat shu bo'linma lavozimlari qayta yuklanadi.
  const deletePosition = (v, departmentId) => {
    if (store.busy) return
    store.position.selectedId = null
    store.position.elementId = v.id
    store._deletePosition(departmentId)
  }

  const openWorker = (v) => {
    if (!accStore.checkAction(accStore.pn.hrWorkersWrite)) return
    router.push({
      path: `${AppPaths.Hrm}${AppPaths.WorkerProfile}`,
      query: { id: v.worker.uuid }
    })
  }

  return {
    deleteDepartment,
    editDepartment,
    addPosition,
    editPosition,
    deletePosition,
    openWorker
  }
}
