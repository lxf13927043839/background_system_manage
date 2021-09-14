import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
import ZkTable from 'vue-table-with-tree-grid'

import VueQuillEditor from 'vue-quill-editor'
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.bubble.css'
import Nprogress from 'nprogress'
// import 'nprogress/nprogress.css'

Vue.use(VueQuillEditor)
// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
// 在request拦截器中，添加.start
axios.interceptors.request.use(config => {
  Nprogress.start()
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在resonpse中添加.done
axios.interceptors.response.use(config => {
  Nprogress.done()
  // console.log(config)
  return config
})
Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.component('tree-table', ZkTable)

// 定义时间过滤，用来格式化时间，这里简单处理
Vue.filter('dateFormat', (date) => {
  date = new Date(date)
  var yyyy = date.getFullYear()
  var mmmm = (date.getMonth() + 1).toString().padStart(2, '0')
  var dd = date.getDate().toString().padStart(2, '0')
  var hh = date.getHours().toString().padStart(2, '0')
  var mm = date.getMinutes().toString().padStart(2, '0')
  var ss = date.getSeconds().toString().padStart(2, '0')

  return `${yyyy}-${mmmm}-${dd} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
