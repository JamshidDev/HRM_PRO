

export const navigations = [
    {
        index:1,
        label:'HRM',
        path:'/hrm',
        icon:'bx bx-id-card',
        children:[
            {
                parentIndex:1,
                label:'Korxonalar',
                path:'/hrm/organizations',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:1,
                label:'Dashboard',
                path:'/hrm/dashboard',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:1,
                label:"Xodimlar",
                path:'/hrm/worker',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:1,
                label:"Struktura",
                path:'/hrm/structure',
                icon:'bx bx-message-rounded-dots',
                children:[
                    {
                        label:"Viloyatlar",
                        path:'/hrm/structure/regions',
                        icon:'bx bx-git-commit',
                    },
                    {
                        label:"Tumanlar",
                        path:'/hrm/structure/districts',
                        icon:'bx bx-git-commit',
                    },
                    {
                        label:"Davlatlar",
                        path:'/hrm/structure/country',
                        icon:'bx bx-git-commit',
                    },
                ]
            },
            {
                parentIndex:1,
                label:'Buyruqlar',
                path:'/contact-chat',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:1,
                label:'Lavozimlar',
                path:'/contact-chat',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:1,
                label:'Oylik hisobot',
                path:'/contact-chat',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
        ]
    },
    {
        index:2,
        label:'Chat',
        path:'/chat',
        icon:'bx bx-message-dots',
        children:[
            {
                parentIndex:2,
                label:'Organization cadry',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:2,
                label:'Private chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:2,
                label:'Group chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
        ]
    },
    {
        index:3,
        label:'Doc Flow',
        path:'/document',
        icon:'bx bx-message-rounded-dots',
        children:[
            {
                parentIndex:3,
                label:'Organization cadry',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:3,
                label:'Private chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:3,
                label:'Group chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
        ]
    },
    {
        index:4,
        label: 'LMS',
        path: '/learn-student',
        icon: 'bx bxs-graduation',
        children:[
            {
                parentIndex:4,
                label:'Organization cadry',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:4,
                label:'Private chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:4,
                label:'Group chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
        ]
    },
    {
        index:5,
        label:'Face ID',
        path:'/face-id',
        icon:'bx bx-face',
        children:[
            {
                parentIndex:5,
                label:'Organization cadry',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:5,
                label:'Private chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:5,
                label:'Group chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
        ]
    },
    {
        index:6,
        label:'Admin',
        path:'/cadry',
        icon:'bx bx-shield-quarter',
        children:[
            {
                parentIndex:6,
                label:'Organization cadry',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:6,
                label:'Private chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:6,
                label:'Group chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
        ]
    },
]