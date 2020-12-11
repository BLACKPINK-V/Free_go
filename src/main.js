import Vue from 'vue'
// 导入根组件 App.vue
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/font/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// 导入 axios
import axios from 'axios'

// Vue 原型上挂在 axios  配置基准地址
axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  // 挂在路由
  router,
  // 渲染根组件
  render: h => h(App)
}).$mount('#app')
