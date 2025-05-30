import {defineStore} from "pinia"
import i18n from "@/i18n/index.js"
import {useAppSetting} from "@/utils/index.js"
const apiUrl = import.meta.env.VITE_API_URL;

const {t} = i18n.global
export const useSignatureStore = defineStore('signatureStore', {
    state: () => ({
        allKeys: [],
        visible: false,
        signatureType:null,
        signatureTypes:{
            auth:'auth',
            contract:'contracts',
        },

        successCallback:null,
        documentBase64:null,
        documentId:null,
        workerPin:null,
        loading:false,
        confirmationId:null,
        documentType:null,
        rejectLoading:null,
        usbVisible:false,
        keyType:useAppSetting.signatureUseType.pfx
    }),
    actions: {
        async _checkVersion() {
            AppLoad()
            this.usbVisible = false
            return new Promise((resolve, reject) => {
                EIMZOClient.checkVersion(
                    function (major, minor) {
                        resolve({major, minor})
                    },
                    function (error, message) {
                        $Toast.error(t('signature.connectionError'))
                        reject(error, message)
                    }
                )
            })

        },
        checkCardPluggedIn(){
            EIMZOClient.idCardIsPLuggedIn((yes)=>{
                this.usbVisible = yes
            },function(e, r){
                if(e){
                    console.warn(errorCAPIWS + " : " + e)
                    uiShowMessage(errorCAPIWS + " : " + e);

                } else {
                    console.log(r);
                }
            })
        },
        checkListKey(){
            EIMZOClient.listAllUserKeys(
                this._idGenCallback,
                this._uiGenCallback,
                this._successCallback,
                this._failCallback
            )
        },


        async _initialSignature(signatureType, callback) {
            this.signatureType = signatureType
            this.successCallback = callback
            await this._checkVersion()
            this.checkListKey()
            this.checkCardPluggedIn()


        },

        async _signatureDocument(signatureType,documentId,callback ){
            this.signatureType = signatureType
            this.successCallback = callback
            this.documentId = documentId
            // this.loading = true

            await this._checkVersion()
            $ApiService.documentService._documentBase64({
                params:{
                    model:this.documentType,
                    document_id:documentId,
                }
            }).then(async(res)=>{
                this.documentBase64 = res.data.data
                try{
                    await this._checkVersion()
                    this.checkListKey()
                    this.checkCardPluggedIn()
                }catch (err){
                    // $Toast.error(t('signature.connectionError'))
                }
            }).finally(()=>{
                // this.loading = false
            })
        },

        _idGenCallback(o, i) {
            return "itm-" + o.serialNumber + "-" + i
        },
        _uiGenCallback(itemId, v) {
            return this.uiCreateItem(itemId, v)
        },
        _successCallback(items) {
            this.allKeys = []
            for (const v in items) {
                let key = items[v]
                this.allKeys.push({
                    fullName: key.full_name,
                    expired: key.expired,
                    key_type: key.key_type,
                    id: key.id,
                    validDate: key.validDate,
                    pinfl: key.vo.PINFL,
                    certificate: key.vo.name,
                    inn: key.vo.TIN,
                    vo: key.vo,
                })
            }
            this.visible = true
        },
        _failCallback(e, r) {
            if (e) {
                console.log(e)
                uiShowMessage(errorCAPIWS + " : " + e)
            } else {
                console.log(r)
                uiShowMessage(r)
            }
        },
        _accepted(idx, callback) {
            let key = null
            if(idx === useAppSetting.signatureUseType.idCard){
                if(!this.usbVisible) return

                key = useAppSetting.signatureUseType.idCard
            }else{
                key = this.allKeys[idx]
                this.workerPin = key.pinfl
                if (key.expired) {
                    $Toast.error(t('signature.expiredKey'))
                    return ''
                }
            }


            this.getChallenge((challenge)=>{
                if(key === useAppSetting.signatureUseType.idCard){
                    callback(key, challenge)
                }else{
                    let vo = key.vo;
                    EIMZOClient.loadKey(vo, (id)=>{
                        callback(id, challenge)

                    }, ()=>{
                        return uiHandleError
                    });
                }
            });

        },
        getChallenge(callback) {
            this.loading = true
            microAjax(`${apiUrl}/api/v1/signature/challenge?_uc=` + (Date.now() + "_" + Math.random()), (data, s)=>{
                data = JSON.parse(data)
                let status = s.status
                data = data.data

                if (status === 500) {
                    uiShowMessage(data)
                    return
                }

                if (status !== 200) {
                    uiShowMessage(s.statusText)

                    return
                }
                try {
                    if (data.status !== 1) {
                        uiShowMessage(data.message)
                        return
                    }
                    callback(data.challenge)
                } catch (e) {

                    uiShowMessage(s.statusText + ": " + e)
                }
            })
        },
        _auth(keyId, challenge) {
            const callback = this.successCallback

            EIMZOClient.createPkcs7(keyId, challenge, null,  (pkcs7)=>{
                microAjax(`${apiUrl}/api/v1/signature/auth`, (response, s)=>{
                    response = JSON.parse(response)
                    if (s.status === 200) {
                        callback(response)
                    }else{
                        uiShowMessage(response.message)
                    }
                    this.loading = false

                },'&code=' + encodeURIComponent(pkcs7))
            }, ()=>{
                this.loading = false
                return uiHandleError
            }, false)
        },
        _contract(keyId){
            const callback = this._confirmDocument
            const data = this.documentBase64
            EIMZOClient.createPkcs7(keyId, data, null, (pkcs7)=>{
                callback(pkcs7)
            }, ()=>{
                this.loading = false
                return uiHandleError
            }, false)
        },
        _confirmDocument(pkcs7){
            const callback = this.successCallback
            const data = {
                code:pkcs7,
                confirmation_id:this.confirmationId,
                model: this.documentType,
                pin:this.workerPin,
            }
            $ApiService.documentService._confirmationDocument({data}).then((res)=>{
                this.loading = false
                callback(res.data)
            }).catch((err)=>{
                console.log(err)
            })

        },
        uiCreateItem(itemKey, vo) {
            let now = new Date()
            vo.expired = dates.compare(now, vo.validTo) > 0
            let itm = []
            itm.value = itemKey
            itm.full_name = vo.CN
            itm.vo = vo
            itm.id = itemKey
            itm.expired = false

            if (vo.T.length > 0) {
                itm.key_status = true
                itm.key_type = 'signature.legalPerson'
            } else {
                itm.key_status = false
                itm.key_type = 'signature.naturalPerson'
            }

            itm.expired = vo.expired

            itm.validDate = vo.validTo
            return itm
        },
        _rejectDocument(data, callBack){
            this.rejectLoading = true
            $ApiService.documentService._confirmationDocument({data}).then((res)=>{
                callBack?.()
            }).finally(()=>{
                this.rejectLoading = false
            })
        },
    }

})