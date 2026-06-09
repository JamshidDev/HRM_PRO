import {
  Book24Filled,
  Image48Filled,
  MusicNote224Filled,
  VideoClip24Filled,
  Add16Filled,
  PeopleEdit20Filled,
  DocumentMultiple20Filled
} from '@vicons/fluent'
export class TopicUtils {
  static EXAM = 0
  static VIDEO = 1
  static IMAGE = 2
  static BOOK = 3
  static AUDIO = 4
  static RESOURCE = 5
  static getMediaProperty = (typeId) => {
    switch (typeId) {
      case this.EXAM:
        return { type: 'primary', icon: PeopleEdit20Filled, color: '#7c3aed' }
      case this.BOOK:
        return { type: 'info', icon: Book24Filled, color: '#2080f0', accept: '.pdf,.djvu' }
      case this.IMAGE:
        return { type: 'success', icon: Image48Filled, color: '#E1306C', accept: 'image/*' }
      case this.VIDEO:
        return { type: 'error', icon: VideoClip24Filled, color: '#FF0000', accept: 'video/*' }
      case this.AUDIO:
        return { type: 'primary', icon: MusicNote224Filled, color: '#1DB954', accept: 'audio/*' }
      case this.RESOURCE:
        return { type: 'warning', icon: DocumentMultiple20Filled, color: '#f59e0b' }
      default:
        return { type: 'default', icon: Add16Filled, color: '#8a8a8a' }
    }
  }
}
