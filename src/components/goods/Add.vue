<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 提示区 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>

      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        :align-center="true"
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="tabPosition"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择器 -->
              <!-- options 指定数据源 -->
              <!-- props 用来指定配置 -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :clearable="true"
                @change="handleChange"
                :props="{
                  expandTrigger: 'hover',
                  value: 'cat_id',
                  label: 'cat_name',
                  children: 'children'
                }"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="value.attr_name"
              :key="value.attr_id"
              v-for="value in manyTabDate"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="value.attr_vals">
                <el-checkbox
                  :key="index"
                  v-for="(item, index) in value.attr_vals"
                  :label="item"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="value.attr_name"
              :key="value.attr_id"
              v-for="value in onlyTabDate"
            >
              <el-input v-model="value.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 图片上传 -->
            <!-- action 图片上传的后台api接口地址 -->
            <!-- on-preview	点击文件列表中已上传的文件时的钩子 -->
            <!-- on-remove	文件列表移除文件时的钩子 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce" />

            <!-- 添加商品按钮 -->
            <el-button class="addBtn" type="primary" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="50%"
    >
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'component_name',
  data() {
    return {
      // 步骤条索引
      activeIndex: 0,
      // tab栏方向
      tabPosition: 'left',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        // 级联选择器选中的 商品分类id 集合
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 富文本编辑器内容 商品介绍
        goods_introduce: '',
        attrs: []
      },
      // 添加商品表单的校验规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      cateList: [],
      // 动态参数列表
      manyTabDate: [],
      // 静态属性列表
      onlyTabDate: [],
      // 上传图片的url 地址
      uploadURL: 'http://localhost:8888/api/private/v1/upload',
      // 图片上传组件的 headerObj 请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览 url 地址
      previewPath: '',
      // 控制图片预览对话框显示
      previewDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList() {
      const res = await this.$http.get('categories')
      // console.log(res)
      if (res.data.meta.status !== 200) {
        return this.$message({
          message: '获取商品分类信息失败!',
          type: 'error',
          duration: 3000
        })
      }
      this.cateList = res.data.data
    },
    // 级联选择器选中项发生变化触发的事件
    handleChange() {
      // console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // tab 标签页切换事件
    beforeTabLeave(activeName, oldActiveName) {
      //   console.log(activeName, oldActiveName)
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message({
          message: '请先选择商品分类!',
          type: 'error',
          duration: 3000
        })
        return false
      }
    },
    // tab 被选中事件 获取参数列表
    async tabClicked() {
      // console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        const res = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'many' } }
        )
        if (res.data.meta.status !== 200) {
          return this.$message({
            message: '获取动态参数列表失败!',
            type: 'error',
            duration: 3000
          })
        }
        // console.log(res.data.data)
        // 将 vals 这一项由字符串变为数组
        res.data.data.forEach(value => {
          value.attr_vals = value.attr_vals ? value.attr_vals.split(' ') : []
        })
        this.manyTabDate = res.data.data
      } else if (this.activeIndex === '2') {
        const res = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'only' } }
        )
        if (res.data.meta.status !== 200) {
          return this.$message({
            message: '获取静态属性列表失败!',
            type: 'error',
            duration: 3000
          })
        }
        // console.log(res.data.data)
        this.onlyTabDate = res.data.data
        // console.log(this.onlyTabDate)
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      // console.log(file)
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // console.log(file)
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2.从 pics 数组中 找到这个图片对应的索引值
      const index = this.addForm.pics.findIndex(item => {
        item.pic === filePath
      })
      // 3.调用数组的 splice 方法把图片信息对象 从 pics 数组中移除
      this.addForm.pics.splice(index, 1)
      // console.log(this.addForm)
    },
    // 监听图片上传成功
    handleSuccess(response) {
      // console.log(response)
      // 1.拼接得到一个图片信息对象
      const picinfo = { pic: response.data.tmp_path }
      // 2.将图片信息对像 push 到图片数组
      this.addForm.pics.push(picinfo)
      // console.log(this.addForm)
    },
    // 添加商品按钮
    add() {
      // console.log(this.addForm)
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message({
            message: '请填写必要的表单项!',
            type: 'error',
            duration: 3000
          })
        }
        // 执行添加的业务逻辑
        // lodash  cloneDeep(obj) 深复制
        // 将数组以逗号分割的字符串
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTabDate.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTabDate.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // console.log(form)

        // 发起请求添加商品
        // 商品的名称 必须是唯一的
        const res = await this.$http.post(`goods`, form)
        // console.log(res)
        if (res.data.meta.status !== 201) {
          return this.$message({
            message: '添加商品 数据失败!',
            type: 'error',
            duration: 3000
          })
        }

        this.$message({
          message: '添加商品数据成功!',
          type: 'success',
          duration: 3000
        })
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 获取三级分类id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 0 10px;
}
.el-checkbox {
  margin: 5px 10px !important;
}
.previewImg {
  width: 100%;
}
.addBtn {
  margin-top: 30px;
}
</style>
