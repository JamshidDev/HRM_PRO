import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"

const {t} = i18n.global
export const useSpecializationStore = defineStore('specializationStore', {
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
        structureCheck:[],
        directionListParams:{
            page:1,
            per_page:10,
            search:null,
        },
        directionList: [],
        directionListLoading: false,
        directionListTotal: 0,
        payload:{
            name: null,
            name_ru: null,
            name_en: null,
            direction_id: null,
            positions: []
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
            $ApiService.specializationService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                ...this.payload,
            }
            $ApiService.specializationService._create({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _update(){
            this.saveLoading = true
            let data = {
                ...this.payload,
            }
            $ApiService.specializationService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.specializationService._delete({id:this.elementId}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        _directionList(infinite){
            this.directionListLoading = true
            const params = {...this.directionListParams}
            $ApiService.directionService._index({params}).then((res)=>{
                const newData = res.data.data.data
                const oldData = this.directionList
                const data = infinite ? [...oldData, ...newData] : [...newData]
                if(this.payload.direction_id){
                    if(!data.find(i=>i.id===this.payload.direction_id)){
                        data.push(oldData.find(i=>i.id===this.payload.direction_id))
                    }
                }
                this.directionList = data
                this.directionListTotal = res.data.data.total
            }).finally(()=>{
                this.directionListLoading= false
            })
        },
        onSearchDirectionList(v){
            this.directionListParams.page =1
            this.directionListParams.search =v
            Utils.debouncedFn(this._directionList)
        },
        onScrollDirectionList(e){
            const currentTarget = e.currentTarget;
            if(currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight && !this.directionListLoading && this.directionListTotal>this.directionList.length){
                this.directionListParams.page += 1
                this._directionList(true)
            }
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.payload.name = null
            this.payload.name_ru = null
            this.payload.name_en = null
            this.payload.direction_id = null
            this.payload.positions = []
        }
    }
})