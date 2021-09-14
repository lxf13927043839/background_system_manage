<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card class="box-card">
            <div id="main" style="width: 600px;height:400px;"></div>
        </el-card>
    </div>
</template>

<script>
// 导入echart
import echarts from 'echarts'
import _ from 'loadsh'
export default {
  data () {
    return {
      reportData: {},
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created () {
  },
  async mounted () {
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))
    // 使用刚指定的配置项和数据显示图表。
    // 注意数据一定要在这里进行请求才行
    const { data } = await this.$http.get('reports/type/1')
    if (data.meta.status !== 200) {
      return this.$message.error('获取报表数据失败')
    }
    this.reportData = data.data
    const result = _.merge(this.reportData, this.options)
    myChart.setOption(result)
    // 用来测试异步的顺序
    console.log(2)
  },
  methods: {
    // 由于要在mounted中合并数据，所以不能单独异步去执行
    // async getReportData () {
    // const { data } = await this.$http.get('reports/type/1')
    // if (data.meta.status !== 200) {
    //  return this.$message.error('获取报表数据失败')
    // }
    // this.reportData = data.data
    // console.log(1)
    // }
  }
}
</script>

<style lang="less" scoped>
</style>
