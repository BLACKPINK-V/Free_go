<template lang="">
    <div>
        Home 组件
        <el-button type="danger" @click="logout">退出</el-button>
    </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    logout() {
      // 删除 本地token
      window.sessionStorage.clear()
      // 编程式导航跳转至登录页面
      this.$router.push('/login')
    },
  },
}
</script>

<style lang="less" scoped>
</style>