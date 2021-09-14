<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card class="box-card">
            <!-- 搜索框区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable @clear="getGoodsListData">
                        <el-button slot="append" icon="el-icon-search" @click="searchList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addGood">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- 商品列表区域 -->
            <el-table :data="goodsListData" border style="width: 100%">
                <el-table-column label="序号" type="index"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称"></el-table-column>
                <el-table-column prop="goods_price" label="商品价格（元）" width="100"></el-table-column>
                <el-table-column prop="goods_number" label="商品数量" width="100"></el-table-column>
                <el-table-column prop="add_time" label="创建时间" width="170">
                    <template v-slot="scope">
                        {{ scope.row.add_time | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                    <template v-slot="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGood(scope.row.goods_id)"></el-button>
                        <!-- <pre>{{scope.row}}</pre> -->
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <div class="block">
                <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[10, 15, 20, 25]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                background>
                </el-pagination>
            </div>
        </el-card>
    </div>
</template>

<script>
export default {
  data () {
    return {
      goodsListData: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0
    }
  },
  created () {
    this.getGoodsListData()
  },
  methods: {
    async getGoodsListData () {
      const { data } = await this.$http.get('goods', { params: this.queryInfo })
      if (data.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      this.goodsListData = data.data.goods
      this.total = data.data.total
      // console.log(this.goodsListData, this.total)
    },

    // 分页处理函数
    handleCurrentChange (currentPage) {
      this.queryInfo.pagenum = currentPage
      this.getGoodsListData()
    },
    handleSizeChange (currentSize) {
      this.queryInfo.pagesize = currentSize
      this.getGoodsListData()
    },

    // 搜索列表
    searchList () {
      this.getGoodsListData()
    },

    // 删除商品
    async deleteGood (id) {
      const result = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      console.log(id)
      if (result === 'confirm') {
        const { data } = await this.$http.delete('goods/' + id)
        if (data.meta.status === 200) {
          this.$message.success('删除商品成功')
          this.getGoodsListData()
        } else {
          this.$message.error('删除商品失败')
        }
      }
    },

    // 增加商品页面，跳转过去
    addGood () {
      this.$router.push('/goods/addGood')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
