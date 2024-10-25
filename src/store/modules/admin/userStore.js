import {defineStore} from "pinia";
export const useUserStore = defineStore('user', {
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
            name:null,
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
            $ApiService.userService._index({params:this.params}).then((res)=>{
                console.log(res.data)
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            $ApiService.userService._create({data:this.payload}).then((res)=>{
                console.log(res.data)
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            $ApiService.userPermissionService._update({data:this.payload}).then((res)=>{
                console.log(res.data)
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.userPermissionService._delete({id:this.elementId}).then((res)=>{
                console.log(res.data)
            }).finally(()=>{
                this.deleteLoading = false
            })
        }

    }

})