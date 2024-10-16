import i18n from "../../i18n/index.js"
const {t} = i18n.global

export const useCategoriesStore = defineStore('categoriesStore',{
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        params:{
            page:1,
            size:10,
        },
        payload:{
            parent_id:null,
            store_id:'tpgF7UfNd6RN4e62TawtU6',
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
                this.list = res.data
            }).finally(()=>{
                this.loading = false
            })
        },

        createItem(data){
            $ApiService.categoryService._createCategory({data}).then((res)=>{
                $Toast.success(t('categoryPage.toast.successCreate'))
            }).finally(()=>{

                this.saveLoading = false
                this.visible = false
                this._index()
            })
        },
        openVisible(v){
            this.visible = v
        }
    }
})