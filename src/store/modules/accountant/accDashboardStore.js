import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'

/**
 * `statement` blokidagi "Jami ish haqi" (`total_four`). Ba'zi davrlarda backend
 * bu qatorni yubormaydi — u holda birinchi uchta to'lov turi yig'indisi olinadi
 * (maketdagi donut markazidagi jami ham aynan shu qiymat).
 */
const FUND_PARTS = ['total_one', 'total_two', 'total_three']

/** `last_month` bloklaridagi `[{key, value}]` dan `total_four` qiymatini oladi. */
const fundValue = (rows) => {
  const total = (rows || []).find((v) => v.key === 'total_four')
  if (total) return Number(total.value || 0)
  return (rows || [])
    .filter((v) => FUND_PARTS.includes(v.key))
    .reduce((acc, v) => acc + Number(v.value || 0), 0)
}

/** Oylik qatordagi (`{label, amount}`) bir yozuv uchun ish haqi fondi jami. */
const fundAmount = (amount) => {
  const total = Number(amount?.total_four || 0)
  if (total) return total
  return FUND_PARTS.reduce((acc, key) => acc + Number(amount?.[key] || 0), 0)
}

/** Oylik qatordan bitta ko'rsatkich seriyasini (kalitlar yig'indisi) yig'adi. */
const seriesOf = (rows, key) =>
  (rows || []).map((row) => (key ? Number(row?.amount?.[key] || 0) : 0))

/** Ikkita seriyani element-ma-element qo'shadi (uzunligi farq qilsa 0 bilan to'ldiradi). */
const sumSeries = (a, b) => {
  const length = Math.max(a.length, b.length)
  return Array.from({ length }, (_, i) => Number(a[i] || 0) + Number(b[i] || 0))
}

/**
 * Filtrdagi oy 12 oylik qatorda qaysi indeksga tushishini aniqlaydi.
 * Qator to'liq bo'lmasa oxirgi yozuvga tushamiz.
 */
const rowIndex = (rows, monthIndex) => {
  if (!rows?.length) return -1
  return monthIndex >= 0 && monthIndex < rows.length ? monthIndex : rows.length - 1
}

/** Tanlangan oyni bir oldingi oy bilan solishtiradi. */
const deltaOf = (series, monthIndex) => {
  const i = rowIndex(series, monthIndex)
  if (i < 1) return null
  return Utils.compareDelta(series[i], series[i - 1])
}

/** Seriyadan tanlangan oydagi qiymatni oladi. */
const valueAt = (series, monthIndex) => {
  const i = rowIndex(series, monthIndex)
  return i < 0 ? 0 : Number(series[i] || 0)
}

export const useAccDashboardStore = defineStore('accDashboardStore', {
  state: () => ({
    list: [],
    loading: false,
    showLoading: false,
    downloadLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    allPermissionList: [],
    payload: {},
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      year: null,
      month: null
    },
    structureCheck2: [],
    dashboardData: null,
    dashboardLoading: false
  }),

  getters: {
    /** Filtrdagi oyning 0 dan boshlanuvchi indeksi (`-1` — oy tanlanmagan). */
    monthIndex(state) {
      const month = Number(state.params.month)
      return month >= 1 && month <= 12 ? month - 1 : -1
    },

    /** INPS oylik qatori — backend nomlanishi bir xil emas, ikkalasini ham qaraymiz. */
    pensionRows(state) {
      return state.dashboardData?.pension_payment || state.dashboardData?.pension_payments || []
    },

    /** Maketdagi "Moliyaviy dinamika" grafigining oy nomlari. */
    trendMonths(state) {
      return (state.dashboardData?.statements || []).map((v) => v.label)
    },

    /**
     * Har bir KPI ko'rsatkichining oylik seriyasi. Kalitlar `last_month`
     * bloklaridan olinadi — shu sababli grafik, kartadagi raqam va o'zgarish
     * foizi bir xil ko'rsatkichni tasvirlaydi.
     */
    metricSeries(state) {
      const data = state.dashboardData
      if (!data?.last_month) return { fund: [], tax_four: [], tax_five: [], pension: [] }

      return {
        fund: (data.statements || []).map((row) => fundAmount(row.amount)),
        tax_four: seriesOf(data.tax_four, data.last_month.tax_four?.[0]?.key),
        tax_five: seriesOf(data.tax_five, data.last_month.tax_five?.[0]?.key),
        pension: seriesOf(this.pensionRows, data.last_month.pension_payment?.[0]?.key)
      }
    },

    /** Maketdagi grafikning uchta chizig'i: fond, JSHDS soliqlari va INPS. */
    trendSeries(state) {
      if (!state.dashboardData?.last_month) return []
      const series = this.metricSeries

      return [
        { key: 'fund', color: '--fig-icon-green', data: series.fund },
        {
          key: 'taxes',
          color: '--fig-icon-indigo',
          data: sumSeries(series.tax_four, series.tax_five)
        },
        { key: 'inps', color: '--fig-icon-amber', data: series.pension }
      ]
    },

    /** Grafik ustidagi legenda: har bir seriya uchun tanlangan oydagi qiymat. */
    trendTotals() {
      return this.trendSeries.map((item) => ({
        ...item,
        value: valueAt(item.data, this.monthIndex)
      }))
    },

    /**
     * Maketdagi to'rtta KPI karta. Asosiy raqam — blokning birinchi ko'rsatkichi,
     * pastdagi qator — ikkinchisi; ish haqi fondi uchun esa jami va "fondga
     * kirmaydigan" qiymat.
     */
    kpiCards(state) {
      const last = state.dashboardData?.last_month
      if (!last) return []

      const series = this.metricSeries

      const simple = (variant, rows) => {
        const main = rows?.[0]
        if (!main) return null
        const extra = rows?.[1]
        return {
          variant,
          titleKey: `accDashboard.card.${variant}`,
          value: Number(main.value || 0),
          extraKey: extra?.key || null,
          extraValue: extra ? Number(extra.value || 0) : null,
          delta: deltaOf(series[variant], this.monthIndex)
        }
      }

      const fundExtra = (last.statement || []).find((v) => v.key === 'total_three')

      return [
        {
          variant: 'salary_fund',
          titleKey: 'accDashboard.card.salary_fund',
          value: fundValue(last.statement),
          extraKey: fundExtra?.key || null,
          extraValue: fundExtra ? Number(fundExtra.value || 0) : null,
          delta: deltaOf(series.fund, this.monthIndex)
        },
        simple('tax_four', last.tax_four),
        simple('tax_five', last.tax_five),
        simple('pension', last.pension_payment)
      ].filter(Boolean)
    },

    /** "Fond tarkibi" donuti — statement blokining dastlabki uchta to'lov turi. */
    fundParts(state) {
      const rows = (state.dashboardData?.last_month?.statement || []).filter((v) =>
        FUND_PARTS.includes(v.key)
      )
      const total = rows.reduce((acc, v) => acc + Number(v.value || 0), 0)
      return {
        total,
        items: rows.map((v) => ({
          key: v.key,
          value: Number(v.value || 0),
          percent: total ? (Number(v.value || 0) / total) * 100 : 0
        }))
      }
    },

    /**
     * "E'tibor markazi" — ogohlantirishlar API'dan kelmaydi, shuning uchun ular
     * oydan-oyga o'zgarish va hisobot yig'indisi mosligidan hosil qilinadi.
     */
    alerts(state) {
      const list = []

      this.kpiCards.forEach((card) => {
        const percent = card.delta?.percent
        if (percent === null || percent === undefined) return
        if (percent <= -15) {
          list.push({ type: 'danger', messageKey: 'accDashboard.alert.sharpDrop', card })
        } else if (percent <= -3) {
          list.push({ type: 'warning', messageKey: 'accDashboard.alert.decline', card })
        } else if (percent >= 5) {
          list.push({ type: 'success', messageKey: 'accDashboard.alert.growth', card })
        }
      })

      // Ish haqi fondi jamisi to'lov turlari yig'indisiga teng bo'lmasa — hisobotda xatolik.
      const statement = state.dashboardData?.last_month?.statement
      if (statement?.length) {
        const total = fundValue(statement)
        const parts = this.fundParts.total
        if (total && parts && Math.round(total) !== Math.round(parts)) {
          list.push({ type: 'mismatch', messageKey: 'accDashboard.alert.mismatch', card: null })
        }
      }

      return list
    }
  },

  actions: {
    _index() {
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      this.loading = true
      $ApiService.accDashboardService
        ._dashboard({ params })
        .then((res) => {
          this.dashboardData = res.data.data
        })
        .finally(() => {
          this.loading = false
        })
    },

    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      this.elementId = null
      this.payload.name = null
    }
  }
})
