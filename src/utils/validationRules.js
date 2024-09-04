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
        email:{
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

    }
}