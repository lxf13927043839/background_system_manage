<template>
    <div>
         <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card class="box-card">
            <!-- 搜索框 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" class="input-with-select">
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 订单信息表格区域 -->
            <el-table :data="orderDataList" border stripe style="width: 100%">
                <el-table-column label="序号" type="index"></el-table-column>
                <el-table-column prop="order_number" label="订单编号" width="180">
                </el-table-column>
                <el-table-column prop="order_price" label="订单价格" width="180">
                </el-table-column>
                <el-table-column prop="pay_status" label="是否付款">
                    <template v-slot="scope">
                        <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
                        <el-tag type="success" v-else>已付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_send" label="是否发货"></el-table-column>
                <el-table-column prop="update_time" label="下单时间">
                    <template v-slot="scope">
                        {{ scope.row.update_time | dateFormat }}
                    </template>
                </el-table-column>
                <!-- <el-table-column prop="address" label="操作"> -->
                <!-- 最开始没有使用插槽也渲染出来了，但是打包后就不行,它一定使用 template v-slot="scope" 不然也是不行-->
                <el-table-column label="操作">
                    <template v-slot="scope">
                      <el-button type="primary" icon="el-icon-edit" size="mini" @click="addAddress(scope)"></el-button>
                      <el-tooltip content="查看物流信息" :enterable="false" placement="top">
                        <el-button type="success" icon="el-icon-setting" size="mini" @click="sendProcess"></el-button>
                      </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentPageChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[5, 10, 20, 25]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
        </el-card>
        <el-dialog title="添加地址"
        :visible.sync="addressDialogVisible" width="40%"
        @close="addressClose">
        <!-- 地址表单验证 -->
        <el-form :model="addressFormData" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
            <el-form-item label="详情地址" prop="detailAddress">
                <el-input v-model="addressFormData.detailAddress"></el-input>
            </el-form-item>
            <el-form-item label="省市区" prop="city">
                <el-cascader
                v-model="addressFormData.city"
                :options="cityData"
                :props="addressProps">
                </el-cascader>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addressDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
        </span>
        </el-dialog>
        <!-- 物流信息 -->
        <el-dialog title="物流信息"
        :visible.sync="sendDialogVisible" width="40%">
        <el-timeline>
            <!-- 使用时间线控件 -->
            <el-timeline-item
            v-for="(activity, index) in sendData"
            :key="index"
            :timestamp="activity.time">
              {{activity.context}}
            </el-timeline-item>
        </el-timeline>
        <span slot="footer" class="dialog-footer">
            <el-button @click="sendDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="sendDialogVisible = false">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
import cityData from '../../plugins/citydata.js'
export default {
  data () {
    return {
      orderDataList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      addressDialogVisible: false,
      addressFormData: {
        detailAddress: '',
        city: ''
      },
      rules: {
        detailAddress: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ],
        city: [
          { required: true, message: '请选择省市区', trigger: 'blur' }
        ]
      },
      addressProps: {
        expandTrigger: 'hover',
        label: 'label',
        value: 'value'
      },
      cityData,
      kuaidi: [],
      sendDialogVisible: false,
      // 服务器数据挂了，这里采用静态数据代替
      sendData: [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ]
    }
  },
  created () {
    this.getOrderDataList()
  },
  methods: {
    async getOrderDataList () {
      const { data } = await this.$http.get('orders', { params: this.queryInfo })
      if (data.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      console.log(data.data)
      this.orderDataList = data.data.goods
      this.total = data.data.total
      // console.log(this.total)
    },

    // 分页处理
    handleSizeChange (size) {
      this.queryInfo.pagesize = size
      this.getOrderDataList()
    },
    handleCurrentPageChange (currentPage) {
      this.queryInfo.pagenum = currentPage
      this.getOrderDataList()
    },

    // 添加地址
    addAddress () {
      this.addressDialogVisible = true
    },
    addressClose () {
      this.$refs.ruleForm.resetFields()
    },
    // 发送物流信息，服务器的数据挂了
    async sendProcess () {
      this.sendDialogVisible = true
      // const { data } = await this.$http.get('/kuaidi/1106975712662')
      // if (data.meta.status !== 200) {
      //  return this.$message.error('获取物流信息失败')
      // }
      // console.log(data.data)
      // this.kuaidi = data.data
    }
  }
}
</script>

<style lang="less" scoped>
</style>
