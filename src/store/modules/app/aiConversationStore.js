import {defineStore} from "pinia"
import i18n from "@/i18n/index.js"
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import {useAccountStore} from "@/store/modules/index.js"


const {t} = i18n.global
export const useAIConversationStore = defineStore('AIConversationStore', {
    state: () => ({
        loading: false,
        list: [],
        payload: {
            question: null,
        },
        controller:new AbortController(),
        fullResponse:'',
        renderResponse:'',
        messages:[
            {
                id:1,
                bot:true,
                text:"Salom. Men HRM Pro Bot.",
                photo:'https://lineone.piniastudio.com/images/avatar/avatar-12.jpg',
            },
        ],

    }),
    actions: {
        async conversation(data) {
            const index = this.messages.length
            this.fullResponse = ''
            this.loading = true

            try {
                const response = await fetch('http://192.168.136.78:8004/api/v1/ai/lawyer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'text/event-stream',
                        'Authorization': 'Bearer 144|8xK9ihCsoSlnpqDSXckv8Ah8AXpQ9VG7Nlaw07EHf4b85ec1'
                    },
                    mode: 'cors',
                    body: JSON.stringify(data), // payload ma'lumotlari
                    signal: this.controller.signal,
                });
                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let fullText = '';

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
                            }
                            fullText += data;
                        }
                    }
                    this.renderResponse = DOMPurify.sanitize(marked.parse(fullText));
                    this.messages[index] =  {
                        id:1,
                        bot:true,
                        text:DOMPurify.sanitize(marked.parse(fullText)),
                        photo:'https://lineone.piniastudio.com/images/avatar/avatar-12.jpg',
                    }
                }

            } catch (error) {
                console.error('❌ Stream xatosi:', error);
            } finally {
                this.loading = false;
            }
        },

       async sendMessage(e){
            const store = useAccountStore()
            e.preventDefault()
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




    }
})