// Dashboard foizlari bir xil ko'rinishda: 1 kasr xonasi, vergul bilan («83,2»).
// `FigStackedBar` ustunidagi yozuv ham shunday — karta ichida «83%» va «83,2 %» aralashmasin.
export const percentOf = (part, total) => (total ? Math.round((part / total) * 1000) / 10 : 0)
export const percentText = (part, total) => String(percentOf(part, total)).replace('.', ',')
