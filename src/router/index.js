import Vue from 'vue'
import VueRouter from 'vue-router'
// 把路由改造成懒加载的形式
// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import HomeWelcome from '../components/HomeWelcome.vue'
const Login = () => import(/* webpackChunkName: "Login_Home_HomeWelcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "Login_Home_HomeWelcome" */ '../components/Home.vue')
const HomeWelcome = () => import(/* webpackChunkName: "Login_Home_HomeWelcome" */ '../components/HomeWelcome.vue')

// import Users from '../components/users/Users.vue'
// import Rights from '../components/rights/Rights.vue'
// import Roles from '../components/rights/Roles.vue'
const Users = () => import(/* webpackChunkName: "Users_Right_Roles" */ '../components/users/Users.vue')
const Rights = () => import(/* webpackChunkName: "Users_Right_Roles" */ '../components/rights/Rights.vue')
const Roles = () => import(/* webpackChunkName: "Users_Right_Roles" */ '../components/rights/Roles.vue')

// import ShopCategories from '../components/shop_manager/ShopCategories.vue'
// import Params from '../components/shop_manager/Params.vue'
const ShopCategories = () => import(/* webpackChunkName: "ShopCategories_Params" */ '../components/shop_manager/ShopCategories.vue')
const Params = () => import(/* webpackChunkName: "ShopCategories_Params" */ '../components/shop_manager/Params.vue')

// import GoodsList from '../components/shop_manager/GoodsList.vue'
// import AddGood from '../components/shop_manager/AddGood.vue'
const GoodsList = () => import(/* webpackChunkName: "ShopCategories_Params" */ '../components/shop_manager/GoodsList.vue')
const AddGood = () => import(/* webpackChunkName: "ShopCategories_Params" */ '../components/shop_manager/AddGood.vue')

// import Order from '../components/order/Order.vue'
// import DataReport from '../components/DataReport.vue'
const Order = () => import(/* webpackChunkName: "ShopCategories_Params" */ '../components/order/Order.vue')
const DataReport = () => import(/* webpackChunkName: "ShopCategories_Params" */ '../components/DataReport.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/home/welcome',
    children: [
      { path: '/home/welcome', component: HomeWelcome },
      { path: '/users', component: Users },
      // 菜单路径是服务渲染的，不能随便更改
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: ShopCategories },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/addGood', component: AddGood },
      { path: '/orders', component: Order },
      { path: '/reports', component: DataReport }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 路由导航守卫
// to 将要访问的路径
// from 代表从哪个路径跳转来的
// next 是一个函数，表示放行，next()放行，next('/xx')，去往xx路径
router.beforeEach((to, from, next) => {
  // 注意是to.path，写to的话，会导致程序溢出
  if (to.path === '/login') return next()
  var token = window.sessionStorage.getItem('token')
  // 没有token的话，就回去登录页面，这里是简单处理的，在实际中，这里还要把token给服务器去验证
  // 这里不能用token 的值是 null
  if (!token) return next('/login')
  next()
})

export default router
