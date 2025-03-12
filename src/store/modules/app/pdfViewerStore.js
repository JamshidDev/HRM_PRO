
import {defineStore} from "pinia";
import QRCode from "qrcode"

import {PDFDocument} from "pdf-lib"
import * as pdfjsLib from 'pdfjs-dist';
import * as PdfWorker from "pdfjs-dist/build/pdf.worker.min.js"
import Utils from "@/utils/Utils.js"
window.pdfjsWorker = PdfWorker

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker


export const usePdfViewerStore = defineStore('pdfViewerStore', {
    state:()=>({
        visible:false,
        isSignature:false,
        paddingTop:60,
        pdfHeight:0,
        pdfWidth:0,
        qrCodeUrl:null,
        qrCodeData:null,
        pdfUrl:null,
        qrCodeX:0,
        qrCodeY:0,
        pageIndex:0,
        totalPdfPage:0,
        loading:false,
        confirmations:[],
        document:null,
        scale:1.2,
        permissions:null,
        docxUrl:null,

        model:null,
        document_id:null,
        signatureId:null,

        historyLoading:false,
        historyList:[],
        show:false,

        fileList:[],
        fileLoading:false,
        fileShow:false,

        chatVisible:false,
        msg:null,
        messageList:[],
        chatLoading:false,
        userList:[],
        userLoading:false,
        payload:{
            recipient_id:null,
            message:null,
        },

        linkLoading:false,
        link:null,

        checkLoading:false,
        expiredLink:false,
        documentUrl:null,
        signatureWorker:null,
        errorMessage:null,
        isSigned:false,
        saveLoading:false,
        viewerStatus:null,

        linkVisible:false,




    }),
    actions:{
       async createQRCode(){
           try{
               this.qrCodeUrl = await QRCode.toDataURL(this.qrCodeData)
               return  this.qrCodeUrl
           }
           catch (err){console.log(err)}
        },
       async addQRCodeToPDF(){
           console.log(this.pdfUrl)
           const response = await fetch('http://192.168.82.90:9000/docflow/documents/contracts/d61e6f4e6e7817fc61b293944fcb0605.pdf')
           const existingPdfBytes = await response.arrayBuffer()
           const pdfDoc = await PDFDocument.load(existingPdfBytes);
           const qrCodeDataUrl = await this.createQRCode();
           const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);
           const qrCodeDims = qrCodeImage.scale(0.5);
           const page = pdfDoc.getPages()[this.pageIndex];
           page.drawImage(qrCodeImage, {
               x: this.qrCodeX,
               y: page.getHeight() - qrCodeDims.height - this.qrCodeY,
               width: qrCodeDims.width,
               height: qrCodeDims.height,
           });
           const pdfBytes = await pdfDoc.save();
           const blob = new Blob([pdfBytes], { type: 'application/pdf' });
           const url = URL.createObjectURL(blob);
           const a = document.createElement('a');
           a.href = url;
           a.download = 'signed_document.pdf';
           a.click();
           URL.revokeObjectURL(url);
       },
       async loadPdf(){
           this.totalPdfPage = 0
           const pdfUrl = this.pdfUrl+`?_=${new Date().getTime()}`
           try{
               const pdf = await pdfjsLib.getDocument(pdfUrl).promise
               this.totalPdfPage = pdf.numPages
               for (let pageNumber = 1; pageNumber <= this.totalPdfPage; pageNumber++) {
                   const page = await pdf.getPage(pageNumber);
                   const scale = this.scale;
                   const viewport = page.getViewport({ scale });

                   const canvas = document.querySelector(`#pdfCanvas${pageNumber}`);
                   const context = canvas.getContext('2d');
                   canvas.height = viewport.height;
                   canvas.width = viewport.width;
                   this.pdfHeight = viewport.height
                   this.pdfWidth = viewport.width

                   const renderContext = {
                       canvasContext: context,
                       viewport: viewport,
                   };
                   await page.render(renderContext).promise
               }

           }catch (err){
               console.error('Error loading PDF:', err);
           }
       },
        _history(){
            this.historyList = []
           this.historyLoading = true
           let params = {
               document_id:this.document_id,
               model:this.model,
           }
           $ApiService.documentService._history({params}).then((res)=>{
               this.historyList = res.data.data
           }).finally(()=>{
               this.show = true
               this.historyLoading = false
           })
        },
        _files(){
           this.fileLoading = true
            let params = {
                document_id:this.document_id,
                model:this.model,
            }
            $ApiService.documentFileService._index({params}).then((res)=>{
                this.fileList = res.data.data
            }).finally(()=>{
                this.fileShow = true
                this.fileLoading = false
            })
        },
        _resetForm(){
           this.confirmations = []
           this.document = null
           this.historyList = []
            this.show = false
            this.totalPdfPage = 0
        },
        _addMessage(msg){
           if(msg.trim().length > 0){
               this._sendMessage()
               this.msg = ''

           }


        },
        _messages(){
           this.chatLoading = true
            $ApiService.documentChatService._messages({params:{
                    document_id:this.document_id,
                    model:this.model,
                }}).then((res)=>{
                this.messageList = res.data.data.data
            }).finally(()=>{
                this.chatLoading = false
            })

        },
        _chatUsers(){
            this.userLoading = true
            $ApiService.documentChatService._users({params:{
                    document_id:this.document_id,
                    model:this.model,
                }}).then((res)=>{
                this.userList = res.data.data.map(v=>({
                    name:v.worker.last_name +' '+v.worker.first_name,
                    id:v.worker.id
                }))
            }).finally(()=>{
                this.userLoading = false
            })
        },
        _sendMessage(){
           this.chatLoading = true
            let data = {...this.payload}
            data.document_id = this.document_id
            data.model = this.model
            data.message = this.msg.trim()
            $ApiService.documentChatService._sendMessage({data}).then((res)=>{
                this._messages()
            }).finally(()=>{
                this.chatLoading = false
            })
        },
        _generateLink(data){
            this.link = null
            this.linkLoading = true
            $ApiService.documentService._generateLink({params:data}).then((res)=>{
                this.linkVisible = true
                this.link =Utils.convertFromUrlToQuery(res.data.data.url, Utils.viewerStatus.signatureDocument)
            }).finally(()=>{
                this.linkLoading = false
            })
        },
        _deleteMessage(id){
           this.chatLoading = true
            $ApiService.documentChatService._delete({id}).then((res)=>{
                    this._messages()
            })
        },
        _checkSignature(params){
           this.errorMessage = null
           this.documentUrl = null
           this.checkLoading = true
            $ApiService.documentService._signature({params,data:{status:'check'}}).then((res)=>{
                    this.documentUrl = res.data.data.url
                    this.signatureWorker = `${res.data.data?.worker.last_name} ${res.data.data?.worker.first_name} ${res.data.data?.worker.middle_name}`
                    this.isSigned =  res.data.data.status === 3
            }).catch((err)=>{
                this.errorMessage = err.response.data.message
            }).finally(()=>{
                this.checkLoading = false
            })
        },
        _confirmSignature(params, data){
           this.saveLoading = true
           $ApiService.documentService._signature({params, data}).then((res)=>{
               console.log(res.data)
               this._checkSignature(params)
           }).finally(()=>{
               this.saveLoading = false
           })

        }
    }

})