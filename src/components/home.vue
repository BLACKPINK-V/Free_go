<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="" />
        <span>运顺泰物流 后台管理系统</span>
        <i>v1.0</i>
      </div>
      <el-button type="danger" @click="logout">退出登录</el-button>
    </el-header>
    <!-- 页面主题区 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleColse">|||</div>
        <!-- 侧边栏菜单区 -->
        <el-menu
          background-color="#313743"
          text-color="#fff"
          active-text-color="#638ECA"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="value.id + ''"
            v-for="value in menulist"
            :key="value.id"
          >
            <!-- 一级菜单的模板区 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[value.id]"></i>
              <!-- 文本 -->
              <span>{{ value.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + item.path"
              v-for="item in value.children"
              :key="item.id"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ item.authName }}</span>
              </template></el-menu-item
            >
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主题 -->
      <el-main>
        <!-- 给子路由的占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 菜单数据
      menulist: [],
      iconsObj: {
        125: 'iconfont icon-jiaosequnti',
        103: 'iconfont icon-shezhi',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao',
      },
      isCollapse: false,
    }
  },
  created() {
    this.getMenuList()
  },
  methods: {
    logout() {
      // 删除 本地token
      window.sessionStorage.clear()
      // 编程式导航跳转至登录页面
      this.$router.push('/login')
    },
    // 获取所有菜单
    async getMenuList() {
      const request = await this.$http.get('menus')
      console.log(request.data.data)
      this.menulist = request.data.data
    },
    // 点击按钮切换菜单的折叠展开
    toggleColse() {
      this.isCollapse = !this.isCollapse
    },
  },
}
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
  .el-header {
    background-color: #363d40;
    padding-left: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    div {
      flex: 2;
      width: 100px;
      display: flex;
      align-items: center;
      img {
        width: 40px;
        height: 30px;
        background-color: red;
      }
      span {
        padding-left: 20px;
        font-size: 24px;
        font-weight: 800;
        color: #fff;
      }
      i {
        color: #fff;
        font-size: 20px;
      }
    }
    .el-button {
      height: 40px;
    }
  }

  .el-aside {
    background-color: #313743;
    .toggle-button {
      background-color: #4a5064;
      font-size: 10px;
      line-height: 24px;
      color: #fff;
      text-align: center;
      letter-spacing: 0.4em;
      cursor: pointer;
    }
    .el-menu {
      border-right: none;
      .iconfont {
        margin-right: 10px;
        font-size: 20px;
      }
    }
  }

  .el-main {
    background-color: #e9eef3;
  }
}
</style>