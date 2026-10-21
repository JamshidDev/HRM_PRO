# Live chat — rasm o'lchami va xira ko'rinishi (backend uchun)

> **Maqsad:** Telegram'dagi kabi, qabul qiluvchi rasmni **yuklab olmasdan turib** uning haqiqiy
> shaklini (uzun rasm — uzun) va xira ko'rinishini ko'rsin; to'liq rasm faqat ⬇ bosilganda yuklansin.
>
> **Frontend tayyor.** Backend'dan faqat 3 ta maydonni saqlab, qaytarish kerak.

## 1. Yuborish — `POST /conversations/{id}/files` (multipart)

Rasm yuborilganda frontend endi qo'shimcha 3 ta maydon yuboradi (har so'rovda bitta fayl):

| Maydon   | Turi     | Misol                              | Izoh                                        |
|----------|----------|------------------------------------|---------------------------------------------|
| `width`  | integer  | `1080`                             | Asl rasm kengligi (px)                      |
| `height` | integer  | `1920`                             | Asl rasm balandligi (px)                    |
| `thumb`  | string   | `data:image/jpeg;base64,/9j/4AAQ…` | ≈20px'li juda kichik JPEG, **odatda < 1 KB** |

- Faqat `type = image` uchun keladi; ovoz/fayl uchun yuborilmaydi.
- Maydonlar **ixtiyoriy** — kelmasa xabar avvalgidek saqlanadi (eski klientlar buzilmaydi).
- `thumb` uchun cheklov tavsiya etiladi: masalan, 4 KB dan katta bo'lsa — saqlamaslik.

## 2. Saqlash

`messages` jadvaliga (yoki fayl/attachment jadvaliga) 3 ta nullable ustun:

```
width   INT  NULL
height  INT  NULL
thumb   TEXT NULL   -- data URL (base64), < 4 KB
```

## 3. Qaytarish

Xabar qaytadigan **hamma joyda** shu 3 maydon bo'lsin (`null` bo'lishi mumkin):

- `POST /conversations/{id}/files` javobi
- `GET /conversations/{id}/messages` (ro'yxat, `before_id` / `after_id` bilan ham)
- `GET /conversations/{id}/media?type=image` (profil "Rasmlar" tabi)
- socket hodisalari: `chat:message`, `chat:message:updated`
- forward qilingan xabar — asl rasmning `width/height/thumb` i nusxalansin

```json
{
  "id": 512,
  "type": "image",
  "file_url": "https://…/chat/abc.jpg",
  "file_name": "photo.jpg",
  "file_size": 845213,
  "width": 1080,
  "height": 1920,
  "thumb": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ…"
}
```

## 4. Frontend nima qiladi

- `width/height` bo'lsa — rasm katagi shu nisbatda chiziladi (maks. 280×320 px), yuklanishidan oldin ham.
- `thumb` bo'lsa — katak ichida xira (blur) ko'rinish va ⬇ tugmasi; ⬇ bosilganda to'liq rasm progress bilan yuklanadi.
- Maydonlar bo'lmasa (eski xabarlar) — avvalgidek: shaffof kulrang katak + ⬇.

Fayllar: `src/pages/chat/live-chat/ui/ChatImage.vue`, `ui/imageCache.js`, `ui/format.js` (`makeImageThumb`),
`api/realChatApi.js`, `api/mapper.js`, `store/modules/chat/liveChatStore.js`.
