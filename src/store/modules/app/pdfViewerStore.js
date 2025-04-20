import {defineStore} from "pinia"
import * as pdfjsLib from 'pdfjs-dist'
import * as PdfWorker from "pdfjs-dist/build/pdf.worker.min.js"
import Utils from "@/utils/Utils.js"

window.pdfjsWorker = PdfWorker

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker


export const usePdfViewerStore = defineStore('pdfViewerStore', {
    state: () => ({
        visible: false,
        isSignature: false,
        paddingTop: 60,
        pdfHeight: 0,
        pdfWidth: 0,
        qrCodeUrl: null,
        qrCodeData: null,
        pdfUrl: null,
        qrCodeX: 0,
        qrCodeY: 0,
        pageIndex: 0,
        totalPdfPage: 0,
        loading: false,
        confirmations: [],
        document: null,
        scale: 1.2,
        permissions: {
            canEdit: false,
            canSignature: false,
        },
        signatureMan:null,
        docxUrl: null,

        model: null,
        document_id: null,
        signatureId: null,

        historyLoading: false,
        historyList: [],
        show: false,

        fileList: [],
        fileLoading: false,
        fileShow: false,

        chatVisible: false,
        msg: null,
        messageList: [],
        chatLoading: false,
        userList: [],
        userLoading: false,
        payload: {
            recipient_id: null,
            message: null,
        },

        linkLoading: false,
        link: null,

        checkLoading: false,
        expiredLink: false,
        documentUrl: null,
        signatureWorker: null,
        errorMessage: null,
        isSigned: false,
        saveLoading: false,
        viewerStatus: null,

        linkVisible: false,
        applicationVisible: false,
        appButtonType: false,
        applicationComment: null,

        documentVisible: false,
        documentComment: null,
        rejectLoading: false,

        pdfDocument: null,
        isCtrlPressed: false,
        renderTasks: {},

        attachVisible: false,

        attachActiveTab: 1,
        attachTabs: [
            {
                name: 'tab1',
                id: 1,
            },
            {
                name: 'tab2',
                id: 2,
            },
        ],
        typeAttach: 1,
        attachFiles: [],
        attachLoading: false,

        documentApplications: [],
        docApplicationLoading: false,
        workerApplications: [],


    }),
    actions: {
        async loadPdf() {
            this.totalPdfPage = 0
            console.log(this.pdfUrl)
            const pdfUrl = this.pdfUrl + `?_=${new Date().getTime()}`
            // const pdfUrl = "https://s3.dasuty.com/docflow/documents/timesheets/c4ca4238a0b923820dcc509a6f75849b.pdf"
            try {
                this.pdfDocument = await pdfjsLib.getDocument(pdfUrl).promise
                this.totalPdfPage = this.pdfDocument.numPages
                for (let pageNumber = 1; pageNumber <= this.totalPdfPage; pageNumber++) {
                    await this.renderPdf(pageNumber)
                }

            } catch (err) {
                console.error('Error loading PDF:', err)
            }
        },
        async renderPdf(pageNumber) {
            const page = await this.pdfDocument?.getPage(pageNumber)
            const scale = this.scale
            const viewport = page.getViewport({scale})
            const canvas = document.querySelector(`#pdfCanvas${pageNumber}`)
            const context = canvas.getContext('2d')

            canvas.height = viewport.height
            canvas.width = viewport.width
            this.pdfHeight = viewport.height
            this.pdfWidth = viewport.width

            if (this.renderTasks[pageNumber]) {
                this.renderTasks[pageNumber].cancel()
            }

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            }


            const task = page.render(renderContext)
            this.renderTasks[pageNumber] = task

            try {
                await task.promise
                if (this.isSigned) this.addWatermark(context, viewport)
            } catch (err) {
                if (err.name === 'RenderingCancelledException') {
                    return
                }
                console.error('Render error:', err)
            }
        },
        addWatermark(context, viewport) {
            context.font = 'bold 60px Arial'
            context.fillStyle = 'rgba(74,216,42,0.38)'
            context.textAlign = 'center'
            context.textBaseline = 'middle'
            const text = 'Hujjat imzolangan'
            const x = viewport.width / 2
            const y = viewport.height / 2
            context.translate(x, y)
            context.rotate((45 * Math.PI) / 180)
            context.fillText(text, 0, 0)
            context.rotate((-45 * Math.PI) / 180)
            context.translate(-x, -y)
        },


        _history() {
            this.historyList = []
            this.historyLoading = true
            let params = {
                document_id: this.document_id,
                model: this.model,
            }
            $ApiService.documentService._history({params}).then((res) => {
                this.historyList = res.data.data
            }).finally(() => {
                this.show = true
                this.historyLoading = false
            })
        },
        _files() {
            this.fileLoading = true
            let params = {
                document_id: this.document_id,
                model: this.model,
            }
            $ApiService.documentFileService._index({params}).then((res) => {
                this.fileList = res.data.data
            }).finally(() => {
                this.fileShow = true
                this.fileLoading = false
            })
        },
        _resetForm() {
            this.confirmations = []
            this.document = null
            this.historyList = []
            this.show = false
            this.totalPdfPage = 0
        },
        _addMessage(msg) {
            if (msg.trim().length > 0) {
                this._sendMessage()
                this.msg = ''

            }


        },
        _messages() {
            this.chatLoading = true
            $ApiService.documentChatService._messages({
                params: {
                    document_id: this.document_id,
                    model: this.model,
                }
            }).then((res) => {
                console.log(res.data.data.data)
                this.messageList = res.data.data.data
            }).finally(() => {
                this.chatLoading = false
            })

        },
        _chatUsers() {
            this.userLoading = true
            $ApiService.documentChatService._users({
                params: {
                    document_id: this.document_id,
                    model: this.model,
                }
            }).then((res) => {
                this.userList = res.data.data.map(v => ({
                    name: v.worker.last_name + ' ' + v.worker.first_name,
                    id: v.worker.id
                }))
            }).finally(() => {
                this.userLoading = false
            })
        },
        _sendMessage() {
            this.chatLoading = true
            let data = {...this.payload}
            data.document_id = this.document_id
            data.model = this.model
            data.message = this.msg.trim()
            $ApiService.documentChatService._sendMessage({data}).then((res) => {
                this._messages()
            }).finally(() => {
                this.chatLoading = false
            })
        },
        _generateLink(data) {
            this.link = null
            this.linkLoading = true
            $ApiService.documentService._generateLink({params: data}).then((res) => {
                this.linkVisible = true
                this.link = Utils.convertFromUrlToQuery(res.data.data.url, Utils.viewerStatus.signatureDocument)
            }).finally(() => {
                this.linkLoading = false
            })
        },
        _deleteMessage(id) {
            this.chatLoading = true
            $ApiService.documentChatService._delete({id}).then((res) => {
                this._messages()
            })
        },
        _checkSignature(params) {
            this.errorMessage = null
            this.documentUrl = null
            this.checkLoading = true
            $ApiService.documentService._signature({params, data: {status: 'check'}}).then((res) => {
                this.pdfUrl = res.data.data.url
                this.signatureWorker = `${res.data.data?.worker.last_name} ${res.data.data?.worker.first_name} ${res.data.data?.worker.middle_name}`
                this.isSigned = res.data.data.status === 3
            }).catch((err) => {
                this.errorMessage = err.response.data.message
            }).finally(() => {
                this.checkLoading = false
            })
        },
        _confirmSignature(params, data) {
            this.saveLoading = true
            $ApiService.documentService._signature({params, data}).then((res) => {
                console.log(res.data)
                this._checkSignature(params)
            }).finally(() => {
                this.saveLoading = false
            })

        },
        _rejectDocument(data) {
            this.rejectLoading = true
            $ApiService.documentService._confirmationDocument({data}).then((res) => {

            }).finally(() => {
                this.rejectLoading = false
            })
        },
        _attachFile(data, callBack) {
            this.attachLoading = true
            $ApiService.documentFileService._create({data}).then((res) => {
                this.attachFiles = []
                this.workerApplications = []
                callBack?.()
            }).finally(() => {
                this.attachLoading = false
            })
        },
        _documentApplications(params) {
            this.docApplicationLoading = true
            $ApiService.applicationService._documentApplication({params}).then((res) => {
                this.documentApplications = res.data.data.data.map(v => ({
                    name: v.number,
                    id: v.id,
                }))
            }).finally(() => {
                this.docApplicationLoading = false
            })
        }

    }

})