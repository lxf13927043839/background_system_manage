<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card class="box-card">
            <el-button type="primary" @click="addCategories">添加分类</el-button>
            <!-- 另外导入的table，element自带的不好用，索引值那块不好控制 -->
            <tree-table class="tree-table"
            ref="table"
            sum-text="sum"
            :data="categoriesData"
            :columns="columns"
            :stripe="props.stripe"
            :border="props.border"
            :show-header="props.showHeader"
            :show-summary="props.showSummary"
            :show-row-hover="props.showRowHover"
            :show-index="props.showIndex"
            :tree-type="props.treeType"
            :is-fold="props.isFold"
            :expand-type="props.expandType"
            :selection-type="props.selectionType">
            <!-- 是否有效 列 -->
            <template v-slot:isvalid="scope">
              <i v-if="!scope.row.cat_deleted" class="el-icon-circle-check" style="color: green;"></i>
              <i v-else class="el-icon-circle-close" style="color: red;"></i>
            </template>
            <template v-slot:level="scope_level">
              <el-tag v-if="scope_level.row.cat_level===0">一级</el-tag>
              <el-tag v-else-if="scope_level.row.cat_level===1" type="success">二级</el-tag>
              <el-tag v-else type="warning">三级</el-tag>
            </template>
            <template v-slot:operate="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="changeCateName(scope.row.cat_id, scope.row.cat_name)">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)">删除</el-button>
            </template>
            </tree-table>
            <!-- 分页功能 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1, 3, 8, 10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加分类的对话框 -->
        <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="30%"
        @close="handleCloseAddCateDialog">
        <div>
          <!-- 分类名字，用表单进行验证 -->
          <el-form :model="cateFormData" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
            <el-form-item label="分类名称：" prop="cat_name">
              <el-input v-model="cateFormData.cat_name"></el-input>
            </el-form-item>
          </el-form>
          <!-- 三级联动选择，父级分类 -->
          <div class="block">
            <span>选择父类：</span>
            <el-cascader v-model="selectParentId" :options="parentCate" :props="parentCateProps"
              @change="handleChange">
            </el-cascader>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="postAddCate">确 定</el-button>
        </span>
        </el-dialog>
        <!-- 编辑分类的名字 -->
        <el-dialog title="修改分类" :visible.sync="changeCateDialogVisible" width="30%">
        <!-- 分类名字，用表单验证 -->
        <el-form :model="changeCateData" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="changeCateData.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="changeCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="postChangeCate">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 3
      },
      // 保存所有的总条数
      total: 0,
      // 添加分类对话框
      addCateDialogVisible: false,
      // 分类表单数据,设置得跟API一致，等等就不用做其他
      cateFormData: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      rules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类
      parentCate: [],
      // 级联选择器的配置
      parentCateProps: {
        expandTrigger: 'hover',
        // 不要写成cate
        label: 'cat_name',
        children: 'children',
        value: 'cat_id',
        checkStrictly: true
      },
      // 级联选中的数据
      selectParentId: [],

      // 修改分类对话框
      changeCateDialogVisible: false,
      changeCateData: {
        cat_name: ''
      },
      // 保存要修改的分类id，表单规则
      changeCateId: 0,
      categoriesData: [],
      props: {
        stripe: true,
        border: true,
        showHeader: true,
        showRowHover: true,
        showIndex: true,
        treeType: true,
        isFold: true,
        expandType: false,
        selectionType: false
      },
      // 一个对象是一列的配置，table的配置
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板的名称
          template: 'isvalid'
        },
        {
          label: '排序',
          type: 'template',
          template: 'level'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operate'
        }
      ]
    }
  },
  created () {
    this.getCategoriesData()
  },
  methods: {
    async getCategoriesData () {
      const { data } = await this.$http.get('categories', { params: this.queryInfo })
      // console.log(data.data)
      if (data.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.categoriesData = data.data.result
      this.total = data.data.total
    },

    // 分页功能函数,一页显示多少数据
    handleSizeChange (newValue) {
      this.queryInfo.pagesize = newValue
      this.getCategoriesData()
    },
    handleCurrentChange (newValue) {
      // console.log(newValue)
      this.queryInfo.pagenum = newValue
      this.getCategoriesData()
    },

    // 获取父级分类
    async getParentCate () {
      // const { data } = await this.$http.get('categories', { params: { type: 2, pagenum: 1, pagesize: 3 } })
      const { data } = await this.$http.get('categories', { params: { type: 2 } })
      console.log(data.data)
      if (data.meta.status !== 200) {
        return this.$message.error('获取父级分类失败')
      }
      this.parentCate = data.data
    },
    // 添加分类
    addCategories () {
      this.addCateDialogVisible = true
      // 获取父级的数据
      this.getParentCate()
    },
    // 获取选中的父级id
    handleChange (value) {
      // console.log(value)
    },

    // 提交分类
    async postAddCate () {
      if (this.cateFormData.cat_name === '') {
        this.$message.error('请输入分类名称')
        return
      }
      if (this.selectParentId.length > 0) {
        this.cateFormData.cat_pid = this.selectParentId[this.selectParentId.length - 1]
        this.cateFormData.cat_level = this.selectParentId.length
      }
      // console.log(this.cateFormData)
      // 提交数据
      const { data } = await this.$http.post('categories', this.cateFormData)
      if (data.meta.status !== 201) {
        return this.$message.error('提交分类数据失败')
      }
      // console.log(data.data)
      this.$message.success('提交分类数据成功')
      // 刷新数据
      this.getCategoriesData()
      this.addCateDialogVisible = false
    },
    // 处理添加分类对话框，关闭后的处理
    handleCloseAddCateDialog () {
      // 使用.length清空数组的话，在下次进来的一瞬间
      this.selectParentId = []
      this.cateFormData.cat_pid = 0
      this.cateFormData.cat_level = 0
      this.$refs.ruleForm.resetFields()
    },

    // 删除分类功能
    async deleteCate (id) {
      const data = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (data === 'confirm') {
        const { data } = await this.$http.delete('categories/' + id)
        // console.log(data)
        if (data.meta.status === 200) {
          this.$message.success('删除分类成功')
        } else {
          this.$message.error('删除分类失败')
        }
        this.getCategoriesData()
      }
    },

    // 增加修改分类名称功能
    changeCateName (id, name) {
      // console.log(id, name)
      this.changeCateDialogVisible = true
      this.changeCateData.cat_name = name
      this.changeCateId = id
    },
    // 修改分类名字
    async postChangeCate () {
      const { data } = await this.$http.put('categories/' + this.changeCateId, this.changeCateData)
      if (data.meta.status !== 200) {
        return this.$message.error('修改分类失败')
      }
      this.$message.success('修改分类成功')
      this.getCategoriesData()
      this.changeCateDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
  .tree-table {
    margin: 15px 0px;
  }
</style>
