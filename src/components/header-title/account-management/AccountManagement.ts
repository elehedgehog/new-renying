import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './AccountManagement.html?style=./AccountManagement.scss'
import { webuserClient } from '../../../util/clientHelper'
import { safetyClient } from '../../../util/clientHelper'
import { geoClient } from '../../../util/clientHelper'
@WithRender
@Component
export default class AccountManagement extends Vue {
  @Prop() closeFn
  keyString: string = ''
  accountSelected: string = ''
  currentPage: number = 1       // 当前页数
  currentPageList: any = []     // 当前页数 用户数据
  pageSize: number = 11
  accountList: any =  []
  newAccountList: any = []
  popupType: 'add' | 'modify' = null
  isPopupOn: boolean = false
  popupInfo: any = {
    id: { value: null },
    username: { name: '用户名', value: null },
    password: { name: '密码', value: null },
    cityname: { name: '所属', value: null }
  }
  allCities: any = []
  mounted() {
    this.getWebuser()
    this.getAllCity()
  }

  async getWebuser() {
    let data = await webuserClient.getWebuser()
    if(data){
      this.accountList = data
      this.newAccountList = data
      this.currentPageList = this.newAccountList.slice(this.pageSize*(this.currentPage-1), this.pageSize*(this.currentPage-1) + this.pageSize)
    }
  }
  async getAllCity() {    // 获取所有城市
    let data = await geoClient.getCities()
    for (let el of data) {
      this.allCities.push(el.city.slice(0, 2))
    }
  }
  toggleAddAccount() {  //新增账号
    if (this.popupType === 'add') {
      this.popupType = null
      this.isPopupOn = false
    } else {
      for (let i in this.popupInfo) {
        this.popupInfo[i].value = null
      }
      this.popupType = 'add'
      this.isPopupOn = true
    }

  }
  toggleModifyAirspace(item) { //修改账号
    for (let i in this.popupInfo) {
      this.popupInfo[i].value = null
    }
    this.popupInfo.username.value = item.username
    this.popupInfo.id.value = item.id
    this.popupInfo.password.value = item.password
    this.popupInfo.cityname.value = item.cityname
    this.popupType = 'modify'
    this.isPopupOn = true
  }
   async deleteAirspace(item) { //删除账号
    Vue.prototype['$confirm']('是否确定删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      let data = await webuserClient.deleteWebuser(item.id)
      if(data){
        Vue.prototype['$message']({
          type: 'success',
          message: '删除成功'
        })
        this.getWebuser()
      } else {
        Vue.prototype['$message']({
          type: 'error',
          message: '删除失败'
        })
      }
    }).catch(() => {})
  }
  async savePoint() {  //保存
    let data, tip
    if (this.popupType === 'add') {
      let param = {
        username: this.popupInfo.username.value,
        password: this.popupInfo.password.value,
        cityname: this.popupInfo.cityname.value,
        power: 2
      }
      data = await webuserClient.addWebuser(param)
      tip = '添加'
    } else if (this.popupType === 'modify') {
      let param = {
        id: this.popupInfo.id.value,
        password: this.popupInfo.password.value
      }
      data = await webuserClient.updateWebuser(param)
      tip = '修改'
    }
    if(data){
      Vue.prototype['$message']({
        type: 'success',
        message: tip + '成功'
      })
      this.isPopupOn = false
      this.popupType = null
      this.getWebuser()
    } else {
      Vue.prototype['$message']({
        type: 'error',
        message: tip + '失败'
      })
    }
  }
  currentChange(e) {
    this.currentPage = e
    this.currentPageList = this.newAccountList.slice(this.pageSize*(e-1), this.pageSize*(e-1) + this.pageSize)
  }
  @Watch('keyString')
  onkeyStringChanged (val: any, oldVal: any) {
    this.newAccountList = []
    let exp = new RegExp(val)
    for(let el of this.accountList) {
      let isMarch: boolean = false
      for(let i in el) {
        let valString = el[i]
        if(exp.test(valString)){
          isMarch = true
          break
        }
      }
      if(isMarch) this.newAccountList.push(el)
    }
    this.currentPage = 1
    this.currentPageList = this.newAccountList.slice(0,this.pageSize)
  }
}