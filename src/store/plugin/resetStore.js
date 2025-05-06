
export function resetStoresPlugin({ store, pinia }) {
    pinia.storesToReset = pinia.storesToReset || new Set();
    const skipReset = store.$state?.skipReset || false;
    // add skipReset:true field to store and it will not clear
    if (!skipReset) {
        pinia.storesToReset.add(store);
    }

    if (!pinia.reset) {
        pinia.reset = () => {
            pinia.storesToReset.forEach(store => store.$reset());
        };
    }
}