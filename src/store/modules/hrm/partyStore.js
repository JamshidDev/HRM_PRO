import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const usePartyStore = defineStore('partyStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        payload:{
            uuid:null,
            party:null,
            from_date:null,
            to_date:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        uuid:null,
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.partyService._index({params:{uuid:this.uuid}}).then((res)=>{
                this.list = res.data.data
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            const data = {
                ...this.payload,
                uuid:this.uuid,
                from_date:this.payload.from_date? Utils.timeToZone(this.payload.from_date) : null,
                to_date:this.payload.to_date? Utils.timeToZone(this.payload.to_date) : null,
            }
            $ApiService.partyService._create({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            const data = {
                ...this.payload,
                uuid:this.uuid,
                from_date:this.payload.from_date? Utils.timeToZone(this.payload.from_date) : null,
                to_date:this.payload.to_date? Utils.timeToZone(this.payload.to_date) : null,
            }
            $ApiService.partyService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.partyService._delete({id:this.elementId}).then((res)=>{
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm() {
            this.elementId = null
            this.payload.uuid = null
            this.payload.party = null
            this.payload.from_date = null
            this.payload.to_date = null
        },

    }

})