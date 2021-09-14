<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card class="box-card">
            <!-- 警告区域 -->
            <el-alert
                title="注意：只允许为第三级分类设置相关参数！（这里只允许最后一级，element 组件方便操作）"
                :closable="false" type="warning" show-icon>
            </el-alert>
            <!-- 选择商品分类 -->
            <div class="block">
                <span>选择商品分类：</span>
                <el-cascader
                v-model="selsectCateId"
                :options="cateListData"
                :props="propsCate"
                @change="handleCateChange"></el-cascader>
            </div>
            <!-- 导航分页 -->
            <el-tabs v-model="activeTabsName">
                <!-- 动态参数区域 -->
                <el-tab-pane label="动态参数" name="dynamic">
                    <el-button type="primary" size="mini" :disabled="controlButton" @click="addParams">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyData" style="width: 100%" border>
                      <el-table-column
                        type="expand">
                        <template v-slot="scope">
                          <!-- 渲染 具体描述 -->
                          <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i"
                          @close="handleTagsClose(scope.row, i)" closable class="attr-vals">
                            {{item}}
                          </el-tag>
                          <el-input class="input-new-tag" v-if="scope.row.inputTagVisible"
                          v-model="scope.row.inputTagValue" ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="handleTagInputConfirm(scope.row)"
                          @blur="handleTagInputConfirm(scope.row)"
                          >
                          </el-input>
                          <el-button v-else class="button-new-tag" size="small" @click="showTagInput(scope.row)">+ 添加描述</el-button>
                        </template>
                      </el-table-column>
                      <el-table-column type="index" label="序号"></el-table-column>
                      <el-table-column prop="attr_name" label="参数名称" width="180"></el-table-column>
                      <el-table-column label="操作">
                        <template v-slot="scope">
                          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editParams(scope.row.attr_name, scope.row.attr_id)">编辑</el-button>
                          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row.attr_id)">删除</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                </el-tab-pane>

                <!-- 静态属性面板 -->
                <el-tab-pane label="静态属性" name="static">
                    <el-button type="primary" size="mini" :disabled="controlButton" @click="addParams">添加属性</el-button>
                    <!-- 表格数据 -->
                    <el-table :data="onlyData" style="width: 100%" border>
                      <el-table-column type="expand">
                        <template v-slot="scope">
                          <el-tag v-for="(item, i) in scope.row.attr_vals"
                          :key="i" closable class="attr-vals"
                          @close="handleTagsClose(scope.row, i)">
                            {{item}}
                          </el-tag>
                          <!-- 输入框的上边是放了一个按钮，点击的时候，按钮消失，在nextstick，为input，focus获取焦点 -->
                          <el-input class="input-new-tag"
                          v-if="scope.row.inputTagVisible" v-model="scope.row.inputTagValue"
                          ref="saveTagInput" size="small"
                          @keyup.enter.native="handleTagInputConfirm(scope.row)"
                          @blur="handleTagInputConfirm(scope.row)"
                          ></el-input>
                          <el-button v-else class="button-new-tag" size="small" @click="showTagInput(scope.row)">+ 添加描述</el-button>
                        </template>
                      </el-table-column>
                      <el-table-column type="index" label="序号"></el-table-column>
                      <el-table-column prop="attr_name" label="参数名称" width="180"></el-table-column>
                      <el-table-column label="操作">
                        <template v-slot="scope">
                          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editParams(scope.row.attr_name, scope.row.attr_id)">编辑</el-button>
                          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row.attr_id)">删除</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加参数对话框 -->
        <el-dialog
        :title="'添加' + listenTabsChange"
        :visible.sync="addDialogVisible" width="30%" @close="handleCloseAddDialog">
        <div>
          <!-- 分类名字，用表单来验证 -->
          <el-form :model="addFormData" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
            <el-form-item :label="listenTabsChange+ '：'" prop="attr_name">
              <el-input v-model="addFormData.attr_name"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="postAddFormData">确 定</el-button>
        </span>
        </el-dialog>
        <!-- 修改参数对话框 -->
        <el-dialog
        :title="'修改' + listenTabsChange" :visible.sync="editDialogVisible" width="30%">
        <div>
          <!-- 分类名字，需验证 -->
          <el-form :model="editFormData" :rules="rules" ref="editRuleForm" label-width="100px" class="demo-ruleForm">
            <el-form-item :label="listenTabsChange+ '：'" prop="attr_name">
              <el-input v-model="editFormData.attr_name"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="postEditFormData">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      queryCateInfo: {
        type: 3
      },
      cateListData: [],
      // 分类id
      selsectCateId: [],
      // 级联配置
      propsCate: {
        expandTrigger: 'hover',
        value: 'cat_id',
        children: 'children',
        label: 'cat_name'
      },
      // 默认选择添加参数
      activeTabsName: 'dynamic',
      onlyData: [],
      manyData: [],
      // 添加参数对话框的控制
      addDialogVisible: false,
      // 添加参数或者属性
      addFormData: {
        attr_name: '',
        attr_sel: ''
      },
      // 规则
      rules: {
        attr_name: [
          { required: true, message: '请输入对应名称', trigger: 'blur' }
        ]
      },
      // 编辑对话框
      editDialogVisible: false,
      editFormData: {
        attr_name: '',
        attr_sel: ''
      },
      editAttrId: 0
    }
  },
  created () {
    this.getCateListData()
  },
  methods: {
    async getCateListData () {
      const { data } = await this.$http.get('categories', { params: this.cateListData })
      if (data.meta.status !== 200) {
        this.$message.error('获取分类数据失败')
      }
      // console.log(data.data)
      this.cateListData = data.data
    },

    // 获取only many数据，静态和动态数据，不要写成两个异步的方法去嵌套，这个函数目前不使用
    async getData (option, dataSrc) {
      this.addFormData.attr_sel = this.activeTabsName === 'dynamic' ? 'many' : 'only'
      // 它取最后一个数组值就好
      const { data } = await this.$http.get(`categories/${this.selsectCateId[this.selsectCateId.length - 1]}/attributes`, { params: { sel: option } })
      // console.log(data.data)
      if (data.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      dataSrc = data.data
      console.log(dataSrc)
    },
    async getOnlyManyData () {
      // Vue 无法检测 property 的添加或移除，一次性给完事了。以下的这段代码就有问题
      // this.onlyData = await this.getData('only')
      // this.manyData = await this.getData('many')
      // this.onlyData.forEach(item => {
      //   item.inputTagVisible = false
      //   item.inputTagValue = ''
      //   item.attr_vals = item.attr_vals.split(' ') ? item.attr_vals.split(' ') : []
      // })
      // this.manyData.forEach(item => {
      //   item.attr_vals = item.attr_vals.split(' ') ? item.attr_vals.split(' ') : []
      //   item.inputTagVisible = false
      //   item.inputTagValue = ''
      // })
      // 这里异步不要进行嵌套，重新设计一下，容易出问题，异步要看它的执行顺序
      this.addFormData.attr_sel = this.activeTabsName === 'dynamic' ? 'many' : 'only'
      const { data } = await this.$http.get(`categories/${this.selsectCateId[this.selsectCateId.length - 1]}/attributes`, { params: { sel: 'only' } })
      // console.log(data.data)
      if (data.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      data.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputTagVisible = false
        item.inputTagValue = ''
      })
      this.onlyData = data.data
      // 请求 动态数据
      const { data: res } = await this.$http.get(`categories/${this.selsectCateId[this.selsectCateId.length - 1]}/attributes`, { params: { sel: 'many' } })
      // console.log(data.data)
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputTagVisible = false
        item.inputTagValue = ''
      })
      this.manyData = res.data
    },
    // 级联配置变化
    async handleCateChange () {
      this.getOnlyManyData()
    },

    // 添加参数，属性
    addParams () {
      this.addDialogVisible = true
    },
    handleCloseAddDialog () {
      this.$refs.ruleForm.resetFields()
    },
    // 提交新参数，属性
    async postAddFormData () {
      const { data } = await this.$http.post(`categories/${this.selsectCateId[this.selsectCateId.length - 1]}/attributes`, this.addFormData)
      console.log(data)
      if (data.meta.status !== 201) {
        return this.$message.error('提交参数失败')
      }
      this.$message.success('成功提交数据')
      // 直接把它们俩数据刷新了，本来是只刷新一个就行，为了简单处理
      this.getOnlyManyData()
      this.addDialogVisible = false
    },
    // 编辑分类，属性
    // 这个对话框是不需要经过关闭的处理，每次进来的时候，都会请求数据
    async editParams (name, attrId) {
      this.editDialogVisible = true
      // const { data } = await this.$http.get(`categories/${this.selsectCateId[this.selsectCateId.length - 1]}/attributes/${attriId}`)
      // console.log(data.data)
      // if (data.meta.status !== 200) {
      // return this.$message.error('获取参数失败')
      // }
      // this.editFormData.attr_name = data.data.attr_name
      // 直接通过插槽获取数据
      // console.log(name, attrId)
      this.editFormData.attr_name = name
      this.editAttrId = attrId
    },
    // 删除参数
    async deleteParams (id) {
      const result = await this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result === 'confirm') {
        const { data } = await this.$http.delete(`categories/${this.selsectCateId[this.selsectCateId.length - 1]}/attributes/${id}`)
        if (data.meta.status === 200) {
          this.$message.success('删除成功')
        } else {
          this.$message.error('删除失败')
        }
        this.getOnlyManyData()
      }
    },
    postEditFormData () {
      this.$refs.editRuleForm.validate(async (valid) => {
        if (valid) {
          this.editFormData.attr_sel = this.activeTabsName === 'dynamic' ? 'many' : 'only'
          // console.log(this.editAttrId)
          const { data } = await this.$http.put(`categories/${this.selsectCateId[this.selsectCateId.length - 1]}/attributes/${this.editAttrId}`, this.editFormData)
          console.log(data.data)
          if (data.meta.status !== 200) {
            return this.$message.error('提交编辑参数失败')
          }
          this.getOnlyManyData()
          this.editDialogVisible = false
        } else {
          return this.$message.error('请输入有效名称')
        }
      })
    },
    // tag的添加
    async handleTagInputConfirm (row) {
      const inputValue = row.inputTagValue
      // 输入框一般把前后的空格去除，可能是误操作
      if (inputValue.trim().length <= 0) {
        // 如果是回车的话，这里会执行两次，提示就不能要了
        // this.$message.error('请重新输入有效名称')
        row.inputTagVisible = false
        row.inputTagValue = ''
        return
      }
      var params = {
        // 这里的name要使用原来的名字
        attr_name: row.attr_name,
        attr_sel: row.attr_sel
      }
      row.attr_vals.push(inputValue)
      // 数组使用push能让vue检测到，详情见官方文档，把当前添加后，在去拼接
      params.attr_vals = row.attr_vals.join(' ')
      // console.log(this.selectCateId, row.attr_id)
      const { data } = await this.$http.put(`categories/${this.selectCateId}/attributes/${row.attr_id}`, params)
      console.log(data)
      if (data.meta.status !== 200) {
        return this.$message.error('参数添加失败')
      }
      this.$message.success('参数添加成功')
      row.inputTagVisible = false
      row.inputTagValue = ''
    },
    showTagInput (row) {
      row.inputTagVisible = true
      this.$nextTick(_ => {
        // 获取焦点，否则还要点击input
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    // 删除tags属性
    async handleTagsClose (row, index) {
      // 直接通过key的索引值，删除，再同步到数据库中上
      row.attr_vals.splice(index, 1)
      var params = {
        // 这里的name要使用原来的名字
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      }
      const { data } = await this.$http.put(`categories/${this.selectCateId}/attributes/${row.attr_id}`, params)
      console.log(data)
      if (data.meta.status !== 200) {
        return this.$message.error('参数同步到数据库失败')
      }
      this.$message.success('参数删除成功')
    }
  },
  computed: {
    // 动态控制按钮状态
    controlButton () {
      if (this.selsectCateId.length > 0) {
        return false
      } else {
        return true
      }
    },
    // 监听tabs的切换
    listenTabsChange () {
      return this.activeTabsName === 'dynamic' ? '动态参数' : '静态属性'
    },
    selectCateId () {
      return this.selsectCateId[this.selsectCateId.length - 1]
    }
  }
}
</script>

<style lang="less" scoped>
    .block {
        margin: 15px 0;
    }
    .attr-vals {
      margin-right: 10px;
      margin-bottom: 10px;
    }
    .input-new-tag {
      width: 100px;
    }
</style>
