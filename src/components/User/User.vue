<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片识图去 -->
    <el-card>
      <!-- 搜索与添加区 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <!-- 添加用户按钮 -->
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- 整行的数据 -->
            <!-- {{ scope.row }} -->
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="userStatusChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-tooltip content="编辑" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip content="删除" placement="top" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeUser(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip content="角色分配" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="this.queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
      >
      </el-pagination>
      <!-- 添加用户对话框 -->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClose"
      >
        <!-- 内容主体区 -->
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="70px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑用户对话框 -->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClose"
      >
        <!-- 内容主体区 -->
        <el-form
          :model="editForm"
          :rules="editFormRules"
          ref="editFormRef"
          label-width="70px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (regEmail.test(value)) {
        // 合法邮箱
        callback()
        return
      }
      callback(new Error('邮箱格式不正确'))
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}$/
      if (regMobile.test(value)) {
        // 合法手机号
        callback()
        return
      }
      callback(new Error('手机号不存在'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 每页显示几条数据
        pagesize: 10,
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示
      addDialogVisible: false,
      // 控制编辑用户对话框显示
      editDialogVisible: false,
      // 添加用户表单
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      // 添加用户表单验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名长度在 3 到 10 个字符',
            trigger: 'blur',
          },
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur',
          },
          {
            min: 6,
            max: 15,
            message: '密码长度在 6 到 15 个字符',
            trigger: 'blur',
          },
        ],
        email: [
          {
            required: true,
            message: '请输入邮箱地址',
            trigger: 'blur',
          },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur',
          },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      // 查询到的用户信息对象
      editForm: {},
      // 编辑用户表单验证规则
      editFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名长度在 3 到 10 个字符',
            trigger: 'blur',
          },
        ],
        email: [
          {
            required: true,
            message: '请输入用户邮箱地址',
            trigger: 'blur',
          },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          {
            required: true,
            message: '请输入用户手机号',
            trigger: 'blur',
          },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 请求后台  用户列表数据
    async getUserList() {
      const res = await this.$http.get('users', { params: this.queryInfo })
      if (res.status != 200) {
        this.$message.error('获取用户列表失败!')
        return
      }
      this.userList = res.data.data.users
      this.total = res.data.data.total
      // console.log(res)
      // console.log(res.data.data)
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听 switch 开关的状态改变
    async userStatusChange(info) {
      // console.log(info)
      const res = await this.$http.put(
        `users/${info.id}/state/${info.mg_state}`
      )
      // console.log(res)
      // console.log(info.mg_state)
      if (res.status !== 200) {
        info.mg_state = !info.mg_state
        this.$message.error('更新用户状态失败!')
        return
      }
      this.$message.success('更新用户状态成功!')
    },
    // 对话框关闭事件
    addDialogClose() {
      // 选中 添加表单的 ref 引用
      this.$refs.addFormRef.resetFields()
    },
    // 点击添加按钮  添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        // console.log(valid)
        if (!valid) {
          return
        }
        // 可以发起网络请求
        const res = await this.$http.post('users', this.addForm)
        console.log(res)
        if (res.data.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('创建用户成功!')
        this.addDialogVisible = false
        // 重新获取用户列表
        this.getUserList()
      })
    },
    // 展示编辑用户对话框
    async showEditDialog(id) {
      // console.log(id)
      const res = await this.$http.get(`users/${id}`)
      // console.log(res)
      if (res.data.meta.status !== 200) {
        this.$message.error('查询用户信息失败!')
        return
      }
      this.editForm = res.data.data
      // console.log(this.editForm)
      this.editDialogVisible = true
    },
    // 编辑用户对话框关闭事件
    editDialogClose() {
      // 选中 添加表单的 ref 引用
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮提交修改用户数据
    editUser() {
      this.$refs.editFormRef.validate(async (valid) => {
        console.log(valid)
        if (!valid) {
          return
        }
        // 可以发起修改用户信息网络请求
        const res = await this.$http.put(`users/${this.editForm.id}`, {
          username: this.editForm.username,
          email: this.editForm.email,
          mobile: this.editForm.mobile,
        })
        console.log(res)
        if (res.data.meta.status !== 200) {
          this.$message.error('更新用户信息失败!')
          return
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getUserList()
        // 提示修改成功
        this.$message.success('更新用户数据成功!')
      })
    },
    // 根据 ID 删除用户数据
    async removeUser(id) {
      // 询问用户是否删除
      const res = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => {
        return err
      })
      // 如果用户确认删除  则返回值为字符串 confim
      // 如果用户取消删除  则返回值为字符串 cancel
      // console.log(res)
      if (res !== 'confirm') {
        return this.$message.info('已取消删除!')
      }
      // console.log('确认删除')
      const request = await this.$http.delete(`users/${id}`)
      console.log(request)
      if (request.data.meta.status !== 200) {
        return this.$message.error('删除用户失败!')
      }
      // 刷新数据列表
      this.getUserList()
      // 提示修改成功
      this.$message.success('删除用户数据成功!')
    },
  },
}
</script>
<style lang="less" scoped>
</style>