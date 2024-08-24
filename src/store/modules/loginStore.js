
import {defineStore} from "pinia"

export const useLoginStore = defineStore("loginStore", {
    state:()=>({
        login:null,
        password:null,
        loading:false,
    }),
    getters:{

    },
    actions:{

        _auth(){
            $ApiService.authService._login({data:{
                    username:this.login,
                    password:this.password,
                }}).then((res)=>{
                console.log(res.data)
            }).catch((err)=>{
                console.log(err)
            })
        }




    }
})