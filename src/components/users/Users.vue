<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card class="box-card">
            <!-- 搜索框，搜索的功能是后台去处理，它根据我们传的参数去返回对应数据 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable @clear="getUserListData">
                        <el-button slot="append" icon="el-icon-search" @click="getUserListData"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                     <el-button type="primary" @click="addDialogVisible=true">添加新用户</el-button>
                </el-col>
            </el-row>
            <!-- 显示用户信息的区域 -->
            <el-table :data="userListData" style="width: 100%" stripe border>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="username" label="姓名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="role_name" label="角色"></el-table-column>
                <el-table-column prop="mg_state" label="状态">
                    <template v-slot='scope'>
                        <!-- 在文档中可以看到相关的信息 -->
                        <!-- {{scope.row }} -->
                        <el-switch v-model="scope.row.mg_state" @change="handleSwitch(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <!-- 这里有编辑、删除、分配角色三种 -->
                <el-table-column label="操作" width="180px">
                    <template v-slot="scope">
                      <!-- 页面修改数据 -->
                        <el-button type="primary" size=mini icon="el-icon-edit" @click="handleEditFormData(scope.row.id)"></el-button>
                        <el-button type="danger" size=mini icon="el-icon-delete" @click="handleDeleteFormData(scope.row.id)"></el-button>
                        <el-tooltip content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" size=mini icon="el-icon-setting" @click="setRole(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页功能 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1, 2, 8, 10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
            <!-- 分配角色对话框 -->
            <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="30%"
            @close="handleCloseSetRole">
            <div>
              <p>当前用户：{{ userInfo.username }}</p>
              <p>当前角色：{{ userInfo.role_name }}</p>
              <span>分配新角色：</span>
              <!-- 下拉选项框 -->
              <el-select v-model="roleNameId" placeholder="请选择">
                <!-- 这里只使用了数据第一层 -->
                <el-option v-for="item in allRolesName" :key="item.id" :label="item.roleName" :value="item.id">
                </el-option>
              </el-select>
            </div>
            <span slot="footer" class="dialog-footer">
              <el-button @click="setRoleDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="postSetRoleData">确 定</el-button>
            </span>
            </el-dialog>
            <!-- 编辑用户信息数据的对话框，用表单进行验证 -->
            <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="30%"
            @close="handleCloseEditDialog">
            <el-form :model="editFormData" :rules="rules" ref="editRuleForm" label-width="100px" class="demo-ruleForm">
              <el-form-item label="用户名">
                <el-input v-model="editFormData.username" :disabled="true"></el-input>
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="editFormData.email"></el-input>
              </el-form-item>
              <el-form-item label="手机" prop="mobile">
                <el-input v-model="editFormData.mobile"></el-input>
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="editDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="postEditFormData">确 定</el-button>
            </span>
            </el-dialog>
            <!-- 添加新用户对话框 -->
            <el-dialog
            title="添加新用户"
            :visible.sync="addDialogVisible"
            width="30%"
            @close="addDialogClose">
            <el-form :model="addFormData" :rules="rules" ref="addRuleForm" label-width="100px" class="demo-ruleForm">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="addFormData.username"></el-input>
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input v-model="addFormData.password" type="password"></el-input>
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="addFormData.email"></el-input>
              </el-form-item>
              <el-form-item label="手机" prop="mobile">
                <el-input v-model="addFormData.mobile"></el-input>
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="addDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="postAddFormData">确 定</el-button>
            </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
export default {
  data () {
    var checkMobile = (rule, value, callback) => {
      var reg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      var result = reg.test(value)
      if (result) {
        callback()
      } else {
        callback(new Error('手机格式有误'))
      }
    }
    var checkEmail = (rule, value, callback) => {
      var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      var result = reg.test(value)
      if (result) {
        callback()
      } else {
        callback(new Error('邮箱格式有误'))
      }
    }
    return {
      userListData: [],
      queryInfo: {
        // 用来做查询的，请求的时候，服务器会根据查询的参数来返回数据
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      total: 0,
      // 控制添加新用户对话框
      addDialogVisible: false,
      // 表单用户信息数据
      addFormData: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 存储用户修改的信息
      editFormData: {},
      // 编辑用户信息对话框
      editDialogVisible: false,
      // 表单规则
      rules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        mobile: { required: true, validator: checkMobile, trigger: 'blur' },
        email: { required: true, validator: checkEmail, trigger: 'blur' }

      },
      // 分配角色对话框
      setRoleDialogVisible: false,
      // 当前点击的用户信息
      userInfo: {},
      allRolesName: [],
      roleNameId: ''
    }
  },
  created () {
    this.getUserListData()
  },
  methods: {
    async getUserListData () {
      // api接口并没有写明白，params不要拼写错了
      const { data } = await this.$http.get('users', { params: this.queryInfo })
      // console.log(data)
      if (data.meta.status === 200) {
        this.userListData = data.data.users
        this.total = data.data.total
        // console.log(data.data.users)
      }
    },

    // 页面一次性显示多少条数据的变化
    handleSizeChange (newSize) {
    // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserListData()
    },
    // 当前显示第几页数据
    handleCurrentChange (newPage) {
    // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserListData()
    },
    // 把用户状态更新到数据库中
    async handleSwitch (info) {
      const { data } = await this.$http.put(`users/${info.id}/state/${info.mg_state}`)
      // console.log(data)
      // 判断数据是否更新成功要给用户提示
      if (data.meta.status === 200) {
        this.$message.success('成功更新数据')
      } else {
        this.$message.error('更新数据失败，请重新尝试')
      }
    },
    // 对话框关闭清除数据
    addDialogClose () {
      this.$refs.addRuleForm.resetFields()
    },
    // 确认提交表格数据,先进行预校验
    postAddFormData () {
      this.$refs.addRuleForm.validate(async valid => {
        // console.log(valid)
        if (valid === false) return this.$message.error('表单验证失败，请重新检查')

        const { data } = await this.$http.post('users', this.addFormData)
        if (data.meta.status === 201) {
          this.$message.success('成功添加用户')
        } else {
          this.$message.success('添加用户失败，请重新尝试')
        }
        // 提交成功之后，还要重新获取一下数据
        this.getUserListData()
        // 把对话框关闭
        this.addDialogVisible = false
      })
    },
    // 修改用户信息数据
    async handleEditFormData (id) {
      this.editDialogVisible = true
      // 获取当前行的用户信息，发送请求
      const { data } = await this.$http.get('users/' + id)
      console.log(data)
      if (data.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      this.editFormData = data.data
    },
    // 关闭对话框的时候，恢复表单验证的状态
    handleCloseEditDialog () {
      // 对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
      this.$refs.editRuleForm.resetFields()
    },
    // 提交修改后的用户信息，需进行预校验
    postEditFormData () {
      // 进行预验证
      this.$refs.editRuleForm.validate(async (valid) => {
        if (valid === false) {
          return this.$message.error('输入的数据格式有误，请重新输入')
        }
        // 验证成功就把数据更新到服务器中
        const { data } = await this.$http.put('users/' + this.editFormData.id, {
          email: this.editFormData.email,
          mobile: this.editFormData.mobile
        })

        if (data.meta.status === 200) {
          this.$message.error('成功更新数据')
          // 刷新数据
          this.getUserListData()
        } else {
          this.$message.success('更新数据失败，请重新尝试')
        }
        // 关闭对话框
        this.editDialogVisible = false
      })
    },
    // 处理删除用户数据
    async handleDeleteFormData (id) {
      const result = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(result)
      // 根据消息弹框的结果
      if (result === 'confirm') {
        const { data } = await this.$http.delete('users/' + id)
        if (data.meta.status === 200) {
          this.$message.success('成功删除数据')
          // 刷新数据
          this.getUserListData()
        } else {
          return this.$message.error('删除数据失败')
        }
      } else {
        return this.$message.info('用户取消删除')
      }
    },

    // 分配角色
    async setRole (userInfo) {
      this.setRoleDialogVisible = true
      this.userInfo = userInfo
      // 获取所有角色的信息
      const { data } = await this.$http.get('roles')
      if (data.meta.status !== 200) {
        return this.$message.error('获取角色信息失败')
      }
      this.allRolesName = data.data
      // console.log(this.allRolesName)
    },

    // 提交分配角色
    async postSetRoleData () {
      console.log(this.userInfo.id)
      const { data } = await this.$http.put('users/' + this.userInfo.id + '/role', {
        rid: this.roleNameId
      })
      if (data.meta.status !== 200) {
        return this.$message.error('设置角色信息失败')
      }
      // 配置后要刷新数据
      this.getUserListData()
      this.$message.success('成功分配角色')
      this.setRoleDialogVisible = false
    },
    // 处理分配角色对话框关闭
    handleCloseSetRole () {
      this.roleNameId = ''
    }
  }
}
</script>

<style lang="less" scoped>
</style>
