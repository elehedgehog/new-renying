import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './LoginPage.html?style=./LoginPage.scss'
import { userClient } from '../../util/clientHelper'
import { CookieHelper } from '../../util/cookie'
import Cookies from 'js-cookie'
import { Message } from 'element-ui'

let layer = null

@WithRender
@Component
export default class LoginPage extends Vue {
  @Action('systemStore/changeUserInfo_global') changeUserInfo_global

  @Prop() closeLoginPage

  placeholderUser: string = '账号'
  placeholderPwd: string = '密码'
  username: string = null
  password: string = null
  displayMsg: boolean = false
  isLoginSuccessed: boolean = true

  created() {
  }

  async login() {
    let data = await userClient.login(this.username, this.password)
    if (data) {
      this.isLoginSuccessed = false
      this.changeUserInfo_global(data)
      localStorage.setItem('login', JSON.stringify({
        data: `${this.username}%${this.password}`,
        date: Date.now() 
      }))
      Message({
        type: 'success',
        message: '成功登陆'
      })
      this.$store.dispatch('systemStore/connectSocket_global')
      this.closeLoginPage()
    } else {
      this.displayMsg = true
      Message({
        type: 'error',
        message: '用户名密码错误'
      })
    }
  }
}