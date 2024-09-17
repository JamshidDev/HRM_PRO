

const fileToBase64 = (file)=>{
        return new Promise((resolve, reject)=>{
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result)
            reader.onerror = (error) => reject(error)
        })
}

const onlyAllowNumber = (value) => !value || /^\d+$/.test(value)

const getMyLocation =()=>{
    return new Promise((resolve, reject)=>{
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition((position)=>{
                resolve({
                    lat:position.coords.latitude,
                    long:position.coords.longitude
                })
            })
        }else{
            console.warn("Geolocation is not supported")
            reject(null)
        }

    })

}








export default {
    fileToBase64,
    onlyAllowNumber,
    getMyLocation,
}