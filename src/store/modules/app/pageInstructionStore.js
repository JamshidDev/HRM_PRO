import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
import en from "@/assets/images/content/en.png"
import ru from "@/assets/images/content/ru.png"
import uz from "@/assets/images/content/uz.png"
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
        payload: {
            title: null,
            text: '',
            permission: null,
            photos: []
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
        }]
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.directionService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                name:this.payload.name,
                long:this.payload.marker.coords[0],
                lat:this.payload.marker.coords[1],
            }
            $ApiService.countryService._create({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            let data = {
                name:this.payload.name,
                long:this.payload.marker.coords[0],
                lat:this.payload.marker.coords[1],
            }
            $ApiService.countryService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.countryService._delete({id:this.elementId}).then((res)=>{
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
            if(this.payload.photos[index]?.id){

            }else{
                this.payload.photos = this.payload.photos.filter((_, idx)=>idx!==index)
            }
        },
        resetForm(){
            this.payload.title = null
            this.payload.text = ''
            this.payload.photos = []
            this.elementId = null
        }
    }
})