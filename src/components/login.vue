<template>
  <!-- 登录组件 -->
  <div class="login">
    <div class="login_box">
      <!-- logo区 -->
      <div class="logo"></div>
      <!-- 登录表单区 -->
      <el-form
        label-width="0px"
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-wo"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            type="password"
            prefix-icon="iconfont icon-mima"
            v-model="loginForm.password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      // 表单的验证规则
      loginFormRules: {
        // 验证用户名
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' },
        ],
        // 验证密码
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    // 点击重置按钮重置表单
    resetLoginForm() {
      // console.log(this);
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      // 点击登录时检验表单
      this.$refs.loginFormRef.validate(async (val) => {
        // console.log(val);
        if (!val) {
          return
        }
        // 检验通过发送 axios 请求
        const result = await this.$http.post('login', this.loginForm)
        // console.log(result.data);
        if (result.data.meta.status !== 200) {
          this.$message({
            message: result.data.meta.msg,
            type: 'error',
            offset: 80,
          })
          return
        }
        this.$message({
          message: result.data.meta.msg,
          type: 'success',
          offset: 80,
        })
        // 登录成功之后将 token 保存在 sessionStorage
        // console.log(result);
        // console.log(result.data.data.token);
        window.sessionStorage.setItem('token', result.data.data.token)
        // console.log(this);
        // 编程式导航跳转至后台页面
        this.$router.push('home')
      })
    },
  },
}
</script>

<style lang="less" scoped>
.login {
  height: 100%;
  background-color: #ff6700;

  /* display: flex;
        justify-content: center;
        align-items: center; */
  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 30px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;

    .logo {
      width: 140px;
      height: 140px;
      border: 2px solid #2b4b6b;
      border-radius: 50%;
      background-color: palegreen;
      background: url(../assets/logo.gif) no-repeat 50% 50%;
      background-size: 240px 180px;
      position: absolute;
      left: 50%;
      top: -25%;
      transform: translate(-50%);
      box-shadow: 0 0 10px #ddd;
    }
    form {
      position: absolute;
      top: 50%;
      transform: translateY(-30%);
      box-sizing: border-box;
      .btns {
        display: flex;
        justify-content: space-between;
      }
    }
  }
}
</style>