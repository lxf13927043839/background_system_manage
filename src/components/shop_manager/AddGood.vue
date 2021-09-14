<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card class="box-card">
            <!-- 消息提示 -->
            <el-alert title="消息提示的文案" type="info" center show-icon :closable="false">
            </el-alert>
            <!-- 步骤条 -->
            <el-steps :space="200" :active="stepIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="信息属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- 基本信息区域，表单来进行验证 -->
            <el-form :model="goodFormData" :rules="rules" ref="goodRuleForm" label-width="100px" class="demo-ruleForm" label-position="top">
                <!-- tabs标签页，它是可以配置成左边的。要选择父类，才能够进入下一个选项 -->
                <el-tabs :tab-position="'left'" v-model="stepIndex" :before-leave="handleBeforeLeave" @tab-click="handleTabClick">
                    <!-- 这里的name要错开一下，假如第一个是1，那么你还没有填完信息，步骤就提前完成了，这样是不行的 -->
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="goodFormData.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="goodFormData.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="goodFormData.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="goodFormData.goods_number" type="number"></el-input>
                        </el-form-item>
                        <!-- 级联设置 -->
                        <el-form-item label="商品分类">
                            <el-cascader
                                v-model="selectCateId"
                                :options="cateData"
                                :props="goodProps"
                                @change="handleCateChange">
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="1">
                        <el-form-item :label="item.attr_name" v-for="(item, i) in manyData" :key="i">
                            <!-- 多个勾选框绑定到同一个数组的情景,这个是比较合适的 -->
                            <!-- 点击后消失了，跟v-model有关系，因为没选上，会从数组中去除，v-for跟它用的是同个数组 -->
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox border :label="label" v-for="(label, index) in item.attr_vals" :key="index"></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="attr.attr_name" v-for="(attr) in onlyData" :key="attr.attr_id">
                            <el-input v-model="attr.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!-- 图片上传 -->
                        <el-upload
                            class="upload-demo"
                            :action="uploadURL"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :on-success="handleSuccess"
                            list-type="picture"
                            :headers="header">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本区域 bidirectional data binding（双向数据绑定） -->
                        <quill-editor v-model="goodFormData.goods_introduce"
                        ref="myQuillEditor"
                        @blur="onEditorBlur($event)"
                        @focus="onEditorFocus($event)"
                        @ready="onEditorReady($event)">
                        </quill-editor>
                        <el-button type="primary" class="add-good" @click="addGood">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <!-- 图片预览对话框 -->
        <el-dialog title="提示" :visible.sync="previewDialogVisible" width="50%">
            <img :src="preViewURL" class="previewImg"/>
        </el-dialog>
    </div>
</template>

<script>
import _ from 'loadsh'
export default {
  data () {
    return {
      // 步骤的索引
      stepIndex: '0',
      // 表单的商品数据
      goodFormData: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      rules: {
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
        ]
      },
      // 分类列表数据
      cateData: [],
      // 级联配置
      goodProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        children: 'children',
        value: 'cat_id'
      },
      selectCateId: [],
      // 动态数据
      manyData: [],
      onlyData: [],
      // 上传图片
      // uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      uploadURL: 'https://www.liulongbin.top:8888/api/private/v1/upload',
      header: {
        Authorization: window.sessionStorage.getItem('token')
      },
      preViewURL: '',
      previewDialogVisible: false
    }
  },
  created () {
    this.getCateData()
  },
  methods: {
    async getCateData () {
      const { data } = await this.$http.get('categories')
      // console.log(data.data)
      if (data.meta.status !== 200) {
        return this.$message.error('获取分类数据失败')
      }
      this.cateData = data.data
    },
    // 获取属性
    async getManyData () {
      const { data } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
      // console.log(data.data)
      if (data.meta.status !== 200) {
        return this.$message.error('获取属性数据失败')
      }
      this.manyData = data.data
      // 先赋值后
      this.manyData.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
      })
    },
    async getOnlyData () {
      const { data } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
      // console.log(data.data)
      if (data.meta.status !== 200) {
        return this.$message.error('获取属性数据失败')
      }
      this.onlyData = data.data
    },
    // 处理tab跳转
    handleBeforeLeave (activeName, oldActiveName) {
      // console.log(activeName, oldActiveName)
      if (this.selectCateId.length <= 0) {
        this.$message.error('请选择分类，才能进去下一项')
        return false
      }
    },
    // 商品内容的处理，到tab1就请求动态参数， 2的话就请求静态数据
    handleTabClick () {
      // console.log(tab)
      switch (this.stepIndex) {
        case '1':
          this.getManyData()
          break
        case '2':
          this.getOnlyData()
          break
      }
    },
    // 级联分类的变化处理
    handleCateChange () {
      // console.log(this.cateId)
    },

    // 图片上传
    handlePreview (file) {
      // console.log(file)
      this.previewDialogVisible = true
      // 服务器返回来的图片的地址
      this.preViewURL = file.response.data.url
    },
    // 为什么要删除？这里的数据究竟是干嘛用的，注：到时添加商品会提交到服务器的，所以传多少就要多少
    handleRemove (file) {
      // findindex返回第一个满足条件的下标
      var index = this.goodFormData.pics.findIndex(val =>
        val === file.response.data.url
      )
      this.goodFormData.pics.splice(index, 1)
      // console.log(this.imgURL)
    },
    handleSuccess (response) {
      // console.log(response)
      if (response.meta.status !== 200) {
        return this.$http.error('上传数据失败')
      }
      this.goodFormData.pics.push(response.data.url)
    },

    // 富文本的处理
    onEditorBlur (quill) {
      // console.log('editor blur!', quill)
    },
    onEditorFocus (quill) {
      // console.log('editor focus!', quill)
    },
    onEditorReady (quill) {
      // console.log('editor ready!', quill)
    },

    // 添加商品
    addGood () {
      // 先对整个表单进行预预验证，有不对的要进行处理
      this.$refs.goodRuleForm.validate(async valid => {
        if (!valid) {
          return this.$message.error('存在格式不符合要求问题，请检查填写的信息')
        }
        // 把选择的分类id需要转换成字符串，需要深拷贝来处理，不能在原来的数据上修改，它是双向绑定的，页面会受到影响
        // 我写的代码似乎不用，我把选中的分类的单独出来了
        this.manyData.forEach(item => {
          var attrStr = item.attr_vals.join(' ')
          var attr = {
            attr_id: item.attr_id,
            attr_value: attrStr
          }
          this.goodFormData.attrs.push(attr)
        })
        this.onlyData.forEach(item => {
          var attr = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.goodFormData.attrs.push(attr)
        })
        const copyGoodData = _.cloneDeep(this.goodFormData)
        copyGoodData.goods_cat = this.selectCateId.join(',')
        console.log(copyGoodData)

        const { data } = await this.$http.post('goods', copyGoodData)
        // console.log(data)
        if (data.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId () {
      if (this.selectCateId.length !== 0) {
        return this.selectCateId[this.selectCateId.length - 1]
      } else {
        return null
      }
    }
  }
}
</script>

<style lang="less" scoped>
    .el-steps {
        margin-top: 15px;
        margin-bottom: 25px;
    }
    .el-checkbox {
        margin: 5px !important;
    }
    .previewImg {
        width: 100%;
    }
    .add-good {
        margin-top: 20px;
    }
</style>
