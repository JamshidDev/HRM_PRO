import {defineStore} from "pinia";
import { v4 as uuidv4 } from 'uuid'
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
            },
            documentType:'word',
            editorConfig:{
                callbackUrl:"http://192.168.136.78:8004/api/v1/hr/contract/update-document?file_url=http://192.168.82.90:9000/docflow/contracts/b2131cbbd55c3a6f970ad71f44ceb97e.docx",
                customization:{
                    "toolbar": true,
                    "anonymous": {
                        "request": false,
                        "label": ""
                    },
                    "openLeftSidePanel": false,
                    "openRightSidePanel": false,
                    "autosave": false,
                    "comments": false,
                    "compactHeader": false ,
                    "compactToolbar": false,
                    "compatibleFeatures": true,
                    "forcesave": true,
                    "help": false,
                    "hideRightMenu": false,
                    "hideRulers": false,
                    "plugins": false,
                    "toolbarHideFileName": true,
                    "uiTheme": "theme-classic-light",
                    "unit": "cm",
                    "zoom": 100
                }
            },
        },

    }),
    actions:{
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