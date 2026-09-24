import {
  Send16Regular,
  Eye16Regular,
  Checkmark16Filled,
  Dismiss16Filled,
  ArrowRepeatAll16Regular,
  Clock16Regular
} from '@vicons/fluent'
import { EVENT, STATUS } from './approvalHistory.js'

// Harakat turi → ikonka, rang va i18n kaliti. Ranglar `--fig-*` tokenlaridan.
export const eventMeta = {
  [EVENT.sent]: {
    icon: Send16Regular,
    label: 'documentPage.signature.approval.events.sent',
    dot: 'bg-fig-chip-brand text-fig-chip-brand-text'
  },
  [EVENT.viewed]: {
    icon: Eye16Regular,
    label: 'documentPage.signature.approval.events.viewed',
    dot: 'bg-fig-bg-disable text-fig-text-tertiary'
  },
  [EVENT.approved]: {
    icon: Checkmark16Filled,
    label: 'documentPage.signature.approval.events.approved',
    dot: 'bg-fig-chip-green text-fig-chip-green-text'
  },
  [EVENT.rejected]: {
    icon: Dismiss16Filled,
    label: 'documentPage.signature.approval.events.rejected',
    dot: 'bg-fig-red-100 text-fig-text-red'
  },
  [EVENT.resent]: {
    icon: ArrowRepeatAll16Regular,
    label: 'documentPage.signature.approval.events.resent',
    dot: 'bg-fig-chip-indigo text-fig-chip-indigo-text'
  }
}

// Imzolovchi holati → stepper tuguni ko'rinishi.
export const signerTone = (statusId) => {
  switch (statusId) {
    case STATUS.success:
      return {
        icon: Checkmark16Filled,
        node: 'bg-fig-success text-white border-transparent',
        line: 'bg-fig-success',
        card: 'border-surface-line'
      }
    case STATUS.rejected:
      return {
        icon: Dismiss16Filled,
        node: 'bg-fig-red text-white border-transparent',
        line: 'bg-surface-line',
        card: 'border-fig-br-error'
      }
    case STATUS.read:
      return {
        icon: Eye16Regular,
        node: 'bg-fig-chip-brand text-fig-chip-brand-text border-fig-blue-300',
        line: 'bg-surface-line',
        card: 'border-surface-line'
      }
    default:
      return {
        icon: Clock16Regular,
        node: 'bg-fig-chip-amber text-fig-chip-amber-text border-fig-orange-300',
        line: 'bg-surface-line',
        card: 'border-surface-line'
      }
  }
}
