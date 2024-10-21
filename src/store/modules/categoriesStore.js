import i18n from "../../i18n/index.js"
const {t} = i18n.global

export const useCategoriesStore = defineStore('categoriesStore',{
    state:()=>({
        list:[],
        allList:[],
        totalItems:0,
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        allLoading:false,
        categoryId:null,
        params:{
            search:null,
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
                this.list = res.data.items
                this.totalItems = res.data.total
            }).finally(()=>{
                this.loading = false
            })
        },
        _getAll(){
            this.allLoading = true
            $ApiService.categoryService._getCategories({params:{page:1, size:1000}}).then((res)=>{
                this.allList = res.data.items
            }).finally(()=>{
                this.allLoading = false
            })
        },

        createItem(data){
            $ApiService.categoryService._createCategory({data}).then((res)=>{
                this.visible = false
                $Toast.success(t('categoryPage.toast.successCreate'))
                this._index()
                this._getAll()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        updateItem(data){
            const categoryId = this.categoryId
            $ApiService.categoryService._updateCategory({categoryId,data}).then((res)=>{
                $Toast.success(t('categoryPage.toast.successUpdate'))
                this._index()
            }).finally(()=>{
                this.saveLoading = false
                this.visible = false

            })
        },
        deleteItem(){
            this.deleteLoading = true
            const categoryId = this.categoryId
            $ApiService.categoryService._deleteCategory({categoryId}).then((res)=>{
                $Toast.success(t('categoryPage.toast.successUpdate'))
                this._index()
                this._getAll()
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(v){
            this.visible = v
        },

        resetPayload(){
            this.payload.parent_id = null
            this.payload.name = null
            this.payload.description = null
            this.payload.image = []
        }
    }
})