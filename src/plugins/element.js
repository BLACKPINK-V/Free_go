import Vue from 'vue'
// 按需导入
import { Button, Form, FormItem, Input, Message } from 'element-ui'
// Message  弹框组件


Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 全局挂载 Message
Vue.prototype.$message = Message