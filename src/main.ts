import { createApp } from 'vue'
// import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router' // <--- 必须引入这个

// 1. 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// app.use(createPinia())
app.use(router) // <--- 必须 Use 一下
// app.use(ElementPlus)

// 2. 配置 locale
app.use(ElementPlus, {
  locale: zhCn,
})
app.mount('#app')