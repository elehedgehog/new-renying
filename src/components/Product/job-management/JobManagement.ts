import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './JobManagement.html?style=./JobManagement.scss'
import { jobManagementClient, groupsClient, geoClient, safetyClient } from '../../../util/clientHelper'
import * as CONFIG from '../../../config/productId'

@WithRender
@Component
export default class JobManagement extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  productId: string = CONFIG.jobManagement
  allJobPointLists: any = []     //总的的作业点
  jobPointLists: any = []       //显示的作业点
  pageSize: number = 11
  currentPage: number = 1       // 当前页数
  currentPageList: any = []     // 当前页数 用户数据
  keyString: string = ''
  cityList: any = {}
  city: string = 'all'
  county: string = 'all'
  allCounty: string[] = []
  isPopupOn: boolean = false
  popupType: 'add' | 'modify' = null
  popupInfo: any = {
    id: { name: '编号', value: null },
    address: { name: '地名', value: null },
    lonStr: { name: '经度', value: null },
    latStr: { name: '纬度', value: null },
    height: { name: '高度', value: null },
    fireDirection: { name: '射向', value: null },
    fireHeight: { name: '射向高度', value: null },
    fireRadius: { name: '射向半径', value: null },
    airport: { name: '机场', value: null },
    city: { name: '城市', value: null },
    county: { name: '区县', value: null },
    appUser: { name: '指挥员', value: { id: null } },
  }
  allAppUser: any = []            //所有指挥员列表
  AppUserList: any = []            //显示的指挥员列表
  seachAppUser: string = null
  appUserPopup: boolean = false
  appUserListSelected: any = {}       // 已分配的指挥员
  allCities: any = []
  scorePopup: boolean = false
  classSelected: '基本项' | '提升项' = '基本项'          //评分类型选择
  basicPopup: boolean = false

  mounted() {
    this.findsJobPoint()
    this.getAllMember()
    this.getAllCity()
  }

  async getAllCity() {    // 获取所有城市
    let data = await geoClient.getCities()
    this.allCities = data
    console.log(this.allCities)
  }
  async findsJobPoint() {   //查询作业点

    let data = await jobManagementClient.findsJobPoint()
    if (!data) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '暂无数据'
      })
      return
    }

    for (let item of data) {
      this.$set(item, 'popup', false)   //给item对象添加popup属性 用于判断窗口状态
      // 获取所有城市、区县
      if (item.city in this.cityList) {
        if (this.cityList[item.city].indexOf(item.county) === -1)
          this.cityList[item.city].push(item.county)
      } else {
        this.cityList[item.city] = [item.county]
      }
      // 获取所有已分配指挥员
      if (item.appUser) {
        this.appUserListSelected[item.appUser.id] = item.appUser
      }
    }

    // 获取作业点评级
    let res = await safetyClient.getSafetyRating()
    if (res) {
      for (let el of res) {
        for (let opt of data) {
          if (el.station === opt.id) {
            this.$set(opt, 'level', el.gradeList[el.gradeList.length - 1].rank)
            break
          }
        }
      }
    }

    if (data.length <= this.pageSize * (this.currentPage - 1)) this.currentPage--
    this.allJobPointLists = data
    this.jobPointLists = data
    this.currentPageList = this.jobPointLists.slice(0, this.pageSize)
  }
  currentChange(e) {
    this.currentPage = e
    this.currentPageList = this.jobPointLists.slice(this.pageSize * (e - 1), this.pageSize * (e - 1) + this.pageSize)
  }
  @Watch('keyString')
  onkeyStringChanged(val: any, oldVal: any) {
    this.matchList(val)
  }
  matchList(key: string) {            //搜索过滤
    this.jobPointLists = []
    for (let el of this.allJobPointLists) {
      let isMatch: boolean = false
      let exp = new RegExp(key)
      for (let i in el) {
        if (exp.test(el[i])) {
          isMatch = true
          break
        }
        for (let j in el.appUser) {
          if (j === 'department' || j === 'opId' || j === 'phoneNum' || j === 'workPoint') continue
          if (exp.test(el.appUser[j])) {
            isMatch = true
            break
          }
        }
      }
      if (isMatch) this.jobPointLists.push(el)
    }
    this.currentPage = 1
    this.currentPageList = this.jobPointLists.slice(0, this.pageSize)
  }

  async deldeteJobPoint(id) {    //删除作业点
    Vue.prototype['$confirm']('是否确定删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      let data = await jobManagementClient.deldeteJobPoint(id)
      if (data) {
        Vue.prototype['$message']({
          type: 'success',
          message: '删除成功'
        })
        this.findsJobPoint()
      } else
        Vue.prototype['$message']({
          type: 'error',
          message: '删除失败'
        })

    }).catch(() => { })
  }

  @Watch('city')
  oncityChanged(val: any, oldVal: any) {
    this.county = 'all'
    if (val === 'all') {
      this.allCounty = []
      this.matchList('')
    }
    else {
      this.allCounty = this.cityList[val]
      this.matchList(val)
    }
  }

  @Watch('county')
  oncountyChanged(val: any, oldVal: any) {
    if (val === 'all') this.matchList(this.city)
    else this.matchList(val)
  }

  toggleAddPopup() {  //新建作业点的按钮
    if (this.popupType === 'add') {
      this.popupType = null
      this.isPopupOn = false
    } else {
      for (let i in this.popupInfo) {
        if (i !== 'appUser') this.popupInfo[i].value = null
        else this.popupInfo[i].value = { id: null }
      }
      this.popupType = 'add'
      this.isPopupOn = true
    }
  }

  toggleModifyPopup(item) {    //修改作业点的按钮
    for (let i in this.popupInfo) {
      if (i !== 'appUser') this.popupInfo[i].value = null
      else this.popupInfo[i].value = { id: null }
    }
    this.popupInfo.id.value = item.id
    this.popupInfo.address.value = item.address
    this.popupInfo.latStr.value = item.lat
    this.popupInfo.lonStr.value = item.lon
    this.popupInfo.height.value = item.height
    this.popupInfo.fireDirection.value = item.fireDirection
    this.popupInfo.fireHeight.value = item.fireHeight
    this.popupInfo.fireRadius.value = item.fireRadius
    this.popupInfo.airport.value = item.airport
    this.popupInfo.city.value = item.city
    this.popupInfo.county.value = item.county
    this.popupInfo.appUser.value = item.appUser
    this.popupType = 'modify'
    this.isPopupOn = true
  }

  async savePoint() {    //保存 修改/新建 后的作业点管理信息
    let id = this.popupInfo.id.value,
      address = this.popupInfo.address.value,
      latStr = this.popupInfo.latStr.value,
      lonStr = this.popupInfo.lonStr.value,
      height = this.popupInfo.height.value,
      fireDirection = this.popupInfo.fireDirection.value,
      fireHeight = this.popupInfo.fireHeight.value,
      fireRadius = this.popupInfo.fireRadius.value,
      airport = this.popupInfo.airport.
        value,
      city = this.popupInfo.city.value,
      county = this.popupInfo.county.value,
      appUser = this.popupInfo.appUser.value.id
    let data, tip = ''
    if (this.popupType === 'add') {
      tip = '新增'
      data = await jobManagementClient.addJobPoint(id, address, latStr, lonStr, fireDirection, airport, fireRadius, fireHeight, height, city, county, appUser)
    } else if (this.popupType === 'modify') {
      tip = '修改'
      data = await jobManagementClient.updateJobPoint(id, address, latStr, lonStr, fireDirection, airport, fireRadius, fireHeight, height, city, county, appUser)
    }
    if (data) {
      Vue.prototype['$message']({
        type: 'success',
        message: tip + '成功'
      })
      this.popupType = null
      this.isPopupOn = false
      this.findsJobPoint()
    } else
      Vue.prototype['$message']({
        type: 'error',
        message: tip + '失败'
      })
  }

  async getAllMember() {   //获取全部成员列表
    let data = await groupsClient.getAllMember()
    this.allAppUser = data
    this.AppUserList = data
  }

  toggleAppUser() {          //显示隐藏指挥员列表按钮
    this.appUserPopup = !this.appUserPopup
  }

  @Watch('seachAppUser')
  onseachAppUserChanged(val: any, oldVal: any) {
    this.AppUserList = []
    for (let el of this.allAppUser) {
      console.log(this.allAppUser)
      let exp = new RegExp(val)
      if (exp.test(el.name))
        this.AppUserList.push(el)
    }
  }

  selectAppUser(el) {    //修改指挥员
    if (this.popupInfo.appUser.value && this.popupInfo.appUser.value.id === el.id) {
      this.appUserPopup = false
      return
    }
    if (el.id in this.appUserListSelected) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '指挥员不可重复选择'
      })
      return
    }
    this.popupInfo.appUser.value = el
    this.appUserPopup = false
  }
  toggleAppUserPanel(item) {   //按钮点击出现修改指挥员列表
    let status = item.popup
    for (let el of this.allJobPointLists) {
      el.popup = false
    }
    item.popup = !status
  }
  async changeAppUser(item, el) {   //修改指挥员
    let data = await jobManagementClient.updateJobPoint(item.id, item.address, item.lat, item.lon, item.fireDirection, item.airport, item.fireRadius, item.fireHeight, item.height, item.city, item.county, el.id)
    if (!data) {
      Vue.prototype['$message']({
        type: 'error',
        message: '修改失败'
      })
    } else {
      if (el.id in this.appUserListSelected) {
        Vue.prototype['$message']({
          type: 'warning',
          message: '指挥员不可重复选择'
        })
        return
      }
      Vue.prototype['$message']({
        type: 'success',
        message: '修改成功'
      })
      item.popup = false
      this.findsJobPoint()
    }
  }
  async toggleScorePopup(key) {               //点击弹出评分框
    if (!this.hasLoadSafetyItem) await this.getSafetyItem()
    else {
      for (let i in this.safetyItem) {
        for (let j in this.safetyItem[i]) {
          for (let item of this.safetyItem[i][j]) {
            item.selected = null
          }
        }
      }
    }
    this.scorePopup = true
    this.classSelected = '基本项'
    this.jobPointSelected = key
  }
  toggleClass(key) {
    if (key === this.classSelected) return
    this.classSelected = key
  }


  safetyItem: any = {
    基本项: {
      规章制度: [],
      环境设施: [],
      装备弹药: [],
      人员管理: [],
    },
    提升项: {
      规章制度: [],
      环境设施: [],
      装备弹药: [],
      人员管理: [],
    },
  }
  stringSafety: any = {
    规章制度: '一',
    环境设施: '二',
    装备弹药: '三',
    人员管理: '四',
  }
  hasLoadSafetyItem: boolean = false
  jobPointSelected: string = ''
  async getSafetyItem() {
    let data = await safetyClient.safetyItem()
    if (!data) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '数据获取失败'
      })
      return
    }
    for (let el of data) {
      this.$set(el, 'selected', null)
      let category = el.category.split(';')
      this.safetyItem[category[1]][category[2]].push(el)
    }
    this.hasLoadSafetyItem = true
  }
  async submitItemLevel() {
    let pass = [], fail = []
    // let score = 0
    for (let i in this.safetyItem) {
      for (let j in this.safetyItem[i]) {
        for (let item of this.safetyItem[i][j]) {
          if (item.selected || item.selected === null) pass.push(item.id)
          else fail.push(item.id)
          // if (item.selected) score += item.value
        }
      }
    }
    let param = {
      station: this.jobPointSelected,
      gradeList: [
        { pass, fail }
      ]
    }
    let res = await safetyClient.submitSafetyRating(param)
    if (res) {
      Vue.prototype['$message']({
        type: 'success',
        message: '评定成功'
      })
      this.scorePopup = false
      this.findsJobPoint()
    } else {
      Vue.prototype['$message']({
        type: 'warning',
        message: '评定失败'
      })
    }
  }
  downLoadJob() {   //下载excel
    window.open(`http://10.148.16.217:11160/renyin5/fp/operation/excel/download`)
  }
}