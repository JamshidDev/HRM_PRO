import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global

export const useCategoryQuestionStore = defineStore('categoryQuestionStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        category_id:null,
        totalItems:0,
        allPermissionList:[],
        structureCheck:[],
        payload:{
            ques: '',
            options: [],
            correct_option: null,
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
            $ApiService.categoryQuestionService._index({id: this.category_id, params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                ques: this.payload.ques,
                options: this.payload.options.map((i, idx)=>{
                    let is_correct = false
                    if(idx===this.payload.correct_option){
                        is_correct = true
                    }
                    return {
                        is_correct,
                        text: i,
                    }
                })
            }
            $ApiService.categoryQuestionService._create({data, id: this.category_id}).then((res)=>{
                $Toast.success(t('message.successDone'))
                this.resetForm()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _update(){
            this.saveLoading = true
            let data = {
                ...this.payload,
            }
            $ApiService.categoryService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.categoryService._delete({id:this.elementId}).then((res)=>{
                this._index()
                $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.payload.ques = ''
            this.payload.options = []
            this.correct_option = null
        },
        resetData(){
            this.list = []
            this.totalItems=0

        },
        addOption(){
            this.payload.options.push('')
        },
        removeOption(v){
            this.payload.options.splice(v,1)
            if(this.payload.correct_option===v){
                this.payload.correct_option = null
            }
        }
    }
})