import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import { useAppSetting } from '@/utils/index.js'
const apiUrl = import.meta.env.VITE_API_URL

const { t } = i18n.global
export const useSignatureStore = defineStore('signatureStore', {
  state: () => ({
    allKeys: [],
    visible: false,
    signatureType: null,
    signatureTypes: {
      auth: 'auth',
      contract: 'contracts'
    },

    successCallback: null,
    documentBase64: null,
    documentId: null,
    workerPin: null,
    loading: false,
    confirmationId: null,
    documentType: null,
    rejectLoading: null,
    usbVisible: false,
    keyType: useAppSetting.signatureUseType.pfx,
    signatureBtnLoading: false
  }),
  actions: {
    async _checkVersion() {
      AppLoad()
      this.usbVisible = false
      return new Promise((resolve, reject) => {
        EIMZOClient.checkVersion(
          function (major, minor) {
            resolve({ major, minor })
          },
          (error, message) => {
            this.loading = false
            $Toast.error(t('signature.connectionError'))
            reject(error, message)
          }
        )
      })
    },
    checkCardPluggedIn() {
      EIMZOClient.idCardIsPLuggedIn(
        (yes) => {
          this.usbVisible = yes
        },
        function (e, r) {
          if (e) {
            console.warn(errorCAPIWS + ' : ' + e)
            uiShowMessage(errorCAPIWS + ' : ' + e)
          } else {
          }
        }
      )
    },
    checkListKey() {
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

    async _signatureDocument(signatureType, documentId, callback) {
      this.signatureType = signatureType
      this.successCallback = callback
      this.documentId = documentId
      this.loading = true

      await this._checkVersion()
      $ApiService.documentService
        ._documentBase64({
          params: {
            model: this.documentType,
            document_id: documentId
          }
        })
        .then(async (res) => {
          this.documentBase64 = res.data.data
          try {
            await this._checkVersion()
            this.checkListKey()
            this.checkCardPluggedIn()
          } catch (err) {
            this.loading = false
            // $Toast.error(t('signature.connectionError'))
          }
        })
        .finally(() => {
          this.loading = false
        })
    },

    _idGenCallback(o, i) {
      return 'itm-' + o.serialNumber + '-' + i
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
          // Sertifikat ichidagi qo'shimcha ma'lumotlar — modalda kalitni
          // tanlashdan oldin foydalanuvchi kimligini aniq ko'rsatish uchun.
          organization: key.vo.O,
          position: key.vo.T,
          serialNumber: key.vo.serialNumber,
          validFrom: key.vo.validFrom,
          storageType: key.vo.type,
          isValid: new Date(key.validDate).getTime() > Date.now()
        })
      }
      this.allKeys.sort((a, b) => new Date(b.validDate) - new Date(a.validDate))
      this.visible = true
    },
    _failCallback(e, r) {
      if (e) {
        uiShowMessage(errorCAPIWS + ' : ' + e)
      } else {
        uiShowMessage(r)
      }
    },
    _accepted(idx, callback) {
      let key = null
      if (idx === useAppSetting.signatureUseType.idCard) {
        if (!this.usbVisible) return

        key = useAppSetting.signatureUseType.idCard
      } else {
        key = this.allKeys[idx]
        this.workerPin = key?.pinfl
        if (key.expired) {
          $Toast.error(t('signature.expiredKey'))
          return ''
        }
      }

      this.getChallenge((challenge) => {
        if (key === useAppSetting.signatureUseType.idCard) {
          callback(key, challenge)
        } else {
          let vo = key.vo
          EIMZOClient.loadKey(
            vo,
            (id) => {
              callback(id, challenge)
            },
            (e, r) => {
              // Parol oynasi bekor qilinsa ham shu yerga tushadi — loading'ni
              // ochib qo'ymaslik kerak, aks holda modal muzlab qoladi.
              this.loading = false
              if (e) uiShowMessage(errorCAPIWS + ' : ' + e)
              else if (r) uiShowMessage(r)
            }
          )
        }
      })
    },
    // Backend texnik xatolarni ingliz tilida qaytaradi ("failed to check certificate
    // state: ConnectionException: UNAVAILABLE: ssl exception") — foydalanuvchiga
    // bunday matn hech narsa demaydi, shuning uchun tarjima qilingan xabarga
    // almashtiramiz. Asl matn diagnostika uchun konsolda qoladi.
    _signatureErrorMessage(raw) {
      const text = String(raw ?? '').trim()
      if (!text) return t('signature.serverError')
      if (/certificate state|UNAVAILABLE|ConnectionException|ssl/i.test(text)) {
        return t('signature.certCheckError')
      }
      return text
    },
    getChallenge(callback) {
      this.loading = true
      microAjax(
        `${apiUrl}/api/v1/signature/challenge?_uc=` + (Date.now() + '_' + Math.random()),
        (raw, s) => {
          // Har qanday muvaffaqiyatsiz yo'lda loading o'chirilishi shart — aks holda
          // tugma va modal abadiy "loading" holatida qotib qoladi.
          const fail = (message) => {
            this.loading = false
            console.warn('signature/challenge:', s.status, raw)
            uiShowMessage(this._signatureErrorMessage(message))
          }

          // 5xx da server JSON o'rniga HTML (yoki bo'sh javob) qaytarishi mumkin —
          // JSON.parse qo'riqlanmasa, xato shu callback ichida ko'tarilib ketadi va
          // loading hech qachon o'chmaydi.
          let body
          try {
            body = JSON.parse(raw)
          } catch {
            return fail(s.status ? s.statusText : '')
          }

          const data = body?.data
          if (s.status !== 200) return fail(body?.message || s.statusText)
          if (data?.status !== 1) return fail(data?.message)

          callback(data.challenge)
        }
      )
    },
    _auth(keyId, challenge) {
      const callback = this.successCallback

      EIMZOClient.createPkcs7(
        keyId,
        challenge,
        null,
        (pkcs7) => {
          microAjax(
            `${apiUrl}/api/v1/signature/auth`,
            (raw, s) => {
              this.loading = false

              let response
              try {
                response = JSON.parse(raw)
              } catch {
                console.warn('signature/auth: JSON emas javob', s.status, raw)
                uiShowMessage(t('signature.serverError'))
                return
              }

              // Backend 200 bilan ham `error: true` qaytarishi mumkin — faqat
              // status'ga ishonib qolsak, token'siz javob muvaffaqiyat sanaladi.
              if (s.status === 200 && !response?.error) {
                callback(response)
              } else {
                console.warn('signature/auth xatosi:', s.status, response?.message)
                uiShowMessage(this._signatureErrorMessage(response?.message))
              }
            },
            '&code=' + encodeURIComponent(pkcs7)
          )
        },
        (e, r) => {
          this.loading = false
          if (e) uiShowMessage(errorCAPIWS + ' : ' + e)
          else if (r) uiShowMessage(r)
        },
        false
      )
    },
    _contract(keyId) {
      const callback = this._confirmDocument
      const data = this.documentBase64
      EIMZOClient.createPkcs7(
        keyId,
        data,
        null,
        (pkcs7) => {
          callback(pkcs7)
        },
        () => {
          this.loading = false
          return uiHandleError
        },
        false
      )
    },
    _confirmDocument(pkcs7) {
      const callback = this.successCallback
      const data = {
        code: pkcs7,
        confirmation_id: this.confirmationId,
        model: this.documentType,
        pin: this.workerPin
      }
      $ApiService.documentService
        ._confirmationDocument({ data, silentError: true })
        .then((res) => {
          this.loading = false
          callback(res.data)
        })
        .catch(() => {
          this.loading = false
          $Toast.error(t('signature.confirmError'))
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
    _rejectDocument(data, callBack) {
      this.rejectLoading = true
      $ApiService.documentService
        ._confirmationDocument({ data })
        .then((res) => {
          callBack?.()
        })
        .finally(() => {
          this.rejectLoading = false
        })
    }
  }
})
