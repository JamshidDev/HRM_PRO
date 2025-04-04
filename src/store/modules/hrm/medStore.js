import {defineStore} from "pinia";
export const useMedStore = defineStore('medStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        showLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        payload:{
            pin:null,
            organization_id:[],
            worker_position_id:null,
            from:null,
            to:null,
            status:null,
            file:[],
            comment:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        uuid:null,
        tabs:[
            {
                id:1,
                name:'medPage.tab.worker'
            },
            {
                id:2,
                name:'medPage.tab.candidate'
            },
        ],
        activeTab:1,
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.medService._index({params:{uuid:this.uuid}}).then((res)=>{
                this.list = res.data.data.data
            }).finally(()=>{
                this.loading= false
            })
        },
        _show(callback){
            this.showLoading = true
            $ApiService.medService._show({id:this.elementId}).then((res)=>{
                callback?.(res.data.data)
            }).finally(()=>{
                this.showLoading = false
            })
        },
        _create(data){
            this.saveLoading = true
            $ApiService.medService._create({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(data){
            this.saveLoading = true
            $ApiService.medService._update({data, id:this.elementId, params:{_method:"PUT"}}).then((res)=>{
                this.visible = false
                this._index()

            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.medService._delete({id:this.elementId}).then((res)=>{
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
            this.payload.pin = null
            this.payload.organization_id = []
            this.payload.worker_position_id = null
            this.payload.from = null
            this.payload.to = null
            this.payload.status = null
            this.payload.comment = null
            this.payload.file = []
        },

    }

})