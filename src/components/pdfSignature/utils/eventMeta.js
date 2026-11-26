import {
  Send16Regular,
  Eye16Regular,
  Checkmark16Filled,
  Dismiss16Filled,
  ArrowRepeatAll16Regular,
  Clock16Regular,
  Attach16Regular,
  Delete16Regular,
  PeopleTeam16Regular,
  DocumentDismiss16Regular,
  DocumentAdd16Regular,
  Edit16Regular,
  ArrowUndo16Regular
} from '@vicons/fluent'
import { EVENT, STATUS } from './approvalHistory.js'

// Harakat turi → ikonka, rang va i18n kaliti. Ranglar `--fig-*` tokenlaridan.
export const eventMeta = {
  // Ariza kelishuv marshruti (HR): yo'naltirdi / o'zgartirdi / qayta yubordi / rad etib yopdi.
  // Ariza holat o'tishlari (tarixda iz): yaratildi / tahrirlandi / yuborildi / qaytarildi / tasdiqlandi.
  route_created: {
    icon: DocumentAdd16Regular,
    action: 'documentPage.signature.approval.verbs.route_created',
    badge: 'documentPage.signature.approval.badges.route_created',
    text: 'text-textColor2',
    dot: 'bg-surface-ground text-textColor2'
  },
  route_edited: {
    icon: Edit16Regular,
    action: 'documentPage.signature.approval.verbs.route_edited',
    badge: 'documentPage.signature.approval.badges.route_edited',
    text: 'text-fig-chip-indigo-text',
    dot: 'bg-fig-chip-indigo text-fig-chip-indigo-text'
  },
  route_submitted: {
    icon: Send16Regular,
    action: 'documentPage.signature.approval.verbs.route_submitted',
    badge: 'documentPage.signature.approval.badges.route_submitted',
    text: 'text-fig-chip-brand-text',
    dot: 'bg-fig-chip-brand text-fig-chip-brand-text'
  },
  route_returned: {
    icon: ArrowUndo16Regular,
    action: 'documentPage.signature.approval.verbs.route_returned',
    badge: 'documentPage.signature.approval.badges.route_returned',
    text: 'text-fig-text-orange',
    dot: 'bg-fig-orange-100 text-fig-text-orange'
  },
  route_approved: {
    icon: Checkmark16Filled,
    action: 'documentPage.signature.approval.verbs.route_approved',
    badge: 'documentPage.signature.approval.badges.route_approved',
    text: 'text-fig-chip-green-text',
    dot: 'bg-fig-chip-green text-fig-chip-green-text'
  },
  route_forwarded: {
    icon: Send16Regular,
    action: 'documentPage.signature.approval.verbs.route_forwarded',
    badge: 'documentPage.signature.approval.badges.route_forwarded',
    text: 'text-fig-chip-brand-text',
    dot: 'bg-fig-chip-brand text-fig-chip-brand-text'
  },
  route_changed: {
    icon: PeopleTeam16Regular,
    action: 'documentPage.signature.approval.verbs.route_changed',
    badge: 'documentPage.signature.approval.badges.route_changed',
    text: 'text-fig-chip-indigo-text',
    dot: 'bg-fig-chip-indigo text-fig-chip-indigo-text'
  },
  route_resent: {
    icon: ArrowRepeatAll16Regular,
    action: 'documentPage.signature.approval.verbs.route_resent',
    badge: 'documentPage.signature.approval.badges.route_resent',
    text: 'text-fig-chip-brand-text',
    dot: 'bg-fig-chip-brand text-fig-chip-brand-text'
  },
  route_closed: {
    icon: DocumentDismiss16Regular,
    action: 'documentPage.signature.approval.verbs.route_closed',
    badge: 'documentPage.signature.approval.badges.route_closed',
    text: 'text-fig-text-red',
    dot: 'bg-fig-red-100 text-fig-text-red'
  },
  // Hujjat darajasidagi: fayl qo'shildi / o'chirildi (aktyor bilan).
  file_added: {
    icon: Attach16Regular,
    label: 'documentPage.signature.approval.events.file_added',
    action: 'documentPage.signature.approval.verbs.file_added',
    badge: 'documentPage.signature.approval.badges.file_added',
    text: 'text-fig-chip-brand-text',
    dot: 'bg-fig-chip-brand text-fig-chip-brand-text'
  },
  file_removed: {
    icon: Delete16Regular,
    label: 'documentPage.signature.approval.events.file_removed',
    action: 'documentPage.signature.approval.verbs.file_removed',
    badge: 'documentPage.signature.approval.badges.file_removed',
    text: 'text-fig-text-red',
    dot: 'bg-fig-red-100 text-fig-text-red'
  },
  // Ariza: xodim qoralamani yaratdi / imzolab tasdiqladi (keyin ariza HR'ga ketadi).
  created: {
    icon: DocumentAdd16Regular,
    label: 'documentPage.signature.approval.events.created',
    action: 'documentPage.signature.approval.verbs.created',
    badge: 'documentPage.signature.approval.badges.created',
    text: 'text-fig-chip-brand-text',
    dot: 'bg-fig-chip-brand text-fig-chip-brand-text'
  },
  submitted: {
    icon: Checkmark16Filled,
    label: 'documentPage.signature.approval.events.submitted',
    action: 'documentPage.signature.approval.verbs.submitted',
    badge: 'documentPage.signature.approval.badges.submitted',
    text: 'text-fig-chip-green-text',
    dot: 'bg-fig-chip-green text-fig-chip-green-text'
  },
  [EVENT.sent]: {
    icon: Send16Regular,
    label: 'documentPage.signature.approval.events.sent',
    action: 'documentPage.signature.approval.verbs.sent',
    badge: 'documentPage.signature.approval.badges.sent',
    text: 'text-fig-chip-brand-text',
    dot: 'bg-fig-chip-brand text-fig-chip-brand-text'
  },
  [EVENT.viewed]: {
    icon: Eye16Regular,
    label: 'documentPage.signature.approval.events.viewed',
    action: 'documentPage.signature.approval.verbs.viewed',
    badge: 'documentPage.signature.approval.badges.viewed',
    text: 'text-textColor3',
    dot: 'bg-fig-bg-disable text-fig-text-tertiary'
  },
  [EVENT.approved]: {
    icon: Checkmark16Filled,
    label: 'documentPage.signature.approval.events.approved',
    action: 'documentPage.signature.approval.verbs.approved',
    badge: 'documentPage.signature.approval.badges.approved',
    text: 'text-fig-chip-green-text',
    dot: 'bg-fig-chip-green text-fig-chip-green-text'
  },
  [EVENT.rejected]: {
    icon: Dismiss16Filled,
    label: 'documentPage.signature.approval.events.rejected',
    action: 'documentPage.signature.approval.verbs.rejected',
    badge: 'documentPage.signature.approval.badges.rejected',
    text: 'text-fig-text-red',
    dot: 'bg-fig-red-100 text-fig-text-red'
  },
  [EVENT.resent]: {
    icon: ArrowRepeatAll16Regular,
    label: 'documentPage.signature.approval.events.resent',
    action: 'documentPage.signature.approval.verbs.resent',
    badge: 'documentPage.signature.approval.badges.resent',
    text: 'text-fig-chip-indigo-text',
    dot: 'bg-fig-chip-indigo text-fig-chip-indigo-text'
  }
}

// Timeline tugunlari va chizig'i barcha holatlarda bir xil ko'k rangda;
// holat faqat tugun ichidagi ikonka orqali farqlanadi.
const TIMELINE_NODE = 'bg-fig-chip-brand text-fig-chip-brand-text border-fig-blue-300'
const TIMELINE_LINE = 'bg-fig-blue-300'

// Imzolovchi holati → stepper tuguni ko'rinishi.
export const signerTone = (statusId) => {
  switch (statusId) {
    case STATUS.success:
      return {
        icon: Checkmark16Filled,
        node: TIMELINE_NODE,
        line: TIMELINE_LINE,
        card: 'border-surface-line/70'
      }
    case STATUS.rejected:
      return {
        icon: Dismiss16Filled,
        node: TIMELINE_NODE,
        line: TIMELINE_LINE,
        card: 'border-fig-br-error'
      }
    case STATUS.read:
      return {
        icon: Eye16Regular,
        node: TIMELINE_NODE,
        line: TIMELINE_LINE,
        card: 'border-surface-line/70'
      }
    default:
      return {
        icon: Clock16Regular,
        node: TIMELINE_NODE,
        line: TIMELINE_LINE,
        card: 'border-surface-line/70'
      }
  }
}
