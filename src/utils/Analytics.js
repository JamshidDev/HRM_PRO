import { useGtag } from 'vue-gtag-next'


export function useAnalytics() {
    const {event} = useGtag()

    return {
        trackUserLogin(parameters){
            event('userLogin',{
                ...parameters,
            })
        }
    }
}

