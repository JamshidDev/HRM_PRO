import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useServiceOrgStore = defineStore('serviceOrgStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        elementId:null,
        payload:{
            organizations:[],
            signatureVal:false,
            smsVal:false,

        },
        params:{
            organization_id:null,
        },
        checkedVal:[],

    }),
    actions:{
        _index(){
            this.loading= true
            this.params.organization_id = this.elementId
            $ApiService.serviceOrgService._index({params:this.params}).then((res)=>{
                console.log(res.data.data)
                if(res.data.data.length>0){
                    res.data.data.forEach((v)=>{
                        if(v.key === "e-signature"){
                            this.payload.signatureVal = v.active
                        }else if(v.key === "sms-service"){
                            this.payload.smsVal = v.active
                        }
                    })
                }
            }).finally(()=>{
                this.loading= false
            })
        },
        _update(v){
            this.saveLoading = true
            let data = {
                organization_id:this.elementId,
                ...v
            }
            $ApiService.serviceOrgService._create({data}).then((res)=>{
                this.visible = false
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })
        },

    }

})