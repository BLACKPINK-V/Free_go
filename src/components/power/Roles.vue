<template>
  <div class="">
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片识图 -->
    <el-card>
      <!-- 添加角色按钮区 -->
      <el-row>
        <el-col :span="12">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="rolesList" stripe border>
        <!-- 折叠展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', v1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(value1, v1) in scope.row.children"
              :key="value1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag
                  type=""
                  closable
                  @close="removeRight(scope.row, value1.id)"
                  >{{ value1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级、三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环 嵌套渲染二级权限 -->
                <el-row
                  :class="[v2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(value2, v2) in value1.children"
                  :key="value2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRight(scope.row, value2.id)"
                      >{{ value2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 通过 for 循环 嵌套渲染三级权限 -->
                    <el-col>
                      <el-tag
                        type="warning"
                        v-for="value3 in value2.children"
                        :key="value3.id"
                        closable
                        @close="removeRight(scope.row, value3.id)"
                        >{{ value3.authName }}</el-tag
                      >
                    </el-col>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"> </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" prop="level">
          <!-- 操作列表 -->
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger "
              icon="el-icon-delete"
              size="mini"
              @click="removeRole(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning "
              icon="el-icon-setting"
              size="mini"
              @click="shoeSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色对话框 -->
      <el-dialog
        title="添加角色"
        :visible.sync="addDialogVisible"
        width="40%"
        @close="addDialogClose"
      >
        <!-- 内容主体区 -->
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="80px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRles">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑角色对话框 -->
      <el-dialog title="添加角色" :visible.sync="editDialogVisible" width="40%">
        <!-- 内容主体区 -->
        <el-form
          :model="editForm"
          :rules="editFormRules"
          ref="editFormRef"
          label-width="80px"
          @close="editDialogClose"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoles">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限对话框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setDialogVisible"
        width="50%"
        @close="setRightDialogClose"
      >
        <!-- 树形控件 -->
        <el-tree
          :data="rightList"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defkeys"
          ref="treeRef"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'component_name',
  data() {
    return {
      rolesList: [],
      // 添加角色对话框显示
      addDialogVisible: false,
      // 添加用户表单
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加用户表单验证规则
      addFormRules: {
        roleName: [{ required: true, message: '请输入角色名', trigger: 'blur' }]
      },
      // 根据 ID 查询到的角色
      editForm: {},
      // 控制编辑角色对话框展示
      editDialogVisible: false,
      // 编辑角色表单验证规则
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' }
        ],
        roleDesc: [{ required: false }]
      },
      // 控制分配权限对话框展示
      setDialogVisible: false,
      // 权限树
      rightList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点 ID 值数组
      defkeys: [],
      // 即将分配权限的角色ID
      roleId: ''
    }
  },
  created() {
    this.getRoles()
  },
  methods: {
    // 获取角色列表
    async getRoles() {
      const res = await this.$http.get('/roles')
      if (res.data.meta.status !== 200) {
        return this.$message({
          message: '获取角色数据失败!',
          type: 'error',
          duration: 3000
        })
      }
      this.rolesList = res.data.data
      //   console.log(res)
    },
    // 添加角色对话框关闭事件
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加角色按钮事件
    addRles() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const res = await this.$http.post('/roles', this.addForm)
        console.log(res)
        if (res.data.meta.status !== 201) {
          this.$message.error('创建角色失败')
        }
        this.$message.success('创建角色成功!')
        this.addDialogVisible = false
        // 重新获取用户列表
        this.getRoles()
      })
    },
    // 编辑角色按钮事件
    async showEditDialog(id) {
      //   console.log(id)
      const res = await this.$http.get(`roles/${id}`)
      // console.log(res)
      if (res.data.meta.status !== 200) {
        this.$message.error('查询角色信息失败!')
        return
      }
      this.editForm = res.data.data
      this.editForm.roleDesc =
        res.data.data.roleDesc == ' ' ? '' : res.data.data.roleDesc
      //   console.log(this.editForm)
      this.editDialogVisible = true
    },
    // 编辑角色对话框关闭事件
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑角色确定事件
    editRoles() {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) {
          return
        }
        // 可以发起修改用户信息网络请求
        const res = await this.$http.put(`roles/${this.editForm.roleId}`, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc == '' ? ' ' : this.editForm.roleDesc
        })
        console.log(res)
        if (res.data.meta.status !== 200) {
          this.$message.error('更新用户信息失败!')
          return
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getRoles()
        // 提示修改成功
        this.$message.success('更新用户数据成功!')
      })
    },
    // 删除角色事件
    async removeRole(id) {
      //   console.log(id)
      // 询问用户是否删除
      const res = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => {
        return err
      })
      // 如果用户确认删除  则返回值为字符串 confim
      // 如果用户取消删除  则返回值为字符串 cancel
      // console.log(res)
      if (res !== 'confirm') {
        return this.$message.info('已取消删除!')
      }
      // console.log('确认删除')
      const request = await this.$http.delete(`roles/${id}`)
      //   console.log(request)
      if (request.data.meta.status !== 200) {
        return this.$message.error('删除角色失败!')
      }
      // 刷新数据列表
      this.getRoles()
      // 提示修改成功
      this.$message.success('删除角色数据成功!')
    },
    // 根据 ID 删除对应的权限
    async removeRight(role, rightId) {
      // 弹框提示是否删除
      const res = await this.$confirm(
        '此操作将取消此用户的该项权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => {
        return err
      })
      console.log(res)
      if (res !== 'confirm') {
        return this.$message({
          message: '已取消删除',
          type: 'info',
          duration: 3000
        })
      }
      const request = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      console.log(request)
      if (request.data.meta.status !== 200) {
        return this.$message({
          message: '删除权限失败!',
          type: 'error',
          duration: 3000
        })
      }
      this.$message({
        message: '取消权限成功!',
        type: 'success',
        duration: 3000
      })
      // 重新调用获取角色权限会刷新页面，不建议
      // this.getRoles()
      // 给角色权限数据重新赋值
      role.children = request.data.data
    },
    // 点击分配权限按钮展示对话框
    async shoeSetRightDialog(role) {
      // 保存要分配权限的角色ID
      this.roleId = role.id
      // 获取所有权限数据
      const res = await this.$http.get(`rights/tree`)
      // console.log(res)
      if (res.data.meta.status !== 200) {
        return this.$message({
          message: '获取权限列表失败!',
          type: 'error',
          duration: 3000
        })
      }
      this.rightList = res.data.data

      // 递归获取三级节点的 id
      this.getLeafKeys(role, this.defkeys)

      this.setDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id 并保存到 defkeys 数组中
    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包括 children 属性 则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(value => {
        this.getLeafKeys(value, arr)
      })
    },
    // 分配权限对话框关闭事件
    setRightDialogClose() {
      // 清空默认勾选三级权限数组中的 id
      this.defkeys = []
      // console.log(this.defkeys)
    },
    // 分配权限对话框确定事件
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      const idStr = keys.join(',')
      // console.log(idStr)
      const res = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      })
      // console.log(res)
      if (res.data.meta.status !== 200) {
        return this.$message({
          message: '分配权限失败!',
          type: 'error',
          duration: 3000
        })
      }
      this.$message({
        message: '分配权限成功!',
        type: 'success',
        duration: 3000
      })
      this.setDialogVisible = false
      this.getRoles()
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 8px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
