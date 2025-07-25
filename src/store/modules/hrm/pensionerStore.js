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
            sex: true,
            position: null,
            pin: null,
            address: null,
            passport: null,
            experience: null,
            year: null,
            phone: null,
            afghan: true,
            invalid: false,
            chernobyl: true,
            railway_title: false
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
            $ApiService.pensionerService._create({data}).then((res)=>{
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
            this.payload.sex = true;
            this.payload.position = null;
            this.payload.pin = null;
            this.payload.address = null;
            this.payload.passport = null;
            this.payload.experience = null;
            this.payload.year = null;
            this.payload.phone = null;
            this.payload.afghan = true;
            this.payload.invalid = false;
            this.payload.chernobyl = true;
            this.payload.railway_title = false;
        },

    }

})