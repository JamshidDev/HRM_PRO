import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useDistrictStore = defineStore('districtStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        allRegionList:[],
        allLoading:false,
        payload:{
            name:null,
            marker:{
                coords:[],
                name:null,
            },
            region_id:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },

    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.districtService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                name:this.payload.name,
                long:this.payload.marker.coords[0],
                lat:this.payload.marker.coords[1],
                region_id:this.payload.region_id,
            }
            $ApiService.districtService._create({data}).then((res)=>{
                this.visible = false
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            let data = {
                name:this.payload.name,
                long:this.payload.marker.coords[0],
                lat:this.payload.marker.coords[1],
                region_id:this.payload.region_id,
            }
            $ApiService.districtService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.districtService._delete({id:this.elementId}).then((res)=>{
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        _getRegionList(){
            this.allLoading= true
            $ApiService.regionService._index({params:{
                    page:1,
                    per_page:1000,
                }}).then((res)=>{
                this.allRegionList = res.data.data.data
            }).finally(()=>{
                this.allLoading= false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.elementId = null
            this.payload.name = null
            this.payload.region_id = null
        }

    }

})