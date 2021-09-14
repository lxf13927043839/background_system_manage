<template>
<!-- 首页 -->
    <el-container>
      <!-- 头部区域 -->
        <el-header>
          <!-- logo -->
          <div>
            <img src="../assets/set.jpg">
            <span>后台管理系统</span>
          </div>
          <el-button type="info" @click="btnExit">退出</el-button>
        </el-header>
        <el-container>
          <!-- 侧边区域 -->
            <el-aside :width="isCollapse?'64px':'200px'">
              <div class="btn-collapse" @click="toggleCollapse">|||</div>
              <!-- 导航菜单栏，可以展开，收缩，这是它组件自带的，我们通过属性控制就ok -->
              <el-menu
                :default-active="$route.path"
                class="el-menu-vertical-demo"
                background-color="#545c64"
                text-color="#fff"
                active-text-color="#409eff"
                :unique-opened="true"
                :collapse-transition="false"
                :router="true"
                :collapse="isCollapse">
                <el-submenu :index="item.id + ''" v-for="(item) in asideData" :key="item.id">
                  <template slot="title">
                    <i :class="iconsObj[item.id]"></i>
                    <span>{{ item.authName }}</span>
                  </template>
                  <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id">
                    <template slot="title">
                      <!-- 图标 -->
                      <i class="el-icon-menu"></i>
                      <!-- 文本 -->
                      <span>{{ subItem.authName }}</span>
                    </template>
                  </el-menu-item>
                </el-submenu>
              </el-menu>
            </el-aside>
            <!-- 中间展示内容区域，导航栏菜单的所有页面都在这展示出来 -->
            <el-main>
              <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
  data () {
    return {
      asideData: [],
      // 这里的数据有别的方式的能进行动态绑定的吗，这样子是写死的了，目前来看似乎没有办法。
      // 这里的数字是后台返回来导航菜单的名字，它们各自的id，根据id来选择对应的图标
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false
    }
  },
  created () {
    this.getAsideData()
  },
  methods: {
    btnExit () {
      this.$confirm('是否退出系统?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '退出成功!'
        })
        // 退出的时候，需要把token清除了
        window.sessionStorage.clear('token')
        this.$router.push('/login')
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消退出'
        })
      })
    },
    async getAsideData () {
      const { data } = await this.$http.get('menus')
      if (data.meta.status === 200) {
        this.asideData = data.data
        // console.log(data.data)
      }
    },
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
  .el-container {
    height: 100%;
    .el-header {
      background-color: #373d41;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-left: 0px;
      > div {
        display: flex;
        align-items: center;
        img {
          width: 70px;
          height: 70px;
          border-radius: 50%;
        }
        span {
          color: #fff;
          font-size: 20px;
          margin-left: 20px;
        }
      }
    }
    .el-aside {
      background-color: #333744;
    }
    .el-main {
      background-color: #eaedf1;
    }
    .iconfont {
      margin-right: 10px;
    }
    .el-menu {
      border: none;
    }
    .btn-collapse {
      background-color: #4A5064;
      color: #fff;
      text-align: center;
      font-size: 10px;
      height: 20px;
      line-height: 20px;
      letter-spacing: 0.2em;
    }
  }
</style>
