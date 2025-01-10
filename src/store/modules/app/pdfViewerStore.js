
import {defineStore} from "pinia";
import QRCode from "qrcode"

import {PDFDocument} from "pdf-lib"
import * as pdfjsLib from 'pdfjs-dist';
import * as PdfWorker from "pdfjs-dist/build/pdf.worker.min.js"
window.pdfjsWorker = PdfWorker

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker



// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
export const usePdfViewerStore = defineStore('pdfViewerStore', {
    state:()=>({
        visible:false,
        isSignature:false,
        paddingTop:60,
        pdfHeight:841,
        pdfWidth:595,
        qrCodeUrl:null,
        qrCodeData:null,
        pdfUrl:null,
        qrCodeX:0,
        qrCodeY:0,
        pageIndex:0,
        totalPdfPage:0,
        loading:false,
        confirmations:[],



    }),
    actions:{
       async createQRCode(){
           console.log(this.qrCodeData)
           try{
               this.qrCodeUrl = await QRCode.toDataURL(this.qrCodeData)
               return  this.qrCodeUrl
           }
           catch (err){console.log(err)}
        },
       async addQRCodeToPDF(){
           const response = await fetch(this.pdfUrl)
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
    }

})