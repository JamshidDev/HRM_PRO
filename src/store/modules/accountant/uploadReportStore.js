import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useUploadReportStore = defineStore('uploadReport', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        allPermissionList:[],
        payload:{
            file:[],
            type:null,
            year:null,
            month:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            organization_id:[],
            year:null,
            month:null,
        },
        structureCache:[],
        structuresLoading:false,
        structuresList:[],

    }),
    actions:{
        _structures(){
            this.structuresLoading= true
            $ApiService.accountantService._structure().then((res)=>{
                this.structuresList = res.data.data
            }).finally(()=>{
                this.structuresLoading= false
            })
        },
        _index(){
            this.loading= true
            const params= {
                ...this.params,
                organization_id:1,
                year:2025,
                month:5,
            }
            $ApiService.accountantService._index({params}).then((res)=>{
                console.log(res.data)
                this.list = res.data.data
                this.totalItems = res.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            const data = new FormData()
            data.append('file', this.payload.file[0].file)
            data.append('type', this.payload.type)
            data.append('year', this.payload.year)
            data.append('month', this.payload.month)
            $ApiService.accountantService._create({data}).then((res)=>{
                this.visible = false
                this._index()
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
            }
            $ApiService.countryService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.countryService._delete({id:this.elementId}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.elementId = null
            this.payload.file = []
            this.payload.type = null
            this.payload.year = null
            this.payload.month = null
        },
        onChangeStructure(v){
            this.params.organization_id = v
        },
        changePage(v){

        }

    }

})