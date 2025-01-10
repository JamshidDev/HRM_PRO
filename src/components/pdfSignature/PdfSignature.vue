<script setup>
import {PDFDocument} from 'pdf-lib'
import QRCode from 'qrcode'

const createQRCode  = async(data)=>{
  return new Promise((resolve, reject)=>{
    QRCode.toDataURL(data,(err, url)=>{
        if(err) reject(err)
        else resolve(url)
    })
  })
}

const addQRCodeToPDF = async (pdfUrl, qrCodeData, pageIndex, cordY, cordX )=>{
  const response = await fetch(pdfUrl)
  const existingPdfBytes = await response.arrayBuffer()
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const qrCodeDataUrl = await createQRCode(qrCodeData);
  const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);
  const qrCodeDims = qrCodeImage.scale(0.5);
  const page = pdfDoc.getPages()[pageIndex];
  page.drawImage(qrCodeImage, {
    x: cordX,
    y: page.getHeight() - qrCodeDims.height - cordY,
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
  console.log("success")
}

defineExpose({
  addQRCodeToPDF
})


onMounted(async()=>{
  // const pdfUrl = 'https://cabinet.dasuty.com/s3/media/document/AT94325743.pdf';
  // const qrCodeData = 'https://example.com/signature';
  // await addQRCodeToPDF(pdfUrl, qrCodeData);

})
</script>

<template>
<div></div>
</template>

<style scoped>

</style>