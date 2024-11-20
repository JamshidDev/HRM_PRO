import {defineStore} from "pinia";
import router from "@/router/index.js"
import {AppPaths} from "@/utils/index.js"
export const useSignatureStore = defineStore('signatureStore', {
    state:()=>({
        allKeys:[],
        visible:false,
    }),
    actions:{
       async _checkVersion(){
           return new Promise((resolve, reject) => {
               EIMZOClient.checkVersion(
                   function (major, minor) {
                       resolve({major, minor})
                   },
                   function (error, message) {
                       reject(error, message)
                   }
               )
           })
       },

        async _initialSignature(){
           await this._checkVersion()
            EIMZOClient.listAllUserKeys(
                this._idGenCallback,
                this._uiGenCallback,
                this._successCallback,
                this._failCallback);
        },
        _idGenCallback(o, i){
            return "itm-" + o.serialNumber + "-" + i;
        },
        _uiGenCallback(itemId, v){
           this.items = []
           return this.uiCreateItem(itemId, v)
        },
        _successCallback(items){
            for(const v in items){
                this.allKeys.push(items[v])
            }
            this.visible = true
        },
        _failCallback(e, r){
            if (e) {
                uiShowMessage(errorCAPIWS + " : " + e);
            } else {
                console.log(r);
            }
        },
        uiCreateItem(itemKey, vo){
            let now = new Date();
            vo.expired = dates.compare(now, vo.validTo) > 0;
            let itm = [];
            itm.value = itemKey;
            itm.full_name = vo.CN;
            itm.vo = vo;
            itm.id = itemKey;
            itm.expired = false;

            if (vo.T.length > 0) {
                itm.key_status = true;
                itm.key_type = 'Юридическое лицо'
            } else {
                itm.key_status = false;
                itm.key_type = 'Физическое лицо';
            }

            itm.expired = vo.expired;

            itm.validDate = this.dateFormat(vo.validTo);
            return itm;
        },
        dateFormat(dateTime){
            const date = new Date(dateTime);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Месяцы в JS считаются с 0
            const year = date.getFullYear();

            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');

            return `${day}:${month}:${year} ${hours}:${minutes}:${seconds}`;

        },

    }

})