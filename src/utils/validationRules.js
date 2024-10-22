import i18n from "../i18n/index.js"
const {t} = i18n.global

export default {
    login:{
        login:{
            required: true,
            message: t(`rules.login`),
            trigger: ['input', 'blur']
        },
        password:{
            required: true,
            message: t(`rules.password`),
            trigger: ['input', 'blur']
        },
    },
    register:{
        first_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: ['input', 'blur']
        },
        last_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: ['input', 'blur']
        },
        middle_name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: ['input', 'blur']
        },
        phone:{
            required: true,
            message: t(`rules.login`),
            trigger: ['input', 'blur']
        },
        pin:{
            required: true,
            message: t(`rules.password`),
            trigger: ['input', 'blur']
        },
    },
    verificationEmail:{
        verificationCode:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: ['input', 'blur']
        },
    },
    createMarket:{
        name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: ['input', 'blur']
        },
        bot_token:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: ['input', 'blur']
        },
    },
    marketSetting:{
        languages:{
            type: "array",
            required: true,
            message: t(`rules.requiredField`),
            trigger: ['input', 'blur']
        },
        contactPhone:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: ['input', 'blur']
        },
        address:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: ['input', 'blur']
        },
    },
    category:{
        name:{
            required: true,
            message: t(`rules.requiredField`),
            trigger: ['input', 'blur']
        },
        image:{
            type: "array",
            required: true,
            message: t(`rules.requiredField`),
            trigger: ['input', 'blur']
        },
    }

}