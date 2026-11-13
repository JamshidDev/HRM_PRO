// Til menyularidagi kichik chiplar: «Yangi» (yashil), «Beta» (sariq).
// LangDropdown va LangDropDownSecond (profil menyusi) ikkalasi ishlatadi.
import { h } from 'vue'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

const CHIP = 'ml-1.5 rounded-full px-1.5 text-[10px] leading-4 font-medium whitespace-nowrap'
const TONES = {
  new: { cls: 'bg-success/10 text-success', key: 'content.langUzNewBadge' },
  beta: { cls: 'bg-fig-chip-amber text-fig-chip-amber-text', key: 'content.langBeta' }
}

export const renderLangChips = (kinds) =>
  kinds.map((k) => h('span', { class: `${CHIP} ${TONES[k].cls}` }, t(TONES[k].key)))
