import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'
import { useComponentStore } from '@/store/modules/index.js'
import { v4 as uuidv4 } from 'uuid'

export const useWorkerProfileStore = defineStore('workerProfileStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    positionVisible: false,
    commandVisible: false,
    totalItems: 0,
    payload: {
      first_name: null,
      last_name: null,
      middle_name: null,
      birthday: null,
      country_id: null,
      region_id: null,
      city_id: null,
      current_region_id: null,
      current_city_id: null,
      nationality_id: null,
      sex: null,
      address: null,
      inn: null,
      phones: [],
      marital_status: null,
      work_experience: null,
      experience_date: null,
      education: null
    },
    params: {
      page: 1,
      per_page: 10,
      search: null
    },
    tabs: [
      {
        name: 'workerProfile.tabs.personal',
        id: 1
      },
      {
        name: 'workerProfile.tabs.education',
        id: 2
      },
      {
        name: 'workerProfile.tabs.career',
        id: 3
      },
      {
        name: 'workerProfile.tabs.relative',
        id: 4
      },
      {
        name: 'workerProfile.tabs.others',
        id: 5
      }
    ],
    activeTab: 1,
    data: null,

    districts: [],
    districtLoading: false,
    currentDistricts: [],
    currentDistrictLoading: false,

    mainImgId: null,
    photos: [],

    workerId: null,
    passportLoading: false,
    passportList: [],

    foreignPassportLoading: false,
    foreignPassportList: [],

    positionList: [],
    previewLoading: false,
    workerPreview: false,
    rolesList: [],
    rolePayload: {
      organization_id: [],
      role: null
    },
    roleVisible: false,
    roleWorkerPositionId: null,
    structureCheck: [],
    roleLoading: false,

    userRoleParams: {
      page: 1,
      per_page: 10,
      search: null,
      organizations: [],
      role: null
    },
    userRoleList: [],
    userRoleLoading: false,
    userRoleTotal: 0,
    passwordVisible: false,
    passwordLoading: false,
    passwordPayload: {
      uuid: null,
      password: null
    },

    editVisible: false,
    editPayload: {
      organization_id: [],
      department_id: [],
      department_position_id: null,
      contract_number: null,
      contract_date: null,
      group: null,
      rank: null,
      rate: null,
      type: null,
      salary: null,
      schedule_id: null,
      table_number: null,
      position_date: null
    },
    positionLoading: false,
    positionId: null,
    structureCheckV2: [],
    departmentCheckV2: [],
    structureCheck2: [],
    isExistAccount: false,
    anotherProfile: null,

    workerDisabilityList: [],
    workerDisabilityLoading: false,
    workerDisabilityVisible: false,
    workerDisabilityVisibleType: true,
    workerDisabilityElementId: null,
    workerDisabilitySaveLoading: false,
    workerDisabilityDeleteLoading: false,
    workerDisabilityPayload: {
      number: null,
      from: null,
      to: null,
      comment: null,
      level: 1,
      is_lifelong: false
    }
  }),
  actions: {
    _index() {
      const componentStore = useComponentStore()
      this.loading = true
      $ApiService.workerService
        ._show({ id: this.elementId })
        .then((res) => {
          try {
            this.data = res.data.data
            this.workerId = this.data?.id
            this.isExistAccount = Boolean(this.data.profile)
            this.anotherProfile = this.data.another_profile
            this.payload.last_name = this.data.last_name
            this.payload.first_name = this.data.first_name
            this.payload.middle_name = this.data.middle_name
            this.payload.work_experience = this.data.work_experience.toString()
            this.payload.birthday = new Date(this.data.birthday).getTime()
            this.payload.experience_date = new Date(this.data.experience_date).getTime()
            this.payload.country_id = this.data.country.id
            this.payload.region_id = this.data.region.id
            this.payload.city_id = this.data.city.id
            this.payload.current_region_id = this.data.current_region.id
            this.payload.current_city_id = this.data.current_city.id
            this.payload.address = this.data.address
            this.payload.nationality_id = this.data.nationality?.id
            this.payload.sex = this.data?.sex
            this.payload.education = this.data?.education
            this.payload.pin = this.data.pin?.toString()
            // this.payload.inn = this.data.inn?.toString()
            this.payload.marital_status = this.data.marital_status?.id

            this.positionList = this.data.positions
            this.districts = [this.data.city]
            this.currentDistricts = [this.data.current_city]
            componentStore.countryList = [this.data.country]

            if (this.data.region.id === this.data.current_region.id) {
              componentStore.regionList = [{ ...this.data.region }]
            } else {
              componentStore.regionList = [{ ...this.data.region }, { ...this.data.current_region }]
            }

            this.photos = this.data.photos.map((v) => ({
              id: v.id,
              blob: null,
              base64: v.photo,
              url: v.photo,
              current: v.current
            }))

            if (this.photos.filter((v) => v.current).length > 0) {
              this.mainImgId = this.photos.filter((v) => v.current > 0)[0].id
            } else {
              this.mainImgId = this.photos?.[0]?.id
            }

            this.payload.phones =
              Array.isArray(this.data.phones) && this.data.phones?.length > 0
                ? this.data.phones.map((v, index) => ({
                    id: v.id,
                    phone: '+998' + v.phone,
                    main: this.data.profile ? v.phone === this.data.profile?.phone : index === 0,
                    exist: true
                  }))
                : [
                    {
                      id: uuidv4(),
                      phone: '+998',
                      main: true,
                      exist: false
                    }
                  ]

            this.rolesList = []
            for (const role of this.data.profile?.roles) {
              const roles = role.organizations.map((x) => ({
                ...x,
                roleName: role?.name,
                roleId: role?.id
              }))
              this.rolesList = [...this.rolesList, ...roles]
            }
          } catch (error) {}
        })
        .finally(() => {
          this.loading = false
        })
    },
    buildBodyData() {
      return {
        ...this.payload,
        pin: this.payload.pin.split('-').join(''),
        birthday: Utils.timeToZone(this.payload.birthday),
        experience_date: Utils.timeToZone(this.payload.experience_date),
        user_phone: this.payload.phones
          .filter((v) => v.main)[0]
          .phone.split('-')
          .join('')
          .slice(4),
        phones: this.payload.phones.map((v) => v.phone.split('-').join('').slice(4))
      }
    },
    savePersonalInfo(isUpdatePassword = false) {
      this.loading = true
      const data = {
        ...this.buildBodyData(),
        ...(isUpdatePassword ? { update_password: true } : {})
      }
      const id = this.workerId
      $ApiService.workerService
        ._update({ data, id })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.loading = false
        })
    },
    savePhoto() {
      const photos = this.photos
        .filter((v) => v.blob !== null)
        .map((v) => ({
          current: this.mainImgId === v.id,
          photo: v.base64
        }))
      const worker_id = this.workerId
      if (photos.length > 0) {
        this.loading = true
        for (let i = 0; i < photos.length; i++) {
          const data = {
            worker_id,
            ...photos[i]
          }
          $ApiService.photoService._create({ data }).then((res) => {
            this.photos = res.data.data.map((v) => ({
              id: v.id,
              blob: null,
              base64: v.photo,
              url: v.photo,
              current: v.current
            }))
            if (this.photos.filter((v) => v.current > 0).length > 0) {
              this.mainImgId = this.photos.filter((v) => v.current > 0)[0].id
            }
          })
        }
        this.loading = false
        // this._index()
      } else if (this.photos.length > 0) {
        this.loading = true
        const data = {
          current: true,
          photo: null
        }
        $ApiService.photoService
          ._update({ data, id: this.mainImgId })
          .then(() => {
            this._index()
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    _deletePhoto(id) {
      this.loading = true
      $ApiService.photoService
        ._delete({ id })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.loading = false
        })
    },
    _district() {
      let region_id = this.payload.region_id
      this.districtLoading = true
      $ApiService.districtService
        ._index({ params: { page: 1, per_page: 1000, region_id } })
        .then((res) => {
          this.districts = res.data.data.data
        })
        .finally(() => {
          this.districtLoading = false
        })
    },
    _currentDistrict() {
      let region_id = this.payload.current_region_id
      this.currentDistrictLoading = true
      $ApiService.districtService
        ._index({ params: { page: 1, per_page: 1000, region_id } })
        .then((res) => {
          this.currentDistricts = res.data.data.data
        })
        .finally(() => {
          this.currentDistrictLoading = false
        })
    },
    _indexPassport() {
      this.passportLoading = true
      const params = {
        uuid: this.elementId
      }
      $ApiService.passportService
        ._index({ params })
        .then((res) => {
          this.passportList = res.data.data.map((v) => ({
            id: v.id,
            serial_number: v.serial_number,
            address: v.address,
            from_date: new Date(v.from_date).getTime(),
            to_date: new Date(v.to_date).getTime(),
            file: {
              name: v.file
            },
            exist: true
          }))
        })
        .finally(() => {
          this.passportLoading = false
        })
    },
    _storePassport(data) {
      this.passportLoading = true
      $ApiService.passportService
        ._create({ data })
        .then(() => {
          this._indexPassport()
        })
        .finally(() => {
          this.passportLoading = false
        })
    },
    _updatePassport(data, id) {
      this.passportLoading = true
      const params = {
        _method: 'PUT'
      }
      $ApiService.passportService
        ._update({ data, id, params })
        .then(() => {
          this._indexPassport()
        })
        .finally(() => {
          this.passportLoading = false
        })
    },
    _deletePassport(id) {
      this.passportLoading = true
      $ApiService.passportService
        ._delete({ id })
        .then(() => {
          this._indexPassport()
        })
        .finally(() => {
          this.passportLoading = false
        })
    },
    _indexForeignPassport() {
      this.foreignPassportLoading = true
      const params = {
        uuid: this.elementId
      }
      $ApiService.foreignPassportService
        ._index({ params })
        .then((res) => {
          this.foreignPassportList = res.data.data.map((v) => ({
            id: v.id,
            serial_number: v.serial_number,
            given_place: v.given_place,
            from_date: new Date(v.from_date).getTime(),
            to_date: new Date(v.to_date).getTime(),
            file: {
              name: v.file
            },
            exist: true
          }))
        })
        .finally(() => {
          this.foreignPassportLoading = false
        })
    },
    _storeForeignPassport(data) {
      this.foreignPassportLoading = true
      $ApiService.foreignPassportService
        ._create({ data })
        .then(() => {
          this._indexForeignPassport()
        })
        .finally(() => {
          this.foreignPassportLoading = false
        })
    },
    _updateForeignPassport(data, id) {
      this.foreignPassportLoading = true
      const params = {
        _method: 'PUT'
      }
      $ApiService.foreignPassportService
        ._update({ data, id, params })
        .then(() => {
          this._indexForeignPassport()
        })
        .finally(() => {
          this.foreignPassportLoading = false
        })
    },
    _deleteForeignPassport(id) {
      this.foreignPassportLoading = true
      $ApiService.foreignPassportService
        ._delete({ id })
        .then(() => {
          this._indexForeignPassport()
        })
        .finally(() => {
          this.foreignPassportLoading = false
        })
    },
    _deletePhone(id) {
      this.loading = true
      $ApiService.phoneService
        ._delete({ id })
        .then(() => {
          this._index()
        })
        .finally(() => {})
    },
    openVisible(data) {
      this.visible = data
    },
    _deleteRole(data, id) {
      $ApiService.workerService._deleteRole({ data, id }).then(() => {
        this._index()
        this._userRole()
      })
    },
    _storeRole(data, id) {
      this.roleLoading = true
      $ApiService.workerService
        ._storeRole({ data, id })
        .then(() => {
          this._index()
          this._userRole()
        })
        .finally(() => {
          this.roleLoading = false
          this.roleVisible = false
          this.roleWorkerPositionId = null
        })
    },
    _attachUserRole(data) {
      this.roleLoading = true
      $ApiService.workerService
        ._attachUserRole({ data })
        .then(() => {
          this._userRole()
        })
        .finally(() => {
          this.roleLoading = false
          this.roleVisible = false
          this.roleWorkerPositionId = null
        })
    },
    _detachUserRole(data) {
      return $ApiService.workerService
        ._detachUserRole({ data })
        .then(() => {
          this._userRole()
        })
    },
    _updatePassword(workerId) {
      this.roleLoading = true
      $ApiService.workerService
        ._update({ data: { update_password: true }, id: workerId })
        .then(() => {
          window.$message?.success('Parol yangilandi')
        })
        .finally(() => {
          this.roleLoading = false
        })
    },
    _updateUserPassword() {
      this.passwordLoading = true
      $ApiService.workerService
        ._updateUserPassword({ data: this.passwordPayload })
        .then(() => {
          window.$message?.success('Parol yangilandi')
          this.passwordVisible = false
          this.passwordPayload = { uuid: null, password: null }
        })
        .finally(() => {
          this.passwordLoading = false
        })
    },
    _updatePosition() {
      const id = this.positionId
      const data = {
        ...this.editPayload,
        ...(this.editPayload.organization_id.length > 0 && this.editPayload.department_position_id
          ? {
              organization_id: this.editPayload.organization_id?.[0]?.id
            }
          : {
              organization_id: undefined,
              department_position_id: undefined
            }),
        department_id: undefined,
        contract_date: Utils.timeToZone(this.editPayload.contract_date),
        position_date: Utils.timeToZone(this.editPayload.position_date)
      }
      this.positionLoading = true
      $ApiService.workerService
        ._updatePosition({ data, id })
        .then(() => {
          this.editVisible = false
          this._index()
        })
        .finally(() => {
          this.positionLoading = false
        })
    },

    _userRole() {
      this.userRoleLoading = true
      const params = {
        ...this.userRoleParams,
        organizations: this.userRoleParams.organizations.map((v) => v.id).toString() || undefined,
        role: this.userRoleParams.role || undefined
      }
      $ApiService.workerService
        ._userRole({ params })
        .then((res) => {
          this.userRoleList = res.data.data.data
          this.userRoleTotal = res.data.data.total
        })
        .finally(() => {
          this.userRoleLoading = false
        })
    },

    resetForm() {
      this.elementId = null
      // this.payload.pin = null
      this.payload.position = null
    },

    resetWorkerDisabilityForm() {
      this.workerDisabilityElementId = null
      this.workerDisabilityPayload.number = null
      this.workerDisabilityPayload.from = new Date().setHours(0, 0, 0, 0)
      this.workerDisabilityPayload.to = null
      this.workerDisabilityPayload.comment = null
      this.workerDisabilityPayload.level = 1
      this.workerDisabilityPayload.is_lifelong = false
    },

    _indexWorkerDisability() {
      this.workerDisabilityLoading = true
      $ApiService.workerDisabilityService
        ._index({ params: { uuid: this.data?.uuid } })
        .then((res) => {
          this.workerDisabilityList = res.data.data
        })
        .finally(() => {
          this.workerDisabilityLoading = false
        })
    },

    _createWorkerDisability() {
      this.workerDisabilitySaveLoading = true
      const { is_lifelong } = this.workerDisabilityPayload
      const data = {
        uuid: this.data?.uuid,
        number: this.workerDisabilityPayload.number,
        level: this.workerDisabilityPayload.level,
        from: Utils.timeToZone(this.workerDisabilityPayload.from),
        to: is_lifelong ? null : Utils.timeToZone(this.workerDisabilityPayload.to),
        comment: this.workerDisabilityPayload.comment
      }
      $ApiService.workerDisabilityService
        ._create({ data })
        .then(() => {
          this.workerDisabilityVisible = false
          this._indexWorkerDisability()
        })
        .finally(() => {
          this.workerDisabilitySaveLoading = false
        })
    },

    _updateWorkerDisability() {
      this.workerDisabilitySaveLoading = true
      const { is_lifelong } = this.workerDisabilityPayload
      const data = {
        uuid: this.data?.uuid,
        number: this.workerDisabilityPayload.number,
        level: this.workerDisabilityPayload.level,
        from: Utils.timeToZone(this.workerDisabilityPayload.from),
        to: is_lifelong ? null : Utils.timeToZone(this.workerDisabilityPayload.to),
        comment: this.workerDisabilityPayload.comment
      }
      $ApiService.workerDisabilityService
        ._update({ data, id: this.workerDisabilityElementId })
        .then(() => {
          this.workerDisabilityVisible = false
          this._indexWorkerDisability()
        })
        .finally(() => {
          this.workerDisabilitySaveLoading = false
        })
    },

    _deleteWorkerDisability() {
      this.workerDisabilityDeleteLoading = true
      $ApiService.workerDisabilityService
        ._delete({ id: this.workerDisabilityElementId })
        .then((res) => {
          if (res.status === 200) {
            this.workerDisabilityVisible = false
            this._indexWorkerDisability()
          }
        })
        .finally(() => {
          this.workerDisabilityDeleteLoading = false
        })
    }
  }
})
