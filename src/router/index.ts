import {createRouter, createWebHashHistory} from 'vue-router'

import Login from '../view/Login.vue'
import ChatView from '../view/ChatView.vue'
import Register from "../view/Register.vue";
import GameView from "../view/GameView.vue";


const routes = [
    {
      path: "/",
      component: Login,
    },
    {
        path: "/registration",
        component: Register,
    },
    {
        path: '/chat',
        component: ChatView,
    },
    {
        path: '/game',
        component: GameView,
    }

]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router