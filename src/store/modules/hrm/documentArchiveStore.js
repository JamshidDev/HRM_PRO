import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useDocumentArchiveStore = defineStore('documentArchiveStore', {
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
            visibility_type:null,
            title:null,
            description:null,
            document_date:null,
            type:null,
            file:[],
            fakeFile:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        visibleTypes:[
            {
                id:'OWN',
                name:t('documentArchive.type.OWN')
            },
            {
                id:'OWN_AND_BELOW',
                name:t('documentArchive.type.OWN_AND_BELOW')
            },
            {
                id:'ALL',
                name:t('documentArchive.type.ALL')
            },
        ]
    }),
    actions:{
        _index(infinity=false){
            this.loading= true
            const params = {
                ...this.params
            }
            $ApiService.documentArchiveService._index({params}).then((res)=>{
                const data = res.data.data.data
                this.list = infinity? [...this.list, ...data] : data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(data){
            this.saveLoading = true
            $ApiService.documentArchiveService._create({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(data){
            this.saveLoading = true
            $ApiService.documentArchiveService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()

            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.documentArchiveService._delete({id:this.elementId}).then((res)=>{
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
            this.payload.visibility_type = null
            this.payload.title = null
            this.payload.file = []
            this.payload.description = null
            this.payload.document_date = null
            this.payload.type = null
            this.payload.fakeFile = null

        }

    }

})