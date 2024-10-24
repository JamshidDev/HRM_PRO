import i18n from "../i18n/index.js"
const {t} = i18n.global
const triggerEvents =  ['input', 'blur']


export default {
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
    createMarket:{
        name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        bot_token:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    marketSetting:{
        languages:{
            type: "array",
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        contactPhone:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        address:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    },
    category:{
        name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
        image:{
            type: "array",
            required: true,
            message: t(`rules.requiredField`),
            trigger: triggerEvents
        },
    }

}