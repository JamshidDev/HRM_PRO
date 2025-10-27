import {defineStore} from "pinia";

export const useUserImageLogsStore = defineStore('userImageLogsStore', {
    state: () => ({
        list: [],
        loading: false,
        totalItems: 0,
        structureCheck2: [],
        params: {
            page: 1,
            per_page: 10,
            search: null,
            organizations: [],
        },
    }),
    actions: {
        _params(){
            return {
                ...this.params,
                organizations: this.params.organizations.map(v=>v.id).toString() || undefined,
            }
        },
        _index() {
            this.loading = true
            const params = {
                ...this._params(),
            }
            $ApiService.userImageLogsService._index({params}).then((res) => {
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(() => {
                this.loading = false
            })
        },
    }
})
