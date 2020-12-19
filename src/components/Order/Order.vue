<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getOrdersList"
          >
            <!-- 搜索按钮 -->
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrdersList"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表区 -->
      <el-table border stripe :data="ordersList">
        <el-table-column type="index"></el-table-column>
        <el-table-column
          label="订单编号"
          prop="order_number"
          width="300px"
        ></el-table-column>
        <el-table-column
          label="订单价格"
          prop="order_price"
          width="75px"
        ></el-table-column>
        <el-table-column label="是否付款" width="100px" prop="pay_status">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '0'" type="danger"
              >未付款</el-tag
            >
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="是否发货"
          prop="is_send"
          width="75px"
        ></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.order_id)"
            ></el-button>
            <el-button
              type="success"
              size="mini"
              icon="el-icon-location"
              @click="showProgressBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="editForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
            @change="addressChanged"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 物流 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="50%"
    >
    <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import cityData from './citydata'
export default {
  name: 'component_name',
  data() {
    return {
      // 查询参数
      queryInfo: {
        query: '',
        // 当前页
        pagenum: 1,
        // 每页显示条数
        pagesize: 5
      },
      // 总条数
      total: 0,
      // 订单列表
      ordersList: [],
      // 控制编辑对话框显示
      editDialogVisible: false,
      // 编辑功能数据列表
      editForm: {
        address1: [],
        address2: ''
      },
      // 要编辑的订单id
      editId: 0,
      // 编辑功能校验规则
      editFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      // 城市数据
      cityData: cityData,
      // 控制物流对话框显示
      progressDialogVisible: false,
      // 物流信息
      progressInfo: []
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    // 获取订单数据列表
    async getOrdersList() {
      const res = await this.$http.get('orders', { params: this.queryInfo })
      console.log(res)
      if (res.data.meta.status !== 200) {
        return this.$message({
          message: '获取订单列表数据失败!',
          type: 'error',
          duration: 3000
        })
      }
      this.total = res.data.data.total
      this.ordersList = res.data.data.goods
    },
    // 页面显示信息条数改变
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getOrdersList()
    },
    // 当前页码数改变
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getOrdersList()
    },
    // 点击编辑按钮
    showEditDialog(order_id) {
      this.editId = order_id
      this.editDialogVisible = true
    },
    // 编辑对话框关闭重置表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 级联选择器改变
    addressChanged() {
      console.log(this.editForm.address1)
    },
    // 物流按钮点击事件
    async showProgressBox() {
      const res = await this.$http.get(`/kuaidi/1106975712662`)
      // console.log(res);
      if ((res.data.meta, status !== 200)) {
        return this.$message({
          message: '获取物流信息失败!',
          type: 'error',
          duration: 3000
        })
      }
      this.progressInfo = res.data.data
      this.progressDialogVisible = true
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
