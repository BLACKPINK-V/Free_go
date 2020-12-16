<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片识图去 -->
    <el-card>
      <!-- 添加区 -->
      <el-row>
        <el-col :span="4">
          <!-- 添加分类按钮 -->
          <el-button type="primary" @click="addCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 分类表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text=""
        border
        class="tree-table"
      >
        <!-- 是否有效模板 -->
        <template slot="isok" slot-scope="scope">
          <i v-if="scope.row.cat_deleted === false" class="el-icon-success"></i>
          <i v-else class="el-icon-error"></i>
        </template>
        <!-- 排序模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
          >
            二级
          </el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作模板 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCate(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 6, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateFrom"
        :rules="addCateFromRules"
        ref="addCateFromRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateFrom.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- 级联选择器 -->
          <!-- options 指定数据源 -->
          <!-- props 用来指定配置 -->
          <el-cascader
            v-model="selectKeys"
            :options="parentCateList"
            :collapse-tags="true"
            size="small "
            :clearable="true"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children',
              checkStrictly: true
            }"
            @change="parentCatechanged"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%">
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'component_name',
  data() {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 6
      },
      // 商品分类数据列表
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          // 表示 将当前列定义为模板列
          type: 'template',
          // 表示这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示 将当前列定义为模板列
          type: 'template',
          // 表示这一列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示 将当前列定义为模板列
          type: 'template',
          // 表示这一列使用的模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类对话框展示
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateFrom: {
        // 将要添加的分类名称
        cat_name: '',
        // 分级分类ID
        cat_pid: 0,
        // 分类层级  默认添加一级
        cat_level: 0
      },
      // 添加分类的校验规则
      addCateFromRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 选中的父级分类的id 数组
      selectKeys: [],
      // 控制编辑分类对话框展示
      editDialogVisible: false,
      // 查询到的分类数据
      editCateForm: {},
      // 编辑分类校验规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入商品分类名', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据列表
    async getCateList() {
      const res = await this.$http.get(`categories`, { params: this.querInfo })
      //   console.log(res)
      if (res.data.meta.status !== 200) {
        return this.$message({
          message: '获取商品分类数据失败!',
          type: 'error',
          duration: 3000
        })
      }
      // this.$message({
      //   message: '获取商品分类数据成功!',
      //   type: 'success',
      //   duration: 3000
      // })
      // 把数据列表赋值给 cateList
      this.cateList = res.data.data.result
      this.total = res.data.data.total
    },
    // 监听 pagesize 改变事件 每页显示数据条数
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听页码值 改变事件
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击添加分类按钮事件
    addCateDialog() {
      // 先获取父级分类列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const res = await this.$http.get('categories', { params: { type: 2 } })
      // console.log(res)
      if (res.data.meta.status !== 200) {
        return this.$message({
          message: '获取父级分类数据失败!',
          type: 'error',
          duration: 3000
        })
      }
      this.parentCateList = res.data.data
    },
    // 级联选择器选择项发生变化触发的事件
    parentCatechanged() {
      console.log(this.selectKeys)
      // 如果 selectKeys 数组中的 length 大于0 证明选中了父级分类
      // 反之 说明没有选中任何父级分类
      if (this.selectKeys.length > 0) {
        // 父级分类的 id
        this.addCateFrom.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        // 当前分类的等级
        this.addCateFrom.cat_level = this.selectKeys.length
      } else {
        // 父级分类的 id
        this.addCateFrom.cat_pid = 0
        // 当前分类的等级
        this.addCateFrom.cat_level = 0
      }
    },
    // 监听添加分类对话框关闭事件  重置表单数据 清空父级id数组
    addCateDialogClosed() {
      this.$refs.addCateFromRef.resetFields()
      this.selectKeys = []
      this.addCateFrom.cat_level = 0
      this.addCateFrom.cat_pid = 0
    },
    // 添加分类确定按钮事件
    addCate() {
      this.$refs.addCateFromRef.validate(async valid => {
        if (!valid) {
          return
        }
        const res = await this.$http.post('categories', this.addCateFrom)
        console.log(res)
        if (res.data.meta.status !== 201) {
          return this.$message({
            message: '添加商品分类失败!',
            type: 'error',
            duration: 3000
          })
        }
        this.$message({
          message: '添加商品分类成功!',
          type: 'success',
          duration: 3000
        })
      })
      this.addCateDialogVisible = false
      this.getCateList()
    },
    // 编辑分类按钮事件
    async showEditCate(id) {
      const res = await this.$http.get(`categories/` + id)
      console.log(res)
      if (res.data.meta.status !== 200) {
        return this.$message({
          message: '获取分类数据失败!',
          type: 'error',
          duration: 3000
        })
      }
      this.editCateForm = res.data.data
      this.editDialogVisible = true
    },
    // 编辑分类确定事件
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) {
          return
        }
        // 可以发起修改用户信息网络请求
        const res = await this.$http.put(
          `categories/${this.editCateForm.cat_id}`,
          {
            cat_name: this.editCateForm.cat_name
          }
        )
        console.log(res)
        if (res.data.meta.status !== 200) {
          this.$message.error('更新商品分类信息失败!')
          return
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getCateList()
        // 提示修改成功
        this.$message.success('更新商品分类数据成功!')
      })
    },
    // 根据 ID 删除商品分类数据
    async removeCate(id) {
      // 询问用户是否删除
      const res = await this.$confirm(
        '此操作将永久删除该商品分类, 是否继续?',
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
      const request = await this.$http.delete(`categories/${id}`)
      console.log(request)
      if (request.data.meta.status !== 200) {
        return this.$message.error('删除商品分类失败!')
      }
      // 刷新数据列表
      this.getCateList()
      // 提示修改成功
      this.$message.success('删除商品分类数据成功!')
    }
  }
}
</script>
<style lang="less" scoped>
.el-icon-success {
  color: green;
}
.el-icon-error {
  color: red;
}
.tree-table {
  margin-top: 20px;
}
.el-popper {
  top: 50%;
}
</style>
