
import {defineStore} from "pinia";
import QRCode from "qrcode"

import {PDFDocument} from "pdf-lib"
import * as pdfjsLib from 'pdfjs-dist';
import * as PdfWorker from "pdfjs-dist/build/pdf.worker.min.js"
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
        scale:1,




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
    }

})