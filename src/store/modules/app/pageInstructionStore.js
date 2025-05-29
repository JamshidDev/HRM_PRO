import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import login from "@/assets/images/content/login-overall.png"
import {useAccountStore} from "@/store/modules/index.js"

const {t} = i18n.global
export const usePageInstructionStore = defineStore('pageInstructionStore', {
    state:()=>({
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        instructionList: [],
        elementId:null,
        imgCarouselIdx: 0,
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        list:[],
        totalItems:0,
        payload: {
            title: null,
            text: '',
            permission: null,
            photos: [],
            menu:null,
            sub_menu:null,
        },
        activeSection: undefined,
        sections: [],
        imageLoading:false,
    }),
    actions:{
        _sections(){
            const accStore = useAccountStore()
            const params = {
                menu: this.payload.menu,
                sub_menu: this.payload.sub_menu,
            }
            this.loading= true
            $ApiService.instructionService._index({params}).then((res)=>{
                const data = res.data.data.data
                this.sections = data
                if(accStore.checkAction(accStore.pn.admin)){
                    this.activeSection = 99999
                }else if(data.length){
                    this.activeSection = data[0].id
                }else{
                    this.activeSection = undefined
                }
            }).finally(()=>{
                this.loading= false
            })
        },
        _index(){
            this.loading= true
            $ApiService.instructionService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(data){
            this.saveLoading = true
            $ApiService.instructionService._create({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _update(data){
            this.saveLoading = true
            $ApiService.instructionService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.instructionService._delete({id:this.elementId}).then((res)=>{
                this._index()
                if(this.activeSection){
                    this._sections()
                }
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        deleteImage(){
            const index = this.imgCarouselIdx
            const id = this.payload.photos[index]?.id
            if(!id){
                this.payload.photos = this.payload.photos.filter((_,idx)=>idx!==index)
                return
            }

            this.imageLoading = true
            $ApiService.instructionService._deletePhoto({id}).then((res)=>{
                this.payload.photos = this.payload.photos.filter((_,idx)=>idx!==index)
            }).finally(()=>{
                this.imageLoading = false
            })
        },
        resetForm(){
            this.payload.title = null
            this.payload.text = ''
            this.payload.photos = []
            this.elementId = null
        }
    }
})