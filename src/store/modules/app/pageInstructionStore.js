import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import login from "@/assets/images/content/login-overall.png"

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
        activeSection: 1,
        sections: [{
            title: "Xodimlarni baholash",
            id: 1,
            text: `
            <h1>Welcome to <em>Vue.js</em> Testing</h1>
            <p>This is a <strong>sample paragraph</strong> with some <a href="https://vuejs.org" target="_blank">external link</a>.</p>
            
            <ul>
              <li>First item</li>
              <li>Second item</li>
              <li><span style="color: red;">Styled third item</span></li>
            </ul>
            
            <ol>
              <li>Ordered one</li>
              <li>Ordered two</li>
            </ol>
            
            <blockquote>
              "This is a quote element. Use this for long quotations."
            </blockquote>
            
            <hr>
            
            <table border="1" cellpadding="4">
              <thead>
                <tr><th>Name</th><th>Role</th></tr>
              </thead>
              <tbody>
                <tr><td>Jane Doe</td><td>Developer</td></tr>
                <tr><td>John Smith</td><td>Designer</td></tr>
              </tbody>
            </table>
            
            <div style="background-color: #f0f0f0; padding: 10px;">
              <p>This is inside a styled div. <code>&lt;code&gt;</code> tag is useful for inline code.</p>
            </div>

            `,
            photos: [
                {
                    id: 1,
                    url: "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel1.jpeg"},
                {
                    id: 2,
                    url: "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel2.jpeg"}
            ]
        },
        {
            title: "hello 2",
            id: 2,
            text: "This is some text 2",
            photos: [
                {
                    id: 1,
                    url: login
                },{
                    id: 2,
                    url: "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel4.jpeg"
                },{
                    id: 3,
                    url: "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel3.jpeg"
                }
            ]
        }],
        imageLoading:false,
    }),
    actions:{
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