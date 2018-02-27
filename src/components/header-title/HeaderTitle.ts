import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './HeaderTitle.html?style=./HeaderTitle.scss'
import ManagecenterPopup from './managecenter-popup/ManagecenterPopup'
import AccountManagement from './account-management/AccountManagement'
import DownloadImg from './download-img/DownloadImg'
import { geoClient, mapboundaryClient } from '../../util/clientHelper'
import axios from 'axios'
import jsonpAdapter from 'axios-jsonp'

let boundaryLine = []

@WithRender
@Component
export default class HeaderTitle extends Vue {
  @Getter('systemStore/userInfo_global') userInfo_global
  @Action('systemStore/changeUserInfo_global') changeUserInfo_global
  @Prop() viewLoginPage  

  managementView: any = null
  accountManagementView: any = null
  downLoadView: any = null
  cityList: any = {}
  citySelected: number
  cityListPop: boolean = false
  citiesBoundry: any = {}
  loginOutPop: boolean = false
  productAccountPop: boolean = false

  mounted(){
    this.geoClient()
  }

  async geoClient(){       //获取地址信息
    let data = await mapboundaryClient.getCityBoundary()
    if(!data){
      Vue.prototype['$message']({
        type: 'warning',
        message: '获取城市列表失败'
      })
      return
    }
    let obj = {}
    for (let el of data) {
      if (/飞地/.test(el.city)) continue
      obj[el.cityid] = el.city.slice(0, 2)
    }
    obj[0] = '广东'
    this.cityList = { ...obj }
    this.citySelected = 0     // 初始选中广东
    this.getGdBoundary()      // 绘制广东边界
  }
  toggleManagement() {   //打开管理中心窗口
    this.managementView = this.managementView ? null : ManagecenterPopup
    this.accountManagementView = null
    this.downLoadView = null
  }
  toggleAccountManagement() {           //打开省局账号窗口
    this.accountManagementView = this.accountManagementView ? null : AccountManagement
    this.productAccountPop = false
    this.downLoadView = null
    this.managementView  = null
  }
  toggleDownloaImg() {  //打开批量下载业务图窗口
    this.downLoadView = this.downLoadView ? null : DownloadImg
    this.productAccountPop = false
    this.managementView  = null
    this.accountManagementView = null
  }
 
  toggleCityList() {   //点击获取城市列表
    this.cityListPop = !this.cityListPop
    if(this.loginOutPop) this.loginOutPop = false
  }
  loginOut() {  //退出登录
    this.loginOutPop = !this.loginOutPop
    if(this.cityListPop) this.cityListPop = false
  }
  loginOutBtn() {  //退出登录按钮
    this.changeUserInfo_global(null)
    this.viewLoginPage()
    this.loginOutPop = false
  }
  toggleCity(cityid) {         //点击城市
    console.log(cityid)
    this.cityListPop = false
    if(cityid === this.citySelected) return
    this.citySelected = cityid
    if (cityid === 0) this.getGdBoundary()
    else this.cityBoundry()
  }
  
  async getGdBoundary() {            //获取广东省边界
    this.clearBoundary()
    let res = await mapboundaryClient.getGdBoundary()
    if(!res) {
      Vue['prototype']['$message']({
        type: 'error',
        message: '获取广东边界失败'
      })
      return
    }
    let gdBoundary =  JSON.parse(res.bound)
    for (let item of gdBoundary) {
      for (let opt of item) {
        opt.reverse()
      }
      let gdLine = window['L'].polyline(item, { color: 'red', weight: 2 }).addTo(window['map'])
      boundaryLine.push(gdLine)
    }
  }

  async cityBoundry() {     // 获取市边界
    this.clearBoundary()
    let msg = await axios(`http://10.148.83.228:2008/projshare/geo/find/citytwo/cityid?cityId=${this.citySelected}`)
    let bound =JSON.parse(msg.data.tagObject.bound)
    console.log(bound)
    if (!bound) {
      Vue['prototype']['$message']({
        type: 'error',
        message: '获取城市边界失败'
      })
      return
    }
    for (let item of bound) {
      for (let opt of item) {
        opt.reverse()
      }
      let cityLine = window['L'].polyline(item, { color: 'red', weight: 2 }).addTo(window['map'])
      boundaryLine.push(cityLine)
    }
  }
  clearBoundary() {
    if (boundaryLine.length) {
      for (let line of boundaryLine) {
        window['map'].removeLayer(line)
      }
      boundaryLine = []
    }
  }

  @Watch('userInfo_global')
  onuserInfo_globalChanged (val: any, oldVal: any) {
    this.toggleCity(val.cityid ? val.cityid : 0)
  }

}