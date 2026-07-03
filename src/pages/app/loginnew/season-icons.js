// O'Z IKONKALARINGIZNI SHU YERGA QO'YING.
// Fayllarni `public/season/` papkasiga joylashtiring (masalan: public/season/winter-1.png),
// so'ng pastdagi massivlarga ildiz-nisbiy yo'l bilan qo'shing: '/season/winter-1.png'.
// Har bir fasl uchun bir nechta ikonka qo'yish mumkin — SeasonEffect'da har bir zarracha
// ular orasidan tasodifiy tanlanadi. Massiv bo'sh qolsa, o'sha fasl uchun abstrakt CSS
// shakl (doira/gulbarg/barg) ishlatiladi va logo ustidagi nishonda hech narsa chiqmaydi.
export const SEASON_ICONS = {
  spring: ['/season/spring-1.png'],
  summer: ['/season/summer-1.png', '/season/summer-2.png'],
  autumn: ['/season/autumn-1.png', '/season/autumn-2.png'],
  winter: ['/season/winter-1.png']
}
