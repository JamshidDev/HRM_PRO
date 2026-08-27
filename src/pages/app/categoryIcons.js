/**
 * "Ko'p beriladigan savollar" (CommonQuestions.vue) va "Kim bilan bog'lanish"
 * modali (ResponsibleModal.vue) bir xil bo'lim ro'yxatidan foydalanadi —
 * ikonkalar shu yerda bir marta bog'lanadi, ikkala joyda ham mos kelsin.
 */
import QuestionIcon from '@/assets/icons/contact/question.svg'
import LockIcon from '@/assets/icons/lock.svg'
import UsersIcon from '@/assets/icons/contact/users.svg'
import WalletIcon from '@/assets/icons/contact/wallet-alt.svg'
import PlaneIcon from '@/assets/icons/contact/Plane-departure.svg'
import ScanIcon from '@/assets/icons/contact/scan.svg'

export const CATEGORY_IDS = ['staff', 'salary', 'vacation', 'turnstile', 'technical']

// `staff`/`salary` ikonalari sidebar'dagi "Kadrlar boshqaruvi" (HrManagement.svg)
// va "Iqtisodchi" (Economist.svg) belgilarining nusxasi — asl fayllar boshqa
// joyda ishlatilgani uchun ularga tegmasdan, shu yerda alohida nusxa saqlanadi.
export const CATEGORY_ICONS = {
  staff: UsersIcon,
  salary: WalletIcon,
  vacation: PlaneIcon,
  turnstile: ScanIcon,
  technical: LockIcon
}

export { QuestionIcon }
