import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './ConditionAudit.html?style=./ConditionAudit.scss'
import { jobManagementClient, groupsClient, geoClient, safetyClient, operationClient } from '../../../util/clientHelper'
import * as CONFIG from '../../../config/productId'
import axios from 'axios'
@WithRender
@Component
export default class ConditionAudit extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  productId: string = CONFIG.conditionAudit
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

  uploadPop: boolean = false
  file: any = null
  operationSeleted:string = ''
  operationId:string = ''
  fileList: any = []
  checkSelected: any = []
  mounted(){
    this.findsJobPoint()
    this.geoClient()
  }
  async geoClient(){
    let data = await geoClient.getCities()
    for (let el of data) {
      this.cityList[el.city] = 1
    }
  }
  async findsJobPoint() {   //查询作业点

    let data = await jobManagementClient.findsJobPoint()
    
    if(!data){
      Vue.prototype['$message']({
        type: 'warning',
        message: '暂无数据'
      })
      return
    }
    console.log(data)
    for(let item of data) {
      this.$set(item, 'popup', false)   //给item对象添加popup属性 用于判断窗口状态
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
    this.currentPageList = this.jobPointLists.slice(0,this.pageSize)
  }
  togglePass(item) {   //按钮点击出现修改通过列表
    let status = item.popup
    for (let el of this.allJobPointLists) {
      el.popup = false
    }
    item.popup = !status
  }
  uploadBtn() {
    if(!this.operationSeleted){
      Vue.prototype['$message']({
        type: 'warning',
        message: '请先选择作业点'
      })
      return
    } 
    this.uploadPop = true
    this.file = null;
  }
  async toggleIsPass(item, key) {   //通过 不通过按钮
    let data = await operationClient.updateOperation(item.id, key)
    if(data){
      item.popup = false
      this.findsJobPoint()
      Vue.prototype['$message']({
        type: 'success',
        message: '修改成功'
      })
    } else {
      Vue.prototype['$message']({
        type: 'error',
        message: '修改失败'
      })
    }
      
  }
  
  download(item) {       //下载
    window.open(`http://10.148.16.217:11160/renyin5/fp/operation/files/download/${this.operationSeleted}/${item}`)
  }
  batchDownload(item) {  //批量下载
    if(!Object.keys(this.checkSelected).length){
      Vue.prototype['$message']({
        type: 'error',
        message: '请选择需要下载的文件'
      })
      return
    }
    for(let item of this.checkSelected){
      window.open(`http://10.148.16.217:11160/renyin5/fp/operation/files/download/${this.operationSeleted}/${item}`)
    }
  }
  async deleteFile(item) {   //删除作业点
    Vue.prototype['$confirm']('是否确定删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      let data = await operationClient.deleteOperation(this.operationSeleted, item)
      if(data){
        Vue.prototype['$message']({
          type: 'success',
          message: '删除成功'
        })
        this.getFileList(this.operationSeleted)
       
      } else {
        Vue.prototype['$message']({
          type: 'error',
          message: '删除失败'
        })
      }
      
    }).catch(() => {})
  
    
  }
  currentChange(e) {
    this.currentPage = e
    this.currentPageList = this.jobPointLists.slice(this.pageSize*(e-1), this.pageSize*(e-1) + this.pageSize)
  }
  @Watch('keyString')
  onkeyStringChanged (val: any, oldVal: any) {
    this.matchList(val)
  }
  matchList(key: string) {            //搜索过滤
    this.jobPointLists = []
    for(let el of this.allJobPointLists) {
      let isMatch:boolean = false
      let exp = new RegExp(key)
      for(let i in el){
        if(exp.test(el[i])){
          isMatch = true
          break
        }
        for(let j in el.appUser){
          if (j === 'department' || j === 'id' || j === 'phoneNum' || j ==='workPoint') continue
          if(exp.test(el.appUser[j])){
            isMatch = true
            break
          }
        }
      }
      if(isMatch) this.jobPointLists.push(el)
    }
    this.currentPage = 1
    this.currentPageList = this.jobPointLists.slice(0, this.pageSize)
  }
 
  
  @Watch('city')
  oncityChanged (val: any, oldVal: any) {
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
  oncountyChanged (val: any, oldVal: any) {
    if (val === 'all') this.matchList(this.city)
    else this.matchList(val)
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
      data = await jobManagementClient.addJobPoint(id, address,latStr,lonStr,fireDirection,airport,fireRadius,fireHeight,height,city,county,appUser)
    } else if (this.popupType === 'modify') {
      tip = '修改'
      data = await jobManagementClient.updateJobPoint(id, address,latStr,lonStr,fireDirection,airport,fireRadius,fireHeight,height,city,county,appUser)
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
  
  async toggleFileList(id){
    this.checkSelected = []
    this.operationSeleted =  this.operationSeleted === id ? null : id
    if (this.operationSeleted)
      this.getFileList(id)
    else
    this.fileList = []
  }

  toggleCheck(item){  //勾选文件
    let index = this.checkSelected.indexOf(item)
    if (index === -1) this.checkSelected.push(item)
    else this.checkSelected.splice(index, 1)
  }

  async getFileList(id) {
    this.fileList = []
    let data = await operationClient.getOperation(id)
    this.fileList = data
    // for(let item of data){  
    //   let index = item.lastIndexOf('.')
    //   item = item.slice(0,index)
    //   this.fileList.push(item)
    // }
  }
 
  fileChanged(e) {
    this.file = e.target.files[0]
  }
  async uploadFile(){  //上传文件
    if (!this.file) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '请添加文件'
      })
      return
    }
    let formdata = new FormData()
    formdata.append('file', this.file)
    formdata.append('osId', this.operationSeleted)
    
    let res = await operationClient.uploadOperation(formdata)
    if (res) {
      Vue.prototype['$message']({
        type: 'success',
        message: '文件上传成功'
      })
      this.uploadPop = false
      await this.findsJobPoint()
      this.getFileList(this.operationSeleted)
    } else {
      Vue.prototype['$message']({
        type: 'warning',
        message: '文件上传失败'
      })
    }
  }
  
  

  

 
  
}