import { createApp } from 'vue'
// import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router' // <--- 必须引入这个

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// app.use(createPinia())
app.use(router) // <--- 必须 Use 一下
app.use(ElementPlus)

app.mount('#app')