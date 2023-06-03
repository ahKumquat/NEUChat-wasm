import {createRouter, createWebHashHistory} from 'vue-router'

import Login from '../view/Login.vue'
import ChatView from '../view/ChatView.vue'
import Register from "../view/Register.vue";
// import VideoChatView from '../view/VideoChatView.vue'
// import VideoSelectionView from '../view/VideoSelectionView.vue'

const routes = [
    {
      path: "/",
      component: Login,
    },
    {
        path: "/register",
        component: Register,
    },
    {
        path: '/chat',
        component: ChatView,
    },
    // {
    //     path: "/videoChat",
    //     component: VideoChatView,
    // },
    // {
    //     path: "/videoSelection",
    //     component: VideoSelectionView,
    // }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router