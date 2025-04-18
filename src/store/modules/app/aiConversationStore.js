import {defineStore} from "pinia"
import i18n from "@/i18n/index.js"
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import {useAccountStore} from "@/store/modules/index.js"
import {useAppSetting} from "@/utils/index.js"
import { v4 as uuidv4 } from 'uuid';


const {t} = i18n.global
export const useAIConversationStore = defineStore('AIConversationStore', {
    state: () => ({
        loading: false,
        payload: {
            question: null,
        },
        controller:new AbortController(),
        renderResponse:'',
        messages:[
            {
                id:1,
                bot:true,
                text:"Salom. Men HRM Pro Bot.",
                photo:'https://lineone.piniastudio.com/images/avatar/avatar-12.jpg',
            },
        ],

        questionList:[],
        questionLoading:false,
        questionParams:{
            page:1,
            per_page:10,
            date:null,
        },
        totalQuestion:0,

        list:[],
        listLoading:false,
        listParams:{
            page:1,
            per_page:20,
        },
        totalList:0,

        historyMode:false,
        archiveMessage:[],
        scrollHeight:0,
        scrollContainer:null,

    }),
    actions: {
        async conversation(data) {
            let token = localStorage.getItem(useAppSetting.tokenKey) || null;
            const index = this.messages.length
            this.loading = true

            try {
                const response = await fetch('http://192.168.136.78:8004/api/v1/ai/lawyer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'text/event-stream',
                        'Authorization': 'Bearer '+token,
                    },
                    mode: 'cors',
                    body: JSON.stringify(data), // payload ma'lumotlari
                    signal: this.controller.signal,
                });
                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let fullText = '';


                function normalizeMarkdown(md) {
                    return md.replace(/([^\n])(-\s)/g, '$1\n$2');
                }


                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.replace('data: ', '');

                            if (data === '[DONE]') {
                                return;
                            }else{
                                fullText += data;
                            }

                        }
                    }
                    this.messages[index] =  {
                        id:1,
                        bot:true,
                        text:DOMPurify.sanitize(marked.parse(normalizeMarkdown(fullText))),
                        photo:'https://lineone.piniastudio.com/images/avatar/avatar-12.jpg',
                    }
                    await nextTick()
                }
                // this.messages[index] =  {
                //     id:1,
                //     bot:true,
                //     text:DOMPurify.sanitize(marked.parse(fullText)),
                //     photo:'https://lineone.piniastudio.com/images/avatar/avatar-12.jpg',
                // }

            } catch (error) {
                console.error('❌ Stream xatosi:', error);
            } finally {
                this.loading = false;
            }
        },

       async sendMessage(e){
            const store = useAccountStore()
            e.preventDefault()
           if(this.payload.question.trim().length>0 && !this.loading){
               const data = {
                   ...this.payload,
               }
               this.messages.push({
                   id:12,
                   bot:false,
                   text:this.payload.question,
                   photo:store.userPhoto,
               })
               this.payload.question = ''

               await  this.conversation(data)

           }

        },

        questions(infinity=false){
            this.questionLoading = true
            $ApiService.aiConversationService.questions({params:this.questionParams}).then(async(res)=>{
                let data = []
                res.data.data.data.reverse().forEach((item)=>{
                    data.push(this.generateMessage(item.question, false, item))
                    data.push(this.generateMessage(item.answer, true, item))
                })

                this.totalQuestion = res.data.data.total

                this.messages = infinity? [...data, ...this.messages,] : data

                await nextTick()
                this.scrollContainer.scrollTo({
                    top:infinity? (this.scrollContainer.scrollHeight - this.scrollHeight) : this.scrollContainer.scrollHeight,
                })

            }).finally(()=>{
                this.questionLoading = false
            })
        },
        getList(infinity=false){
            this.listLoading = true
            $ApiService.aiConversationService.list({params:this.listParams}).then((res)=>{
                const data = res.data.data.data
                this.totalList = res.data.data.pagination.total
                this.list = infinity? [...this.list,...data,] : data
            }).finally(()=>{
                this.listLoading = false
            })
        },
        generateMessage(message, isBot, item){
            const store = useAccountStore()
            return{
                    id:item.id,
                    bot:isBot,
                    text: DOMPurify.sanitize(marked.parse(message)),
                    photo:isBot? ' ' : store.userPhoto,
                    like:item.like,
                    key:uuidv4(),
            }
        },
        like(id, isLike){
            const index = this.messages.findIndex(v=>v.id === id)
            this.messages[index+1].like = isLike? 2:3
            $ApiService.aiConversationService.like({id,data:{like:isLike? 2:3}}).then((res)=>{
                console.log(res.data)
            })
        }





    }
})