import i18n from "@/i18n/index.js"
import {useAppSetting} from "@/utils/AppSetting.js"
const {t} = i18n.global
const triggerEvents =  ['input', 'blur-sm']

const lang = localStorage.getItem(useAppSetting.languageKey) || useAppSetting.defaultLanguage
i18n.global.locale = lang

export default {
    common: {
        requiredStringField: {
            required: true,
            message: t(`rules.requiredField`),
            trigger: [...triggerEvents, 'change']
        },
        requiredDateTimeField: {
            type: 'number',
            required: true,
            trigger: [...triggerEvents, 'change'],
            message: t(`rules.requiredField`)
        },
        requiredNumberField: {
            type: 'number',
            required: true,
            trigger: [...triggerEvents, 'change'],
            message: t(`rules.requiredField`)
        },
        requiredMultiSelectField: {
            type: 'array',
            required: true,
            trigger: [...triggerEvents, 'change'],
            message: t(`rules.requiredField`)
        },
        requiredPhotoField: {
            type: 'array',
            required: true,
            trigger: [...triggerEvents, 'change'],
            message: t(`rules.requiredImageField`)
        },
        requiredPhonesField:[
            {
                validator: (rule, value) => {
                    if (!value || value[0].phone.length <16) {
                        return new Error( t(`rules.requiredField`));
                    }
                    return true;
                },
                trigger: [...triggerEvents, 'change'],
            },
        ],
        requiredPinField:[
            {
                required: true,
                message: t(`rules.requiredJSHSHIR`),
                trigger: [...triggerEvents, 'change'],
            },
            {
                min:17,
                message: t(`rules.requiredMinLength`, {n:14}),
                trigger: [...triggerEvents, 'change'],
            },
        ],
    },
    rulesNames:{
        requiredStringField:'requiredStringField',
        requiredDateTimeField:'requiredDateTimeField',
        requiredNumberField:'requiredNumberField',
        requiredMultiSelectField:'requiredMultiSelectField',
        requiredPhonesField:'requiredPhonesField',
        requiredPhotoField:'requiredPhotoField',
        requiredPinField:'requiredPinField'
    },
    login:{
        phone:[
            {
                required: true,
                message: t(`rules.phone`),
                trigger: triggerEvents
            },
            {
                min:15,
                message: t(`rules.requiredMinLength`, {n:15}),
                trigger: triggerEvents
            },
            {
                max:15,
                message: t(`rules.requiredMaxLength`, {n:15}),
                trigger: triggerEvents
            },
        ],
        password:[
            {
                required: true,
                message: t(`rules.password`),
                trigger: triggerEvents
            },
            {
                min:8,
                message: t(`rules.requiredMinLength`, {n:8}),
                trigger: triggerEvents
            },
            {
                max:16,
                message: t(`rules.requiredMaxLength`, {n:16}),
                trigger: triggerEvents
            },
        ],
    },
    register:{
        first_name:[
            {
                required: true,
                message: t(`rules.requiredField`),
                trigger: triggerEvents
            },
            {
                min:3,
                message: t(`rules.requiredMinLength`, {n:3}),
                trigger: triggerEvents
            },
            {
                max:20,
                message: t(`rules.requiredMaxLength`, {n:20}),
                trigger: triggerEvents
            },
        ],
        last_name:[
            {
                required: true,
                message: t(`rules.requiredField`),
                trigger: triggerEvents
            },
            {
                min:3,
                message: t(`rules.requiredMinLength`, {n:3}),
                trigger: triggerEvents
            },
            {
                max:20,
                message: t(`rules.requiredMaxLength`, {n:20}),
                trigger: triggerEvents
            },
        ],
        middle_name:[
            {
                required: true,
                message: t(`rules.requiredField`),
                trigger: triggerEvents
            },
            {
                min:3,
                message: t(`rules.requiredMinLength`, {n:3}),
                trigger: triggerEvents
            },
            {
                max:20,
                message: t(`rules.requiredMaxLength`, {n:20}),
                trigger: triggerEvents
            },
        ],
        phone:[
            {
                required: true,
                message: t(`rules.phone`),
                trigger: triggerEvents
            },
            {
                min:15,
                message: t(`rules.requiredMinLength`, {n:15}),
                trigger: triggerEvents
            },
            {
                max:15,
                message: t(`rules.requiredMaxLength`, {n:15}),
                trigger: triggerEvents
            },
        ],
        pin:[
            {
                required: true,
                message: t(`rules.requiredJSHSHIR`),
                trigger: triggerEvents
            },
            {
                min:17,
                message: t(`rules.requiredMinLength`, {n:14}),
                trigger: triggerEvents
            },
        ],
        password:[
            {
                required: true,
                message: t(`rules.password`),
                trigger: triggerEvents
            },
            {
                min:8,
                message: t(`rules.requiredMinLength`, {n:8}),
                trigger: triggerEvents
            },
            {
                max:16,
                message: t(`rules.requiredMaxLength`, {n:16}),
                trigger: triggerEvents
            },
        ],
    },
    verificationEmail:{
        otp:[
            {
                required: true,
                message: t(`rules.phone`),
                trigger: triggerEvents
            },
            {
                min:6,
                message: t(`rules.requiredMinLength`, {n:6}),
                trigger: triggerEvents
            },
            {
                max:6,
                message: t(`rules.requiredMaxLength`, {n:6}),
                trigger: triggerEvents
            },
        ],
        password:[
            {
                required: true,
                message: t(`rules.password`),
                trigger: triggerEvents
            },
            {
                min:8,
                message: t(`rules.requiredMinLength`, {n:8}),
                trigger: triggerEvents
            },
            {
                max:16,
                message: t(`rules.requiredMaxLength`, {n:16}),
                trigger: triggerEvents
            },
        ],
    },
    userPermission:{
        name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    languageAdminPage:{
        name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        name_ru:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        name_en:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    universityAdmin:{
        name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        name_ru:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        region_id:{
            type: 'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        city_id:{
            type: 'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        type:{
            type: 'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        education:{
            type: 'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    specialityAdmin:{
        name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        name_ru:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    confirmation:{
        pin:{
            required: true,
            message: t(`rules.requiredWorker`),
            trigger: triggerEvents
        },
        position:{

            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        }
    },
    userRole:{
        name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        permissions:{
            type:"array",
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    userForm:{
        role_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        organization_id:{
            type:"array",
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    regionPage:{
        name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        country_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    districtPage:{
        name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        region_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    profilePage:{
        first_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        last_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        middle_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        password:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    positionPage:{
        name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        name_ru:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        classification_index:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        classification_code:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    organizationPage:{
        name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        full_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        level:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        city_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        }
    },
    departmentPage:{
        name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        level:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        }
    },
    departmentPositionPage:{
        position_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        department_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        group:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        rank:{
            type:'string',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        rate:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        salary:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        experience:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        education:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    relativePage:{
        last_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        first_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        birthday:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        relative:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    relativePageV2:{
        relative:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        pin:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    personalForm:{
        last_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        work_experience:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        first_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        middle_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        country_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        region_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        city_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        current_region_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        current_city_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        birthday:{
            validator: (rule, value) => {
                const isValidDate = (text) => {
                    const date = new Date(text);
                    return date instanceof Date && !isNaN(date.getTime());
                };
                if(value === null){
                    return new Error( t(`rules.requiredField`));
                }else if (!isValidDate(value)) {
                    return new Error( t(`rules.unExpectedFormat`));
                }
                return true
            },
            trigger: triggerEvents,
        },
        address:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        nationality_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        sex:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        pin:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        inn:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        passport_address:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        serial_number:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        from_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        to_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        marital_status:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        phones:[
            {
                validator: (rule, value) => {
                    if (!value || value[0].phone.length <16) {
                        return new Error( t(`rules.requiredField`));
                    }
                    return true;
                },
                trigger: 'blur-sm',
            },
        ],
    },
    workerProfileForm:{
        last_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        first_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        middle_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        country_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        region_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        city_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        current_region_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        current_city_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        birthday: {
            validator: (rule, value) => {
                const isValidDate = (text) => {
                    const date = new Date(text);
                    return date instanceof Date && !isNaN(date.getTime());
                };
                if(value === null){
                    return new Error( t(`rules.requiredField`));
                }else if (!isValidDate(value)) {
                    return new Error( t(`rules.unExpectedFormat`));
                }
                return true
            },
            trigger: triggerEvents,
        },
        address:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        nationality_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        sex:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        education:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        pin:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        inn:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        passport_address:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        marital_status:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    schedulePage:{
        name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        name_ru:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        type:{
            type: 'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    holidayPage:{
        name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        type:{
            type: 'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        holiday_date:{
            type: 'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    workdayPage:{
        schedule_id:{
            type: 'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        type:{
            type: 'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        end_time:{
            type: 'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        start_time:{
            type: 'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        day_of_week:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    contractFrom: {
        pin:{
            required: true,
            message: t(`rules.requiredWorker`),
            trigger: triggerEvents
        },
        number:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        contract_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        type:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        department_id:{
            type:'array',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        command_type:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        position_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        department_position_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        rate:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        post_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        salary:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        director_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        organization_id:{
            type:'array',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        schedule_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        position_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        command_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        command_number:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    adContractFrom: {
        number:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        contract_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        type:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        department_id:{
            type:'array',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        command_type:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        department_position_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        contract_to_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        post_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        salary:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        director_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        schedule_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        command_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        position_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        command_number:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        rate:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    commandFrom: {
        command_number:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        command_type:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        director_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        command_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },

        workers:{
            type:'array',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        worker:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        organization_id:{
            type:'array',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        confirmations:{
            type:'array',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        }
    },
    form_32:{
        contract_to_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    form_44:{
        new_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        rest_day:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        reason:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    form_43:{
        new_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        work_day:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        reason:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    form_45:{
        from:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        to:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        work_day:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    form_48:{
        from:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        to:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        work_day:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        all_day:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        reason:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    form_49:{
        from:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        to:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        work_day:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        reason:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    languagePage:{
        language_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    universityPage:{
        university_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        speciality_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        to_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    topicPage:{
        name:{
            required: true,
            message: t(`rules.requiredWorker`),
            trigger: triggerEvents
        },
        type:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        organizations:{
            type:'array',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    topicFilePage: {
        type: {
            type: 'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        filesField: {
            type: 'array',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    oldCareerPage:{
        from_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        to_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        post_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    partyPage:{
        from_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        to_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        party:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    militaryPage:{
        status:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    academicTitlePage:{
        type:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    applicationPage:{
        director_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        type:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        rate:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        from:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        to:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        period_from:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        period_to:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        application_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        worker_position_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        education_type:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        univer_number:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        contract_to_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        univer_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        department_position_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        from_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        reason:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    applicationForm:{
        last_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        first_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        middle_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        country_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        region_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        city_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        current_region_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        current_city_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        birthday:{
            validator: (rule, value) => {
                const isValidDate = (text) => {
                    const date = new Date(text);
                    return date instanceof Date && !isNaN(date.getTime());
                };
                if(value === null){
                    return new Error( t(`rules.requiredField`));
                }else if (!isValidDate(value)) {
                    return new Error( t(`rules.unExpectedFormat`));
                }
                return true
            },
            trigger: triggerEvents,
        },
        address:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        nationality_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        pin:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        inn:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        marital_status:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        phones:[
            {
                validator: (rule, value) => {
                    if (!value || value[0].phone.length <16) {
                        return new Error( t(`rules.requiredField`));
                    }
                    return true;
                },
                trigger: 'blur-sm',
            },
        ],
    },
    medFrom:{
        organization_id:{
            type:'array',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        worker_id:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        from:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        to:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        status:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        pin:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        }
    },
    documentArchive:{
        visibility_type:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        title:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        fakeFile:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        document_date:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        type:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        }
    },
    vacationSchedule:{
        worker:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        organization_id:{
            type:'array',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        month:{
            type:'number',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        }
    },
    roleForm:{
        organization_id:{
            type:'array',
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        role:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        }
    },
}

