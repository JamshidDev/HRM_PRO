import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global

export const useCategoryQuestionStore = defineStore('categoryQuestionStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        showLoading:false,
        deleteLoading:false,
        elementId:null,
        category_id:null,
        totalItems:0,
        allPermissionList:[],
        structureCheck:[],
        visible: false,
        visibleType: true,
        payload:{
            ques: '',
            options: [],
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
                const {data, total} = res.data.data
                this.list = [...this.list, ...data]
                this.totalItems = total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                ...this.payload
            }
            $ApiService.categoryQuestionService._create({data, category_id: this.category_id}).then((res)=>{
                this.resetForm()
                this.resetData()
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _update(){
            this.saveLoading = true
            let data = {
                ...this.payload
            }
            $ApiService.categoryQuestionService._update({data, category_id: this.category_id, question_id:this.elementId}).then((res)=>{
                this.visible = false
                this.resetData()
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.categoryQuestionService._delete({id:this.elementId}).then((res)=>{
                this.list = this.list.filter((i) => i.id!==this.elementId)
                this.totalItems--
                
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        _show(){
            this.showLoading = true
            $ApiService.categoryQuestionService._show({category_id: this.category_id, question_id:this.elementId}).then((res)=>{
                const {options, ques} = res.data.data
                this.payload.ques = ques
                this.payload.options = options.map(i=>({
                    is_correct: !!i.is_correct,
                    text: i.text
                }))
                console.log(options)
                console.log(this.payload.options)
            }).finally(()=>{
                this.showLoading = false
            })
        },
        resetForm(){
            this.payload.ques = ''
            this.payload.options = []
        },
        resetData(){
            this.list = []
            this.totalItems=0
        },
        addOption(){
            this.payload.options.push({
                text: '',
                is_correct: false
            })
        },
        removeOption(v){
            this.payload.options.splice(v,1)
        }
    }
})