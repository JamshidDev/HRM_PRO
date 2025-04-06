import {Book24Filled, Image48Filled, MusicNote224Filled, VideoClip24Filled, Add16Filled,PeopleEdit20Filled, DocumentMultiple20Filled} from '@vicons/fluent'
export class TopicUtils {
    static  EXAM = 0
    static VIDEO = 1
    static IMAGE = 2
    static BOOK = 3
    static AUDIO = 4
    static RESOURCE = 5
    static getMediaProperty = (typeId) => {
        switch (typeId) {
            case this.EXAM:
                return {type: "default", icon: PeopleEdit20Filled, color: "#8a8a8a"};
            case this.BOOK:
                return {type: "info", icon: Book24Filled, color: "#2080f0"};
            case this.IMAGE:
                return {type: "success", icon: Image48Filled, color: "#1f2220"};
            case this.VIDEO:
                return {type: "error", icon: VideoClip24Filled, color: "#d03050"};
            case this.AUDIO:
                return {type: "primary", icon: MusicNote224Filled, color: "#18a058"};
            case this.RESOURCE:
                return {type: "info", icon: DocumentMultiple20Filled, color: "#2080f0"};
            default:
                return {type: "default", icon: Add16Filled, color: "#8a8a8a"}; // Default icon for unknown types
        }
    };
}