<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 警告区 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>

      <!-- 选择商品分类区 -->
      <el-row class="cate_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类级联选择框 -->
          <!-- options 指定数据源 -->
          <!-- props 用来指定配置 -->
          <el-cascader
            class="el-cascader"
            v-model="selectCateKeys"
            :clearable="true"
            :options="cateList"
            size="small "
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children'
            }"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab 页签区 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button
            type="primary"
            size:mini
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTabData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag
                  :key="index"
                  v-for="(value, index) in scope.row.attr_vals"
                  closable
                  @close="handleClose(index, scope.row)"
                  >{{ value }}</el-tag
                >
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="shoeEditDialog(scope.row.attr_id)"
                  >修改</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性按钮 -->
          <el-button
            type="primary"
            size:mini
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTabData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag
                  :key="index"
                  v-for="(value, index) in scope.row.attr_vals"
                  closable
                  @close="handleClose(index, scope.row)"
                  >{{ value }}</el-tag
                >
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="shoeEditDialog(scope.row.attr_id)"
                  >修改</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addFormRoles" ref="addFormRef">
        <el-form-item :label="titleText" prop="attr_name">
          <el-col :span="20">
            <el-input v-model="addForm.attr_name" size="small "></el-input>
          </el-col>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRoles" ref="editFormRef">
        <el-form-item :label="titleText" prop="attr_name">
          <el-col :span="20">
            <el-input v-model="editForm.attr_name" size="small "></el-input>
          </el-col>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'component_name',
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框双向绑定的数组
      selectCateKeys: [],
      // 被激活的页签的名称
      activeName: 'many',
      // 动态属性数据
      manyTabData: [],
      // 静态参数数据
      onlyTabData: [],
      // 控制添加对话框显示
      addDialogVisible: false,
      // 添加参数表单数据
      addForm: {
        attr_name: ''
      },
      // 添加参数表单数据验证规则
      addFormRoles: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      // 控制编辑对话框显示
      editDialogVisible: false,
      // 修改表单的数据对象
      editForm: {},
      // 修改表单的数据验证规则
      editFormRoles: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    // 获取所有商品分类数据
    this.getCateList()
  },
  methods: {
    // 请求商品分类数据
    async getCateList() {
      const res = await this.$http.get('categories')
      // console.log(res)
      if (res.data.meta.status !== 200) {
        return this.$message({
          message: '获取商品分类数据失败!',
          type: 'error',
          duration: 3000
        })
      }
      this.cateList = res.data.data
    },
    // 级联选择框选中项改变事件
    async handleChange() {
      // console.log(this.selectCateKeys)
      this.manyTabData = []
      this.onlyTabData = []
      this.getParamsData()
    },
    // tab 页签点击事件
    async handleTabClick() {
      // console.log(this.activeName)
      this.getParamsData()
    },
    // 封装一个 获取参数的列表数据方法
    async getParamsData() {
      // 证明选中的不是三级分类
      if (this.selectCateKeys.length !== 3) {
        this.selectCateKeys = []
        return
      }
      // 证明选中的是三级分类
      // console.log(this.selectCateKeys)
      // 根据所选分类的id 和当前的面板 获取对应的参数
      const res = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      // console.log(res)
      if (res.data.meta.status !== 200) {
        return this.$message({
          message: '获取参数失败!',
          type: 'error',
          duration: 3000
        })
      }
      res.data.data.forEach(value => {
        // 如果 attr_vals 为空字符串 则返回一个空数组 反之以空格打成数组
        value.attr_vals = value.attr_vals ? value.attr_vals.split(' ') : []
        // 控制文本框显示
        value.inputVisible = false
        // 文本框中输入的值
        value.inputValue = ''
      })
      console.log(res.data.data)

      // 判断数据是动态属性的还是静态参数的
      if (this.activeName === 'many') {
        this.manyTabData = res.data.data
      } else {
        this.onlyTabData = res.data.data
      }
    },
    // 添加对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加对话框确定事件
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const res = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        console.log(res)
        if (res.data.meta.status !== 201) {
          return this.$message({
            message: '添加参数失败!',
            type: 'error',
            duration: 3000
          })
        }
        this.$message({
          message: '添加参数成功!',
          type: 'success',
          duration: 3000
        })
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 点击按钮显示编辑对话框
    async shoeEditDialog(attr_id) {
      // 根据id 查询当前参数的信息
      const res = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      console.log(res)
      if (res.data.meta.status !== 200) {
        return this.$message({
          message: '获取当前参数分类信息失败!',
          type: 'error',
          duration: 3000
        })
      }
      this.editForm = res.data.data
      this.editDialogVisible = true
    },
    // 修改对话框关闭事件
    editDialogClosed() {
      // 重置表单
      this.$refs.editFormRef.resetFields()
    },
    // 修改对话框确定事件
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const res = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        // console.log(res)
        if (res.data.meta.status !== 200) {
          return this.$message({
            message: '更新参数失败!',
            type: 'error',
            duration: 3000
          })
        }
        this.$message({
          message: '更新参数成功!',
          type: 'success',
          duration: 3000
        })
        this.editDialogVisible = false
        this.getParamsData()
      })
    },
    // 根据id 删除参数
    async removeParams(attr_id) {
      const res = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
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
      // 用户取消删除
      if (res !== 'confirm') {
        return this.$message({
          message: '已取消删除!',
          type: 'info',
          duration: 3000
        })
      }
      // 删除业务
      const resquest = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      // console.log(resquest)
      if (resquest.data.meta.status !== 200) {
        return this.$message({
          message: '删除参数失败!',
          type: 'error',
          duration: 3000
        })
      }
      this.$message({
        message: '删除参数成功!',
        type: 'success',
        duration: 3000
      })
      this.getParamsData()
    },
    // 添加Tag文本框失去焦点事件
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 发起请求 保存这次修改
      this.saveAttrVals(row)
    },
    // 发起网络请求 将对 attr_vals 的操作保存到数据库中
    async saveAttrVals(row) {
      // 发起请求 保存这次修改
      const res = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      console.log(res)
      if (res.data.meta.status !== 200) {
        return this.$message({
          message: '更新标签数据失败!',
          type: 'error',
          duration: 3000
        })
      }
      this.$message({
        message: '更新标签数据成功!',
        type: 'success',
        duration: 3000
      })
    },
    // 点击按钮显示输入文本框
    showInput(row) {
      row.inputVisible = true
      // 输入框自动获得焦点
      // $nextTick 方法的作用 就是当页面上的元素被重新渲染之后 才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除Tag 标签
    async handleClose(index, row) {
      console.log(index)
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 如果按钮需要被禁用 则返回 true 否则返回 false
    isBtnDisabled() {
      if (this.selectCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的 id
    cateId() {
      if (this.selectCateKeys.length === 3) {
        return this.selectCateKeys[2]
      }
      return null
    },
    // 控制添加对话框标题
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>
<style lang="less" scoped>
.cate_opt {
  margin: 20px 0;
}
.el-cascader {
  width: 25% !important;
}
.el-tag {
  margin: 5px 10px;
}
.input-new-tag {
  width: 120px !important;
}
</style>
