<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片区域 -->
        <el-card class="box-card">
            <!-- 显示所有角色数据区域  -->
            <el-table :data="rightsData" style="width: 100%" stripe border>
                <el-table-column type="index" label="#">
                </el-table-column>
                <el-table-column prop="authName" label="权限名称">
                </el-table-column>
                <el-table-column prop="path" label="路径">
                </el-table-column>
                <el-table-column prop="level" label="权限列表">
                    <template v-slot="scope">
                        <el-tag type="success" v-if="scope.row.level === '1'">一级</el-tag>
                        <el-tag type="info" v-else-if="scope.row.level === '2'">二级</el-tag>
                        <el-tag type="warning" v-else>三级</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
  data () {
    return {
      rightsData: []
    }
  },
  created () {
    this.getRightsData()
  },
  methods: {
    async getRightsData () {
      const { data } = await this.$http.get('rights/list')
      console.log(data)
      if (data.meta.status === 200) {
        this.rightsData = data.data
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>
