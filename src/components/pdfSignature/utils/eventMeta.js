import {
  Send16Regular,
  Eye16Regular,
  Checkmark16Filled,
  Dismiss16Filled,
  ArrowRepeatAll16Regular,
  Clock16Regular,
  Attach16Regular,
  Delete16Regular
} from '@vicons/fluent'
import { EVENT, STATUS } from './approvalHistory.js'

// Harakat turi → ikonka, rang va i18n kaliti. Ranglar `--fig-*` tokenlaridan.
export const eventMeta = {
  // Hujjat darajasidagi: fayl qo'shildi / o'chirildi (aktyor bilan).
  file_added: {
    icon: Attach16Regular,
    label: 'documentPage.signature.approval.events.file_added',
    action: 'documentPage.signature.approval.verbs.file_added',
    text: 'text-fig-chip-brand-text',
    dot: 'bg-fig-chip-brand text-fig-chip-brand-text'
  },
  file_removed: {
    icon: Delete16Regular,
    label: 'documentPage.signature.approval.events.file_removed',
    action: 'documentPage.signature.approval.verbs.file_removed',
    text: 'text-fig-text-red',
    dot: 'bg-fig-red-100 text-fig-text-red'
  },
  [EVENT.sent]: {
    icon: Send16Regular,
    label: 'documentPage.signature.approval.events.sent',
    action: 'documentPage.signature.approval.verbs.sent',
    text: 'text-fig-chip-brand-text',
    dot: 'bg-fig-chip-brand text-fig-chip-brand-text'
  },
  [EVENT.viewed]: {
    icon: Eye16Regular,
    label: 'documentPage.signature.approval.events.viewed',
    action: 'documentPage.signature.approval.verbs.viewed',
    text: 'text-textColor3',
    dot: 'bg-fig-bg-disable text-fig-text-tertiary'
  },
  [EVENT.approved]: {
    icon: Checkmark16Filled,
    label: 'documentPage.signature.approval.events.approved',
    action: 'documentPage.signature.approval.verbs.approved',
    text: 'text-fig-chip-green-text',
    dot: 'bg-fig-chip-green text-fig-chip-green-text'
  },
  [EVENT.rejected]: {
    icon: Dismiss16Filled,
    label: 'documentPage.signature.approval.events.rejected',
    action: 'documentPage.signature.approval.verbs.rejected',
    text: 'text-fig-text-red',
    dot: 'bg-fig-red-100 text-fig-text-red'
  },
  [EVENT.resent]: {
    icon: ArrowRepeatAll16Regular,
    label: 'documentPage.signature.approval.events.resent',
    action: 'documentPage.signature.approval.verbs.resent',
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
        card: 'border-surface-line'
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
        card: 'border-surface-line'
      }
    default:
      return {
        icon: Clock16Regular,
        node: TIMELINE_NODE,
        line: TIMELINE_LINE,
        card: 'border-surface-line'
      }
  }
}
