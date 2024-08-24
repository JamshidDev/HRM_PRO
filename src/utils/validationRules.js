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
    }
}