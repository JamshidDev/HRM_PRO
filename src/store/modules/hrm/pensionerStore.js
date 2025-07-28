import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const usePensionerStore = defineStore('pensionerStore', {
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
            last_name:null,
            first_name: null,
            middle_name: null,
            sex: null,
            position: null,
            pin: null,
            address: null,
            passport: null,
            experience: null,
            year: null,
            phone: null,
            afghan: null,
            invalid: null,
            chernobyl: null,
            railway_title: null
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            organizations:[],
        },
        uuid:null,
    }),
    actions:{
        _index(){
            this.loading= true
            const params = {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.pensionerService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(data){
            this.saveLoading = true
            $ApiService.pensionerService._create({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(data){
            this.saveLoading = true
            $ApiService.pensionerService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()

            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.pensionerService._delete({id:this.elementId}).then((res)=>{
                this._index()

            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm() {
            this.elementId = null
            this.payload.last_name = null;
            this.payload.first_name = null;
            this.payload.middle_name = null;
            this.payload.sex = null;
            this.payload.position = null;
            this.payload.pin = null;
            this.payload.address = null;
            this.payload.passport = null;
            this.payload.experience = null;
            this.payload.year =null;
            this.payload.phone = null;
            this.payload.afghan = 0;
            this.payload.invalid = 0;
            this.payload.chernobyl = 0;
            this.payload.railway_title = 0;
        },

    }

})