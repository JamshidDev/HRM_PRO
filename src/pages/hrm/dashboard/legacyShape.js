import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'

const { t } = i18n.global

/**
 * ESKI («Eski» bobi) dashboard ma'lumot shakli.
 *
 * 757bf8f6 («/overview endpoint ulandi») store'ni `api.{overview,movement,
 * attendance}` + getterlar arxitekturasiga o'tkazdi va eski `dashboard: {...}`
 * holatini butunlay olib tashladi. Eski kartalar esa AYNAN o'sha shaklni
 * o'qiydi, shuning uchun shakllantirish mantiqi shu yerda — 6d400d69^ dagi
 * `_responseOneAttach` / `_responseTwoAttach` / `_responseThreeAttach`
 * metodlaridan sof funksiya sifatida ko'chirildi.
 *
 * MUHIM: yangi dashboard bilan AYNAN bir xil uch javobdan quriladi
 * (`/v1/hr/dashboard`, `-two`, `-three`) — qo'shimcha so'rov yuborilmaydi.
 */
export const emptyLegacyDashboard = () => ({
  contractTypes: [],
  mainCard: [],
  ageCard: [],
  eduCard: [],
  passwordCard: null,
  pensionCard: null,
  medicalCard: null,
  contracts: [],
  birthdays: null,
  vacations: [],
  disabilityCard: null
})

export const buildLegacyDashboard = (resOne, resTwo, resThree) => {
  const d = emptyLegacyDashboard()

  if (resOne?.data?.data) {
    const res = resOne
    const formatMonth = (date) => {
      let day = date.split('-')[1]
      let month = Utils.getMonthNameByKey(date.split('-')[0])
      return `${day} - ${month}`
    }

    const v = res.data.data
    d.contractTypes = v.contract_types
    d.mainCard = [
      {
        total: {
          title: 'dashboardPage.mainCard.totalWorker',
          count: v.workers_count
        },
        data1: {
          title: 'dashboardPage.mainCard.man',
          count: v.mans_count
        },
        data2: {
          title: 'dashboardPage.mainCard.woman',
          count: v.woman_count
        }
      },
      {
        total: {
          title: 'dashboardPage.pension.title',
          count: v.retired_men_count + v.retired_women_count
        },
        data1: {
          title: 'dashboardPage.pension.men',
          count: v.retired_men_count
        },
        data2: {
          title: 'dashboardPage.pension.women',
          count: v.retired_women_count
        }
      },
      {
        total: {
          title: 'dashboardPage.position.title',
          count: v.positions_rate
        },
        data1: {
          title: 'dashboardPage.position.vakant',
          count: parseFloat(Math.max(v.positions_rate - v.worker_positions_rate, 0).toFixed(2))
        },
        data2: {
          title: 'dashboardPage.position.sverx',
          count: parseFloat(Math.max(v.worker_positions_rate - v.positions_rate, 0).toFixed(2))
        }
      },
      {
        total: {
          title: 'dashboardPage.mainCard.fxsh',
          count: v.fxsh_count
        },
        data1: {
          title: 'dashboardPage.mainCard.man',
          count: v.fxsh_mans_count
        },
        data2: {
          title: 'dashboardPage.mainCard.woman',
          count: v.fxsh_woman_count
        }
      }
    ]
    d.ageCard = [
      {
        title: 'dashboardPage.age.age31',
        count: v.age_30_and_younger
      },
      {
        title: 'dashboardPage.age.age32_45',
        count: v.age_31_to_45
      },
      {
        title: 'dashboardPage.age.age46',
        count: v.age_46_and_older
      }
    ]
    d.eduCard = [
      {
        title: 'dashboardPage.edu.higher',
        count: v.higher_edu_count
      },
      {
        title: 'dashboardPage.edu.middle',
        count: v.middle_edu_count
      },
      {
        title: 'dashboardPage.edu.special',
        count: v.special_edu_count
      }
    ]
    d.passwordCard = {
      title: 'dashboardPage.password.title',
      data: [
        {
          title: 'dashboardPage.password.deadline',
          count: v.passports_count
        },
        {
          title: 'dashboardPage.password.expired',
          count: v.passports_more_count
        }
      ]
    }
    d.pensionCard = {
      title: 'dashboardPage.pension.title',
      data: [
        {
          title: 'dashboardPage.pension.men',
          count: v.retired_men_count
        },
        {
          title: 'dashboardPage.pension.women',
          count: v.retired_women_count
        }
      ]
    }
    d.contracts = v.contracts
    d.vacations = v.vacation_types
    if (v.birthdays.result.length > 0) {
      d.birthdays = {
        title: 'dashboardPage.birthday.title',
        data: [
          {
            title: t('dashboardPage.birthday.today'),
            workers:
              v.birthdays.result[0]?.count > 3
                ? [...v.birthdays.result[0].workers, ...v.birthdays.result[0].workers]
                : v.birthdays.result[0].workers,
            total: v.birthdays.result[0].count,
            has_more: v.birthdays.result[0].has_more
          },
          {
            title: t('dashboardPage.birthday.tomorrow'),
            workers:
              v.birthdays.result[1].count > 3
                ? [...v.birthdays.result[1].workers, ...v.birthdays.result[1].workers]
                : v.birthdays.result[1].workers,
            total: v.birthdays.result[1].count,
            has_more: v.birthdays.result[1].has_more
          },
          {
            title: formatMonth(v.birthdays.result[2].day),
            workers:
              v.birthdays.result[2].count > 3
                ? [...v.birthdays.result[2].workers, ...v.birthdays.result[2].workers]
                : v.birthdays.result[2].workers,
            total: v.birthdays.result[2].count,
            has_more: v.birthdays.result[2].has_more
          },
          {
            title: formatMonth(v.birthdays.result[3].day),
            workers:
              v.birthdays.result[3].count > 3
                ? [...v.birthdays.result[3].workers, ...v.birthdays.result[3].workers]
                : v.birthdays.result[3].workers,
            total: v.birthdays.result[3].count,
            has_more: v.birthdays.result[3].has_more
          },
          {
            title: formatMonth(v.birthdays.result[4]?.day),
            workers:
              v.birthdays.result[4].count > 3
                ? [...v.birthdays.result[4].workers, ...v.birthdays.result[4].workers]
                : v.birthdays.result[4].workers,
            total: v.birthdays.result[4].count,
            has_more: v.birthdays.result[4].has_more
          }
        ]
      }
    }
  }

  if (resTwo?.data?.data) {
    const res = resTwo
    const v = res.data.data
    d.incentivesCount = v.incentives
    d.incentivesGiftCount = v.incentive_actions_gift_type
    d.disciplinaryCount = v.disciplinary_actions
    d.disciplinaryFineCount = v.disciplinary_actions_fine_type
    d.medFinishedCound = v.meds_finished
    d.medApproachCount = v.meds_approaching

    d.medicalCard = {
      title: 'dashboardPage.medical.title',
      data: [
        {
          title: 'dashboardPage.medical.deadline',
          count: v.meds_approaching || 0
        },
        {
          title: 'dashboardPage.medical.expired',
          count: v.meds_finished || 0
        }
      ]
    }
  }

  if (resThree?.data?.data) {
    const res = resThree
    const v = res.data.data
    d.disabilityCard = {
      workerDisability: v.worker_disabilities,
      relativeDisability: v.worker_relative_disabilities,
      sickLeave: v.worker_sick_leaves
    }
  }

  return d
}
