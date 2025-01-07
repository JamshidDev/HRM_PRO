<script setup>
import fs from 'fs'
import {PDFDocument} from 'pdf-lib'
import QRCode from 'qrcode'

const createQRCode = async (data)=>{
  const qrCodeDataUrl = await QRCode.toDataURL(data); // QR kodni DataURL formatida yaratish
  return qrCodeDataUrl;
}

const createPDFWithQRCode = async(existingPdfPath, outputPdfPath, qrCodeData)=>{
  const existingPdfBytes = fs.readFileSync(existingPdfPath)
  const pdfDoc = await PDFDocument.load(existingPdfBytes)

  // QR kodni yaratish
  const qrCodeDataUrl = await createQRCode(qrCodeData);
  const qrCodeImage = await pdfDoc.embedJpg(qrCodeDataUrl); // QR kodni PDFga JPG sifatida kiritish
  const qrCodeDims = qrCodeImage.scale(0.5); // QR kodning o'lchamini sozlash

  // Birinchi sahifaga QR kodni joylashtirish
  const page = pdfDoc.getPages()[0]; // Birinchi sahifani olish
  page.drawImage(qrCodeImage, {
    x: 50, // X koordinatasi
    y: page.getHeight() - qrCodeDims.height - 50, // Y koordinatasi
    width: qrCodeDims.width,
    height: qrCodeDims.height,
  });

  // Yangi PDFni saqlash
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPdfPath, pdfBytes);
}

onMounted(async ()=>{

  const existingPdfPath = 'existing_document.pdf'; // Mavjud PDF fayl yo'li
  const outputPdfPath = 'signed_document.pdf'; // Yangi PDF fayl yo'li
  const qrCodeData = 'https://example.com/signature';
  await createPDFWithQRCode(existingPdfPath, outputPdfPath, qrCodeData);

})
</script>

<template>

</template>

<style scoped>

</style>