

export default {
    install(app) {
        app.mixin({
            mounted() {
                this.$nextTick(() => {
                    if (this.$el && this.$el?.querySelectorAll) {
                        const formatInput = (value) => {
                            return value.split('').map((char, index, array) => {
                                if (char === "'" && (array[index - 1].toString().toLowerCase() === 'o' || array[index - 1].toString().toLowerCase() === 'g')) {
                                    return "’";
                                }
                                return char;
                            }).join('');
                        };
                        const inputs = this.$el.querySelectorAll('.n-input__input-el');
                        inputs.forEach(el => {
                            el.addEventListener('input', function(event) {
                                const formattedValue = formatInput(event.target.value);
                                if (formattedValue !== event.target.value) {
                                    event.target.value = formattedValue;
                                    event.target.dispatchEvent(new Event('input', { bubbles: true }));
                                }
                            });
                        });
                    }
                });
            }
        });
    }
};