// dateMaskPlugin.js
const dateMaskPlugin = {
    install(app) {
        app.mixin({
            mounted() {
                this.$nextTick(() => {
                    if (this.$el && this.$el?.querySelectorAll) {
                        const formatDateInput = (value, prevValue) => {
                            let cleaned = value.replace(/\D/g, ''); // Faqat raqamlarni olish
                            if (cleaned.length > 8) cleaned = cleaned.slice(0, 8); // Maksimum 8 raqam (ddMMyyyy)

                            let formatted = '';
                            let day = cleaned.slice(0, 2);
                            let month = cleaned.slice(2, 4);
                            let year = cleaned.slice(4);

                            // Kun uchun maxsus qoida
                            if (day) {
                                const firstDayDigit = parseInt(day[0]);
                                if (firstDayDigit > 3) {
                                    // Agar birinchi raqam 3 dan katta bo‘lsa, 0 qo‘shib ikki raqamli qilish
                                    day = `0${firstDayDigit}`;
                                } else if (day.length === 2 && (day < 1 || day > 31)) {
                                    return prevValue; // Kun 01-31 chegarasidan chiqsa, avvalgi qiymat
                                }
                            }

                            // Oy uchun maxsus qoida
                            if (month) {
                                const firstMonthDigit = parseInt(month[0]);
                                if (firstMonthDigit > 1) {
                                    // Agar birinchi raqam 1 dan katta bo‘lsa, 0 qo‘shib ikki raqamli qilish
                                    month = `0${firstMonthDigit}`;
                                } else if (month.length === 2 && (month < 1 || month > 12)) {
                                    return prevValue; // Oy 01-12 chegarasidan chiqsa, avvalgi qiymat
                                }
                            }

                            // Formatlash (avtomatik nuqta qo‘shish)
                            if (cleaned.length > 4 && year) {
                                formatted = `${day}.${month}.${year}`;
                            } else if (cleaned.length > 2 && month) {
                                formatted = `${day}.${month}`;
                            } else if (day) {
                                formatted = day;
                            }

                            return formatted;
                        };

                        const inputs = this.$el.querySelectorAll('.n-date-picker .n-input__input-el');
                        inputs.forEach((el) => {
                            let previousValue = '';

                            el.addEventListener('input', function (event) {
                                const currentValue = event.target.value;
                                const formattedValue = formatDateInput(currentValue, previousValue);

                                if (formattedValue !== currentValue) {
                                    event.target.value = formattedValue;
                                    event.target.dispatchEvent(new Event('input', { bubbles: true }));
                                }

                                if (formattedValue.length === 10) {
                                    const [day, month, year] = formattedValue.split('.').map(Number);
                                    const isValid = validateDate(day, month, year);
                                    if (!isValid) {
                                        event.target.value = previousValue;
                                        event.target.dispatchEvent(new Event('input', { bubbles: true }));
                                    }
                                }

                                previousValue = formattedValue; // Har doim yangilash
                            });

                            el.addEventListener('blur', function (event) {
                                const value = event.target.value;
                                if (value.length === 10) {
                                    const [day, month, year] = value.split('.').map(Number);
                                    if (!validateDate(day, month, year)) {
                                        event.target.value = previousValue;
                                        event.target.dispatchEvent(new Event('input', { bubbles: true }));
                                    }
                                }
                            });
                        });
                    }
                });
            },
        });
    },
};

function validateDate(day, month, year) {
    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

export default dateMaskPlugin;