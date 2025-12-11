import { DoorArrowRight20Regular, DoorArrowLeft20Regular } from "@vicons/fluent"
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils"

const { t } = i18n.global
// Dashboard preview table configurations for different card types
export const getTableConfig = (cardType) => {
  const configs = {


    late_come: {
      responseField: 'workers',
      columns: [
        {
          headerName: 'content.worker',
          key: 'user',
          minWidth: '180px',
          component: 'UIUser'
        },
        {
          headerName: 'date.minute',
          key: 'minutes',
          width: '80px',
          minWidth: '80px',
          component: 'UIBadge',
          componentProps: {
            showIcon: false,
            type: Utils.colorTypes.error
          }
        },
        {
          headerName: 'content.time',
          key: 'time_only',
          width: '100px',
          minWidth: '80px',
          component: 'UIBadge',
          componentProps: (value) => {
            return {
              showIcon: false,
              type: Utils.colorTypes.info
            }
          },
        },
        {
          headerName: 'content.organization',
          key: 'organization_name',
          width: '300px',
          minWidth: '200px'
        },
        {
          headerName: 'content.department',
          key: 'department_name',
          width: '300px',
          minWidth: '180px'
        },

      ]
    },
    privilege_turnstile_workers: {
      responseField:'',
      columns: [
        {
          headerName: 'content.worker',
          key: 'user',
          minWidth: '180px',
          component: 'UIUser'
        },
        {
          headerName: 'date.minute',
          key: 'start_minute',
          width: '80px',
          minWidth: '80px',
          component: 'UIBadge',
          componentProps: {
            showIcon: false,
            type: Utils.colorTypes.error
          }
        },
        {
          headerName: 'date.minute',
          key: 'end_minute',
          width: '80px',
          minWidth: '80px',
          component: 'UIBadge',
          componentProps: {
            showIcon: false,
            type: Utils.colorTypes.error
          }
        },

        {
          headerName: 'content.organization',
          key: 'organization_name',
          width: '300px',
          minWidth: '200px'
        },
        {
          headerName: 'content.department',
          key: 'department_name',
          width: '300px',
          minWidth: '180px'
        },

      ]
    },
    not_passed_turnstile_workers: {
      responseField:'',
      columns: [
        {
          headerName: 'content.worker',
          key: 'user',
          minWidth: '180px',
          component: 'UIUser'
        },
        {
          headerName: 'content.organization',
          key: 'organization_name',
          width: '300px',
          minWidth: '200px'
        },
        {
          headerName: 'content.department',
          key: 'department_name',
          width: '300px',
          minWidth: '180px'
        },

      ]
    },
    vacations: {
      responseField:'',
      columns: [
        {
          headerName: 'content.worker',
          key: 'user',
          minWidth: '180px',
          component: 'UIUser'
        },
        {
          headerName: 'content.organization',
          key: 'worker_position.organization.name',
          width: '300px',
          minWidth: '200px'
        },
        {
          headerName: 'content.type',
          key: 'type.name',
          width: '300px',
          minWidth: '180px'
        },
        {
          headerName: 'content.from',
          key: 'from',
          width: '100px',
          minWidth: '180px'
        },
        {
          headerName: 'content.to',
          key: 'to',
          width: '100px',
          minWidth: '180px'
        },

      ]
    },
    casual_workers: {
      responseField:'',
      columns: [
        {
          headerName: 'content.worker',
          key: 'user',
          minWidth: '180px',
          component: 'UIUser'
        },
        {
          headerName: 'content.organization',
          key: 'organization_name',
          width: '300px',
          minWidth: '200px'
        },
        {
          headerName: 'content.department',
          key: 'department_name',
          width: '300px',
          minWidth: '180px'
        },

      ]
    },
    early_leave: {
      responseField: 'workers',
      columns: [
        {
          headerName: 'content.worker',
          key: 'user',
          minWidth: '180px',
          component: 'UIUser'
        },
        {
          headerName: 'date.minute',
          key: 'minutes',
          width: '80px',
          minWidth: '80px',
          component: 'UIBadge',
          componentProps: {
            showIcon: false,
            type: Utils.colorTypes.error
          }
        },
        {
          headerName: 'content.time',
          key: 'time_only',
          width: '100px',
          minWidth: '80px',
          component: 'UIBadge',
          componentProps: (value) => {
            return {
              showIcon: false,
              type: Utils.colorTypes.info
            }
          },
        },
        {
          headerName: 'content.date',
          key: 'time',
          width: '200px',
          minWidth: '100px'
        },
        {
          headerName: 'content.organization',
          key: 'organization_name',
          width: '300px',
          minWidth: '200px'
        },
        {
          headerName: 'content.department',
          key: 'department_name',
          width: '300px',
          minWidth: '180px'
        },

      ]
    },
    not_come: {
      responseField: 'workers',
      columns: [
        {
          headerName: 'content.worker',
          key: 'user',
          minWidth: '180px',
          component: 'UIUser'
        },
        {
          headerName: 'content.organization',
          key: 'organization_name',
          width: '300px',
          minWidth: '200px'
        },
        {
          headerName: 'content.department',
          key: 'department_name',
          width: '300px',
          minWidth: '180px'
        },

      ]
    },
    come: {
      responseField: 'workers',
      columns: [
        {
          headerName: 'content.worker',
          key: 'user',
          minWidth: '180px',
          component: 'UIUser'
        },
        {
          headerName: 'hcEvent.form.direction',
          key: 'direction',
          width: '100px',
          minWidth: '120px',
          component: 'UIBadge',
          componentProps: (value) => {
            return {
              icon: value ? DoorArrowRight20Regular : DoorArrowLeft20Regular,
              type: value ? directionStatus.enter.type : directionStatus.exist.type
            }
          },
          formatValue: (value) => {
            return value ? directionStatus.enter.name : directionStatus.exist.name
          },
        },
        {
          headerName: 'content.date',
          key: 'last_event',
          width: '160px',
          minWidth: '100px'
        },

        {
          headerName: 'content.organization',
          key: 'organization_name',
          width: '300px',
          minWidth: '200px'
        },
        {
          headerName: 'content.department',
          key: 'department_name',
          width: '300px',
          minWidth: '180px'
        },

      ]
    },
    current_in: {
      responseField: 'workers',
      columns: [
        {
          headerName: 'content.worker',
          key: 'user',
          minWidth: '180px',
          component: 'UIUser'
        },
        {
          headerName: 'hcEvent.form.direction',
          key: 'direction',
          width: '100px',
          minWidth: '120px',
          component: 'UIBadge',
          componentProps: (value) => {
            return {
              icon: value ? DoorArrowRight20Regular : DoorArrowLeft20Regular,
              type: value ? directionStatus.enter.type : directionStatus.exist.type
            }
          },
          formatValue: (value) => {
            return value ? directionStatus.enter.name : directionStatus.exist.name
          },
        },
        {
          headerName: 'content.date',
          key: 'last_event',
          width: '160px',
          minWidth: '100px'
        },

        {
          headerName: 'content.organization',
          key: 'organization_name',
          width: '300px',
          minWidth: '200px'
        },
        {
          headerName: 'content.department',
          key: 'department_name',
          width: '300px',
          minWidth: '180px'
        },

      ]
    },
    current_out: {
      responseField: 'workers',
      columns: [
        {
          headerName: 'content.worker',
          key: 'user',
          minWidth: '180px',
          component: 'UIUser'
        },
        {
          headerName: 'hcEvent.form.direction',
          key: 'direction',
          width: '100px',
          minWidth: '120px',
          component: 'UIBadge',
          componentProps: (value) => {
            return {
              icon: value ? DoorArrowRight20Regular : DoorArrowLeft20Regular,
              type: value ? directionStatus.enter.type : directionStatus.exist.type
            }
          },
          formatValue: (value) => {
            return value ? directionStatus.enter.name : directionStatus.exist.name
          },
        },
        {
          headerName: 'content.date',
          key: 'last_event',
          width: '160px',
          minWidth: '100px'
        },

        {
          headerName: 'content.organization',
          key: 'organization_name',
          width: '300px',
          minWidth: '200px'
        },
        {
          headerName: 'content.department',
          key: 'department_name',
          width: '300px',
          minWidth: '180px'
        },

      ]
    },
    late_workers: {
      responseField: 'data',
      columns: [
        {
          headerName: 'content.worker',
          key: 'user',
          minWidth: '200px',
          component: 'UIUser'
        },
        {
          headerName: 'date.hour',
          key: 'time_only',
          width: '100px',
          minWidth: '80px'
        },
        {
          headerName: 'hcEvent.form.direction',
          key: 'direction',
          width: '100px',
          minWidth: '120px',
          component: 'UIBadge',
          componentProps: (value) => {
            return {
              icon: value ? DoorArrowRight20Regular : DoorArrowLeft20Regular,
              type: value ? directionStatus.enter.type : directionStatus.exist.type
            }
          },
          formatValue: (value) => {
            return value ? directionStatus.enter.name : directionStatus.exist.name
          },
        },
        {
          headerName: 'turnStileDashboard.perview.device',
          key: 'device',
          width: '200px',
          minWidth: '180px'
        },
        {
          headerName: 'content.date',
          key: 'event_date',
          width: '120px',
          minWidth: '100px'
        },
        {
          headerName: 'turnStileDashboard.perview.auth_type',
          key: 'auth_type',
          width: '200px',
          minWidth: '180px',
          component: 'UIBadge',
          formatValue: (value) => {
            // Value ni formatlab chiqarish
            return eventStatus[value]?.name || eventStatus['default']?.name
          },
          componentProps: (value) => {
            return {
              showIcon: false,
              type: eventStatus[value]?.type || eventStatus['default']?.type,
            }
          }
        },
        {
          headerName: 'turnStileDashboard.perview.mask_status',
          key: 'mask_status',
          width: '100px',
          minWidth: '120px',
          component: 'UIBadge',
          componentProps: (value) => {
            return {
              showIcon: false,
              type: maskStatus[value]?.type || maskStatus['default']?.type
            }
          },
          formatValue: (value) => {
            return maskStatus[value]?.name || maskStatus['default']?.name
          },
        },

      ]
    },
    absent_workers: {
      responseField: 'data',
      columns: [
        {
          headerName: 'content.worker',
          key: 'user',
          minWidth: '200px',
          component: 'UIUser'
        },
        {
          headerName: 'content.organization',
          key: 'organization.name',
          width: '300px',
          minWidth: '100px'
        },
        {
          headerName: 'content.department',
          key: 'department.name',
          width: '200px',
          minWidth: '180px'
        },
        {
          headerName: 'content.position',
          key: 'position.name',
          width: '400px',
          minWidth: '200px',
        },
      ]
    },
    early_leave_workers: {
      responseField: 'data',
      columns: [
        {
          headerName: 'content.worker',
          key: 'user',
          minWidth: '200px',
          component: 'UIUser'
        },
        {
          headerName: 'hcEvent.form.direction',
          key: 'direction',
          width: '100px',
          minWidth: '120px',
          component: 'UIBadge',
          componentProps: (value) => {
            return {
              icon: value ? DoorArrowRight20Regular : DoorArrowLeft20Regular,
              type: value ? directionStatus.enter.type : directionStatus.exist.type
            }
          },
          formatValue: (value) => {
            return value ? directionStatus.enter.name : directionStatus.exist.name
          },
        },
        {
          headerName: 'date.hour',
          key: 'event_time',
          width: '100px',
          minWidth: '80px'
        },
        {
          headerName: 'content.date',
          key: 'event_date',
          width: '120px',
          minWidth: '100px'
        },
        {
          headerName: 'turnStileDashboard.perview.device',
          key: 'device',
          width: '200px',
          minWidth: '180px'
        },
        {
          headerName: 'turnStileDashboard.perview.auth_type',
          key: 'auth_type',
          width: '200px',
          minWidth: '180px',
          component: 'UIBadge',
          formatValue: (value) => {
            // Value ni formatlab chiqarish
            return eventStatus[value]?.name || eventStatus['default']?.name
          },
          componentProps: (value) => {
            return {
              showIcon: false,
              type: eventStatus[value]?.type || eventStatus['default']?.type,
            }
          }
        },
        {
          headerName: 'turnStileDashboard.perview.mask_status',
          key: 'mask_status',
          width: '100px',
          minWidth: '120px',
          component: 'UIBadge',
          componentProps: (value) => {
            return {
              showIcon: false,
              type: maskStatus[value]?.type || maskStatus['default']?.type
            }
          },
          formatValue: (value) => {
            return maskStatus[value]?.name || maskStatus['default']?.name
          },
        },
      ]
    },
    daily_attendance: {
      responseField: 'events',
      columns: [
        {
          headerName: 'content.worker',
          key: 'user',
          minWidth: '200px',
          component: 'UIUser'
        },
        {
          headerName: 'hcEvent.form.direction',
          key: 'direction',
          width: '100px',
          minWidth: '120px',
          component: 'UIBadge',
          componentProps: (value) => {
            return {
              icon: value ? DoorArrowRight20Regular : DoorArrowLeft20Regular,
              type: value ? directionStatus.enter.type : directionStatus.exist.type
            }
          },
          formatValue: (value) => {
            return value ? directionStatus.enter.name : directionStatus.exist.name
          },
        },
        {
          headerName: 'date.hour',
          key: 'event_time',
          width: '100px',
          minWidth: '80px'
        },
        {
          headerName: 'content.date',
          key: 'event_date',
          width: '120px',
          minWidth: '100px'
        },
        {
          headerName: 'turnStileDashboard.perview.device',
          key: 'device',
          width: '200px',
          minWidth: '180px'
        },
        {
          headerName: 'turnStileDashboard.perview.auth_type',
          key: 'auth_type',
          width: '200px',
          minWidth: '180px',
          component: 'UIBadge',
          formatValue: (value) => {
            // Value ni formatlab chiqarish
            return eventStatus[value]?.name || eventStatus['default']?.name
          },
          componentProps: (value) => {
            return {
              showIcon: false,
              type: eventStatus[value]?.type || eventStatus['default']?.type,
            }
          }
        },
        {
          headerName: 'turnStileDashboard.perview.mask_status',
          key: 'mask_status',
          width: '100px',
          minWidth: '120px',
          component: 'UIBadge',
          componentProps: (value) => {
            return {
              showIcon: false,
              type: maskStatus[value]?.type || maskStatus['default']?.type
            }
          },
          formatValue: (value) => {
            return maskStatus[value]?.name || maskStatus['default']?.name
          },
        },
      ]
    },
    devices: {
      responseField: 'devices',
      columns: [
        {
          headerName: 'content.name',
          key: 'area_name',
          minWidth: '200px'
        },
        {
          headerName: 'content.date',
          key: 'last_sync',
          width: '200px',
          minWidth: '120px',
          component: 'UIBadge',
          componentProps: (value) => {
            return {
              showIcon: false,
              type:Utils.colorTypes.info
            }
          },
        },
      ]
    },
    online_devices: {
      responseField: '',
      columns: [
        {
          headerName: 'content.name',
          key: 'area_name',
          minWidth: '200px'
        },
        {
          headerName: 'content.status',
          key: 'status',
          width: '200px',
          minWidth: '120px',
          component: 'UIBadge',
          componentProps: (value) => {
            return {
              showIcon: false,
              type:value===1? Utils.colorTypes.success : Utils.colorTypes.error
            }
          },
          formatValue: (value) => {
            return value===1? t('content.online') : t('content.offline')
          },
        },
      ]
    },
    offline_devices: {
      responseField: '',
      columns: [
        {
          headerName: 'content.name',
          key: 'area_name',
          minWidth: '200px'
        },
        {
          headerName: 'content.status',
          key: 'status',
          width: '200px',
          minWidth: '120px',
          component: 'UIBadge',
          componentProps: (value) => {
            return {
              showIcon: false,
              type:value===1? Utils.colorTypes.success : Utils.colorTypes.error
            }
          },
          formatValue: (value) => {
            return value===1? t('content.online') : t('content.offline')
          },
        },
      ]
    },
    lesson_worked:{
      responseField: 'workers',
      columns: [
        {
          headerName: 'content.worker',
          key: 'user',
          minWidth: '200px',
          component: 'UIUser'
        },
        {
          headerName: 'date.hour',
          key: 'hours',
          width: '100px',
          minWidth: '80px',
          component: 'UIBadge',
          componentProps: {
            showIcon: false,
            type: Utils.colorTypes.info
          },
        },
        {
          headerName: 'date.minute',
          key: 'total_minutes',
          width: '200px',
          minWidth: '120px',
          component: 'UIBadge',
          componentProps: {
            showIcon: false,
            type: Utils.colorTypes.secondary
          },
        },
        {
          headerName: 'content.organization',
          key: 'organization_name',
          width: '300px',
          minWidth: '200px'
        },
        {
          headerName: 'content.department',
          key: 'department_name',
          width: '300px',
          minWidth: '180px'
        },
        
       

      ]
    },
  }

  return configs[cardType]
}

const maskStatus = {
  1: {
    name: t("hcEvent.form.withMask"),
    type: "Success"
  },
  default: {
    name: t("hcEvent.form.withMask"),
    type: "Success"
  },
  2: {
    name: t("hcEvent.form.NoMask"),
    type: "Secondary"
  },
  3: {
    name: t("hcEvent.form.NoMask"),
    type: "Secondary"
  },
}

const eventStatus = {
  'default': {
    name: t("hcEvent.form.face"),
    type: "Success"
  },
  'ACSEventFaceVerifyPass': {
    name: t("hcEvent.form.face"),
    type: "Secondary"
  },
  'ACSEventCardFingerThrough': {
    name: t("hcEvent.form.finger"),
    type: "Success"
  },
  'ACSEventFingerThrough': {
    name: t("hcEvent.form.finger"),
    type: "Success"
  },
  'ACSEventHumanDetectFail': {
    name: t("hcEvent.form.face"),
    type: "Success"
  },
  'ACSEventLegalCardThrough': {
    name: t("hcEvent.form.card"),
    type: "Success"
  },
}

const directionStatus = {
  enter: {
    name: t("turnstile.workDurationPage.enter"),
    type: "Success"
  },
  exist: {
    name: t("turnstile.workDurationPage.exit"),
    type: "Error"
  },
}

