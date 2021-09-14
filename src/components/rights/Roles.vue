<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card class="box-card">
            <el-button type="primary" @click="addRoleDialogVisible=true">添加角色</el-button>
            <!-- 显示所有角色数据区域  -->
            <el-table :data="rolesData" style="width: 100%" stripe border>
                <!-- 折叠行 -->
                <el-table-column type="expand">
                    <template v-slot="scope">
                        <!--
                            渲染的思路
                            行循环，一行分为两列，一列渲染为一级权限，二列中：继续行循环，分为两列，一列二级权限，二列循环tag，三级权限
                         -->
                        <el-row v-for="(item, i) in scope.row.children" :key="item.id" :class="['bottom-border', i===0? 'top-border':'', 'verhicalCenter']">
                            <!-- 渲染一级权限 -->
                             <el-col :span="5">
                                 <!-- 这里删除权限，传入的值的row是数据，等等能直接修改数据，不用折叠，如果传个id，就不能去修改了，这也是个技巧 -->
                                 <el-tag closable @close="deleteRights(scope.row, item.id)">{{ item.authName }}</el-tag>
                                 <i class="el-icon-caret-right"></i>
                             </el-col>
                             <el-col :span="19">
                                <el-row v-for="(subitem, index) in item.children" :key="subitem.id" :class="[ index > 0? 'top-border':'', 'verhicalCenter']">
                                    <!-- 渲染二级权限 -->
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="deleteRights(scope.row, subitem.id)">{{ subitem.authName }}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <!-- 渲染三级权限 -->
                                        <el-tag type="warning" v-for="(subsubitem) in subitem.children" :key="subsubitem.id" closable @close="deleteRights(scope.row, subsubitem.id)">{{ subsubitem.authName }}</el-tag>
                                    </el-col>
                                </el-row>
                             </el-col>
                        </el-row>
                        <!-- 预览数据，比较好看 -->
                        <!-- <pre>{{ scope.row }}</pre> -->
                    </template>
                </el-table-column>
                <el-table-column type="index" label="#">
                </el-table-column>
                <el-table-column prop="roleName" label="角色名称">
                </el-table-column>
                <el-table-column prop="roleDesc" label="角色描述">
                </el-table-column>
                <el-table-column prop="level" label="操作" width="300">
                    <template v-slot=scope>
                        <el-button type="primary" size=mini icon="el-icon-edit" @click="editRole(scope.row.id)">编辑</el-button>
                        <el-button type="danger" size=mini icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
                        <el-button type="warning" size=mini icon="el-icon-setting" @click="setRights(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 设置权限对话框- el-tree树型控件 -->
        <el-dialog title="设置权限" :visible.sync="setRightDialogVisible" width="30%"
        @close="handleCloseRightsDialog">
        <!-- 设置树形结构
        node-key中的id是rightsList中每个节点都有id，其值为节点数据中的一个字段名，该字段在整棵树中是唯一的
        -->
        <el-tree :data="rightsList" :props="treeProps" default-expand-all
        show-checkbox node-key="id" :default-checked-keys="defaultCheckedKeys"
        ref="treeRef">
        </el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="postRights">确 定</el-button>
        </span>
        </el-dialog>

        <!-- 添加角色对话框，跟编辑框合在一起，他们基本是类似的 -->
        <el-dialog :title="isEdit? '修改角色信息' : '添加角色'"
        :visible.sync="addRoleDialogVisible" width="30%"
        @close="handleAddRoleRightsDialog">
        <el-form :model="addRoleData" :rules="rules" ref="addRuleForm" label-width="100px" class="demo-ruleForm">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleData.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleData.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="postAddRole">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      rolesData: [],
      // 设置权限对话框
      setRightDialogVisible: false,
      // 权限列表
      rightsList: [],
      treeProps: {
        // 父子节点通过哪个节点来进行嵌套的
        children: 'children',
        // 看到的那个名字
        label: 'authName'
      },
      // 默认勾选的节点的 key 的数组
      defaultCheckedKeys: [],
      // post权限时候用到
      roleId: 0,

      // 添加角色
      addRoleDialogVisible: false,
      addRoleData: {
        roleName: '',
        roleDesc: ''
      },
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },

      // 编辑角色，跟添加共用对话框
      isEdit: false,
      editRoleId: 0
    }
  },
  created () {
    this.getRolesData()
  },
  methods: {
    async getRolesData () {
      const { data } = await this.$http.get('roles')
      //  console.log(data)
      if (data.meta.status === 200) {
        this.rolesData = data.data
      }
    },
    // 删除权限操作,要给用户提示，直接删了就完
    async deleteRights (roleInfo, rightId) {
      const result = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result === 'confirm') {
        const { data } = await this.$http.delete(`roles/${roleInfo.id}/rights/${rightId}`)
        // console.log(data)
        if (data.meta.status === 200) {
          this.$message.success('成功删除权限')
          // 这样直接更新数据，如果刷新的话，那么它会折叠起来,渲染的数据的是children
          // 能这样操作跟后台服务器返回的数据有关系，它返回的data, 是当前角色下最新的权限数据
          roleInfo.children = data.data
          // console.log(roleInfo)
        } else {
          this.$message.error('删除权限失败')
        }
      } else {
        this.$message.info('已撤销删除')
      }
    },
    // 获取当前用户的默认的三级权限id，这里采用的是递归
    getCurrentUserRights (rightsInfo) {
      if (!rightsInfo.children) {
        return this.defaultCheckedKeys.push(rightsInfo.id)
      }
      // console.log(rightsInfo)
      rightsInfo.children.forEach(element => {
        this.getCurrentUserRights(element)
      })
    },
    // 设置权限
    async setRights (rightsInfo) {
      this.setRightDialogVisible = true
      // 获取权限数据
      const { data } = await this.$http.get('rights/tree')
      // console.log(data)
      if (data.meta.status) {
        this.rightsList = data.data
      }
      // 设置默认选择的三级权限
      this.getCurrentUserRights(rightsInfo)
      // console.log(this.defaultCheckedKeys)
      // 保存一下当前角色的id
      this.roleId = rightsInfo.id
    },
    // 处理设置权限对话框关闭后，对默认key的清理
    handleCloseRightsDialog () {
      this.defaultCheckedKeys.length = 0
      // console.log(this.defaultCheckedKeys)
    },
    // 提交修改后的权限
    async postRights () {
      // console.log(this.$refs.treeRef.getCheckedKeys())
      // console.log(this.$refs.treeRef.getHalfCheckedKeys())
      const { data } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()].join(',')
      })
      if (data.meta.status === 200) {
        this.$message.success('设置权限成功')
        this.setRightDialogVisible = false
        // 刷新数据
        this.getRolesData()
      } else {
        this.$message.error('设置权限失败')
      }
    },

    // 提交新角色,和编辑角色一起
    postAddRole () {
      this.$refs.addRuleForm.validate(async valid => {
        if (!valid) {
          return this.$message.error('角色数据验证失败')
        }
        // 提交修改
        if (this.isEdit) {
          const { data } = await this.$http.put(`roles/${this.editRoleId}`, this.addRoleData)
          if (data.meta.status !== 200) {
            return this.$message.error('角色数据修改失败')
          }
          this.$message.success('角色数据成功修改')
        } else { // 提交添加
          const { data } = await this.$http.post('roles', this.addRoleData)
          if (data.meta.status !== 201) {
            return this.$message.error('角色数据提交失败')
          }
          this.$message.success('角色数据成功添加')
        }
        this.getRolesData()
        this.addRoleDialogVisible = false
      })
    },
    handleAddRoleRightsDialog () {
      this.$refs.addRuleForm.resetFields()
    },

    // 编辑角色
    async editRole (id) {
      // 显示对话框
      this.addRoleDialogVisible = true
      this.isEdit = true
      const { data } = await this.$http.get(`roles/${id}`)
      if (data.meta.status !== 200) {
        return this.$message.error('角色数据获取失败')
      }
      this.addRoleData.roleName = data.data.roleName
      this.addRoleData.roleDesc = data.data.roleDesc
      this.editRoleId = id
    },

    // 删除角色
    async deleteRole (id) {
      const result = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result === 'confirm') {
        const { data } = await this.$http.delete(`roles/${id}`)
        if (data.meta.status !== 200) {
          return this.$message.error('角色数据删除失败')
        }
        this.$message.success('角色数据删除成功')
        this.getRolesData()
      }
    }
  }
}
</script>

<style lang="less" scoped>
    .bottom-border {
        border-bottom: 1px solid #eee;
    }
    .top-border {
        border-top: 1px solid #eee;
    }
    .el-tag {
        margin: 7px
    }
    .verhicalCenter {
        display: flex;
        align-items: center;
    }
</style>
