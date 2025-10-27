import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"

const {t} = i18n.global
export const useDevicesStore = defineStore('devicesStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        downloading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        payload:{
            name: null,
            ip_address: null,
            mac_address: null,
            serial_number: null,
            status: true,
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
            $ApiService.devicesService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            $ApiService.devicesService._create({data:this.payload}).then(()=>{
                this.visible = false
                this._index()
                this.resetForm()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _update(){
            this.saveLoading = true
            $ApiService.devicesService._update({id:this.elementId, data:this.payload}).then(()=>{
                this.visible = false
                this._index()
                this.resetForm()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.devicesService._delete({id:this.elementId}).then(()=>{
                this._index()
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        resetForm(){
            this.payload = {
                name: null,
                ip_address: null,
                mac_address: null,
                serial_number: null,
                status: true,
            }
            this.elementId = null
            this.visible = false
            this.visibleType = true
        },
        _refreshDevice(){
            this.loading = true
            $ApiService.turnstileHikCentralAccessService._refreshDevices().then((res) => {
                this._index()
            }).finally(() => {
                this.loading = false
            })
        },
        _show(){
            this.loading = true
            $ApiService.devicesService._show({id:this.elementId}).then((res)=>{
                this.payload = res.data.data
            }).finally(()=>{
                this.loading = false
            })
        },
        _downloadDevices(){
            this.downloading = true
            $ApiService.turnstileHikCentralAccessService._downloadDevices({params:{download:true}}).then((res) => {
                Utils.blobFileDownload(res.data,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'download.xlsx' )
            }).finally(() => {
                this.downloading = false
            })
        },
    }
})
