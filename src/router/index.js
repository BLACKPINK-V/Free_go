import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "../components/login.vue"
import Home from "../components/home.vue"
import Welcome from "../components/Welcome"



Vue.use(VueRouter)

const router = new VueRouter({
  // 路由规则
  routes: [
    { path: '/login', component: Login },
    { path: '/', redirect: '/login' },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome }
      ]
    }
  ]

})
// 拦截路由导航守卫  路由实例 添加 beforeEach 导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数  表示放行
  // next()  放行   next('/login') 强制跳转
  // 如果用户访问登录页面
  if (to.path === '/login') {
    // 放行
    next()
    return
  }
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有 token
  if (!tokenStr) {
    alert('请先登录！')
    // 强制跳转到 登录页面
    next('/login')
    return
  }
  next()
})


export default router
