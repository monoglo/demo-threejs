import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import * as three from 'three'

Vue.config.productionTip = false
Vue.prototype.$three = three

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
