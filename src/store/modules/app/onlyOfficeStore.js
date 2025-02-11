import {defineStore} from "pinia";
import { v4 as uuidv4 } from 'uuid'
import config from "@/utils/onlyOfficeConfig.json"
const _CallBackUrl = import.meta.env.VITE_CALLBACK_URL;
const _ServerUrl = import.meta.env.VITE_OFFICE_SERVER;
export const useOnlyOfficeStore = defineStore('onlyOfficeStore', {
    state:()=>({
        visible:false,
        serverUrl:_ServerUrl,
        secret:'Bi0gE1TTai3i5bNeMkLyxZEFrsweLWFxfot6mrVWQc',
        config:{
            document:{
                fileType:'docx',
                title:'Document title here...',
                url:"",
                key:uuidv4(),
                permissions: config.permissions,
            },
            documentType:'word',
            editorConfig:{
                lang: "ru",
                callbackUrl:'',
                customization:config.customization,
                user:{
                    id:null,
                    name:null,
                }
            },
        },
        model:null,
        document_id:null,
        user_uuid:null,

    }),
    getters:{
        callBackUrl:(state)=>{
            return `${_CallBackUrl}?file_url=${state?.config.document.url}&model=${state.model}&document_id=${state.document_id}&user_uuid=${state.user_uuid}`
        }
    },
    actions:{
        _setOnlyOffice(data){
            // console.log(data)
            // this.config = {
            //     document:{
            //         fileType:data.fileType || this.config.document.fileType,
            //         title:data.title || this.config.document.title,
            //         url:data.url || this.config.document.url,
            //     },
            //     documentType:data.documentType || this.config.documentType,
            // }

            this.config = data

        },
        _setOnlyOfficeVisible(v){
            this.visible = v
        },
        _onLoadComponentError(errorCode,errorDescription){
            switch(errorCode) {
                case -1: // Unknown error loading component
                    console.log(errorDescription)
                    break

                case -2: // Error load DocsAPI from http://documentserver/
                    console.log(errorDescription)
                    break

                case -3: // DocsAPI is not defined
                    console.log(errorDescription)
                    break
            }
        },
        _onDocumentReady(){
            console.log("Document is loaded")
        },



    }

})