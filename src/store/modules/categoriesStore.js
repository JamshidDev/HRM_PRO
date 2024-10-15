
export const useCategoriesStore = defineStore('categoriesStore',{
    state:()=>({
        list:[],
        loading:false,
        params:{
            page:1,
            size:10,
        },
        payload:{
            parent_id:null,
            store_id:null,
            name:null,
            description:null,
            image:[],
        },
        visible:false,
        visibleType:true,
    }) ,
    getters:{

    },
    actions:{
        _index(){
            this.loading = true
            $ApiService.categoryService._getCategories({params:this.params}).then((res)=>{
                console.log(res.data)
            }).finally(()=>{
                this.loading = false
            })
        },

        createItem(data){
            $ApiService.categoryService._createCategory({data}).then((res)=>{
                console.log(res.data)
            })
        },
        openVisible(v){
            console.log(v)
            this.visible = v
        }
    }
})