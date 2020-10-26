import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/rocks',
    name: 'ThreeJSRocks',
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/ThreeJSRocks.vue')
  },
  {
    path: '/lab',
    name: 'Lab',
    component: () => import(/* webpackChunkName: "lab" */ '../views/Lab.vue')
  },
  {
    path: '/chixi',
    name: 'ChixiMap',
    component: () => import(/* webpackChunkName: "lab" */ '../views/ChixiMap.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
