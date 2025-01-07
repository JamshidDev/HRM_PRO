import {defineStore} from "pinia";
import { v4 as uuidv4 } from 'uuid'
import config from "@/utils/onlyOfficeConfig.json"
export const useOnlyOfficeStore = defineStore('onlyOfficeStore', {
    state:()=>({
        visible:true,
        serverUrl:'http://192.168.82.107/',
        secret:'mGOBFcXBRMjEpJV8OLjtRhGxuT347l7a',
        config:{
            document:{
                fileType:'docx',
                title:'Hr title',
                url:'http://192.168.82.90:9000/docflow/contracts/b2131cbbd55c3a6f970ad71f44ceb97e.docx',
                key:uuidv4(),
                permissions: config.permissions,
            },
            documentType:'word',
            editorConfig:{
                callbackUrl:"http://192.168.136.78:8004/api/v1/hr/contract/update-document?file_url=http://192.168.82.90:9000/docflow/contracts/b2131cbbd55c3a6f970ad71f44ceb97e.docx",
                customization:config.customization,
            },


        },

    }),
    actions:{
        _setOnlyOffice(data){
            this.config = {
                document:{
                    fileType:data.fileType || this.config.document.fileType,
                    title:data.title || this.config.document.title,
                    url:data.url || this.config.document.url,
                },
                documentType:data.documentType || this.config.documentType,
            }
            console.log(this.config)
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