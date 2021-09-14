<template>
    <div class="login-container">
        <div class="login-box">
            <!-- 登录图标 -->
            <div class="logo-box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 输入用户登录信息 -->
            <el-form class="login-form" :rules="loginRules" :model="loginFormData" ref="loginForm">
                <el-form-item prop="username">
                    <el-input prefix-icon="iconfont icon-user" v-model="loginFormData.username"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input prefix-icon="iconfont icon-3702mima" v-model="loginFormData.password" type="password"></el-input>
                </el-form-item>
                <el-form-item class="btn-right">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      loginFormData: {
        username: 'admin',
        password: '123456'
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetForm () {
      this.$refs.loginForm.resetFields()
    },
    login () {
      // 检查数据的有效性,预验证
      this.$refs.loginForm.validate(async (valid) => {
        if (valid === false) {
          return this.$message({ message: '账号或者密码有误', type: 'error' })
        }
        // 登录成功，通过axios发送post请求
        const { data } = await this.$http.post('/login', this.loginFormData)
        if (data.meta.status !== 200) {
          return this.$message.error('请求登录失败，请检查')
        }
        this.$message({ message: '登录成功', type: 'success' })

        // 把token存储在sessionStorage中，在导航守卫需要使用
        window.sessionStorage.setItem('token', data.data.token)
        this.$router.push('/home')

        // 用原生ajax测试
        // var xhr = new XMLHttpRequest()
        // xhr.open('post', 'http://127.0.0.1:8888/api/private/v1/login')
        // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        // xhr.send('username=admin&password=123456')
        // xhr.onreadystatechange = function () {
        //   if (xhr.readyState === 4) {
        //     if (xhr.status === 200) {
        //       console.log(xhr.responseText)
        //     }
        //   }
        // }
      })
    }
  }
}
</script>

<style lang="less" scoped>
    .login-container {
        height: 100%;
        background-color: #2b4b6b;
        .login-box {
            width: 450px;
            height: 300px;
            background-color: #fff;
            position: absolute;
            // margin: auto;
            // top: 0;
            // bottom: 0;
            // left: 0;
            // right: 0;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            .logo-box {
                width: 130px;
                height: 130px;
                background-color: #fff;
                border: 1px solid #eee;
                padding: 10px;
                border-radius: 50%;
                position: absolute;
                left: 50%;
                transform: translate(-50%, -50%);
                img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background-color: #eee;
                }
            }
        }
    }
    .login-form {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 10px;
        box-sizing: border-box;
        .btn-right {
            display: flex;
            justify-content: flex-end;
        }
    }
</style>
