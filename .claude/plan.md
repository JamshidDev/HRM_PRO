# Plan: StaffingApproval - Organization Auto-Select

## Muammo
`CreateModal.vue`da organization bitta bo'lsa ham foydalanuvchi qo'lda tanlashi kerak. Bu noqulay.

## Yechim
`UISelect` komponentining `@defaultValue` eventidan foydalanish. Bu event organizationlar ro'yxati bitta bo'lganda avtomatik chaqiriladi.

---

## O'zgartirishlar

### 1. CreateModal.vue (src/pages/accountant/staffingApproval/ui/CreateModal.vue)

**Qo'shiladigan funksiya:**
```javascript
const onDefaultOrganization = (v) => {
  selectedOrganization.value = v
  store.payload.organization_id = v.length > 0 ? v[0].id : null
  store.payload.department_positions = []
  expandList.value = []
  store._showGenerate()
}
```

**UISelect komponentiga @defaultValue qo'shish:**
```vue
<UISelect
  :multiple="false"
  :options="componentStore.structureList"
  :model-v="selectedOrganization"
  :checked-val="expandedKeys"
  @updateModel="onChangeOrganization"
  @defaultValue="onDefaultOrganization"    <!-- YANGI -->
  @updateCheck="(v) => (expandedKeys = v)"
  :loading="componentStore.structureLoading"
  v-model:search="componentStore.structureParams.search"
  @onSearch="componentStore._structures"
/>
```

---

## Natija
- Organization bitta bo'lsa, modal ochilganda avtomatik tanlanadi
- Departmentlar (positions) avtomatik yuklanadi
- Foydalanuvchi qo'shimcha harakat qilishi shart emas
