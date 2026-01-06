import {
    CheckmarkCircle24Regular,
    ErrorCircle24Regular,
    Info24Regular,
    ShieldError24Regular,
    Warning24Regular
} from "@vicons/fluent";
import i18n from "@/i18n/index.js";

const {t} = i18n.global

export const notificationAlerts = {
    info: {
        value: "info",
        label: t("notification.status.info"),
        icon: Info24Regular,
    },
    success: {
        value: "success",
        label: t("notification.status.success"),
        icon: CheckmarkCircle24Regular,
    },
    warning: {
        value: "warning",
        label: t("notification.status.warning"),
        icon: Warning24Regular,
    },
    error: {
        value: "error",
        label: t("notification.status.error"),
        icon: ErrorCircle24Regular,
    },
    critical: {
        value: "critical",
        label: t("notification.status.critical"),
        icon: ShieldError24Regular,
    },
}