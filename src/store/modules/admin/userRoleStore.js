import {defineStore} from "pinia";
export const useUserRoleStore = defineStore('userRole', {
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
            name:null,
            permissions:[],
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        }
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.userRoleService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            $ApiService.userRoleService._create({data:this.payload}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            $ApiService.userRoleService._update({data:this.payload, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.userRoleService._delete({id:this.elementId}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        _getAllPermission(){
            $ApiService.userPermissionService._index({params:{
                page:1,
                per_page:1000
                }}).then((res)=>{
                this.allPermissionList = res.data.data.data
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.elementId = null
            this.payload.name = null
        }

    }

})