export class TopicUtils {
    static VIDEO = 1
    static IMAGE = 2
    static BOOK = 3
    static AUDIO = 4

    static getFileAccepts(v){
        if(v==this.BOOK){
            return 'application/pdf'
        }else if(v==this.AUDIO){
            return 'audio/*'
        }else if(v==this.VIDEO){
            return 'video/*'
        }else if(v==this.IMAGE){
            return 'image/*'
        }
        return
    }
}