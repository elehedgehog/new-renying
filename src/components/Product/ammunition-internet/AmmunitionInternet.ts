import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './AmmunitionInternet.html?style=./AmmunitionInternet.scss'
import * as CONFIG from '../../../config/productId'
import { AmmunitionInternetClient, geoClient ,groupsClient} from '../../../util/clientHelper'
import * as moment from 'moment'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legend'

let myChart: any = null
let L = window['L']
let layerGroup = null
@WithRender
@Component
export default class AmmunitionInternet extends Vue {
  moment = moment
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  productId: string = CONFIG.ammunitionInternet
  keyString: string = ''
  ammunitionCounty: string = ''
  addModifyStorePop: boolean = false
  appuserTypePop: boolean = false
  datetimePop: boolean = false
  addStoreTitle: any = {
    id: { value: null },
    name: { name: '名称', value: null },
    lon: { name: '经度', value: null },
    lat: { name: '纬度', value: null },
    level: { name: '级别', value: null },
    region: { name: '请选择', value: null },
  }
  repositoryList: any = []
  addStoreLists: any = []
  popupType: 'add' | 'modify' = null
  cityList: any = []
  allAmmunitionList: any = []         //仓库弹药弹药箱列表
  selAmmunitionList: any = []         //筛选后 仓库弹药弹药箱列表
  selectedRepository: string = null         //选中仓库Id
  styleList: any = []                  //炮弹样式
  datetimeList: any = []               //生产日期
  styleSelected: string = ''
  datetimeSelected: string = ''
  titleList: any = ['分类码','厂商代码','使用方式','催化种类','弹药样式','弹药型号','年号','生成日期','编码','状态']
  status: any = { stored: '入库', out:'出库', inTransit: '使用中', used: '消耗', destroyed: '回收', } 
  listPop: string = '' 
  histogramPop: string = '' 
  piePop: string = '' 
  ammunitionSelected: string = ''
  ammunitionEvents: any[] = []
  eventType: any = {store: '入库',takeout: '出库',transport: '运输',destroy: '销毁', work:'作业',other: '自定义'}
  appUserList: any = {}
  ammunitionEventsPop: boolean = false
  pageSize: number = 12
  currentPage: number = 1       // 当前页数
  currentPageList: any = []     // 当前页数 用户数据
  typeSelected: string = '' 
  minify: boolean = false
  destroyed() {
    layerGroup.clearLayers()
  }
  async mounted() {
    this.getRepository()
    this.geoClient()
    this.ammunitionCounty = 'all'
    this.typeSelected = 'listPop'
    let data = await groupsClient.getAllMember()
    for(let item of data){
      this.appUserList[item.id] = item
    }
    console.log(this.appUserList)
  }
  async geoClient() {       //获取地址信息
    let data = await geoClient.getCities()
    if (!data) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '获取地址失败'
      })
      return
    }
    this.cityList = data
  }
  async getRepository() {                       //获取仓库信息列表
    let data = await AmmunitionInternetClient.getRepository()
    console.log(data)
    if (!data) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '获取数据失败'
      })
      return
    } else {
      layerGroup = window['L'].layerGroup()
      for (let item of data) {
        let marker = window['L'].marker([item.lat, item.lon], {
          icon: window['L'].icon({
                iconUrl: 'static/img/toolbar_depot.png', 
                iconSize: [48, 48],
                iconAnchor: [24, 24],
                popupAnchor: [0, -12],
              })
        })
        marker.on('click', () => {
          layerGroup.eachLayer(e => {
            if (e.id === item.id + '_divIcon') {
              if (e.options.opacity) e.setOpacity(0)
              else e.setOpacity(1)
            }
          })
        })
        marker.id = item.id
        layerGroup.addLayer(marker)
        let width = 10 + item.name.length*12
        let divIcon = window['L'].marker([item.lat, item.lon], {
          icon: L.divIcon({
            className: 'ammunition-popup',
            html: `<div class="ammunition_flag">
                      <ul class="cf"j>
                        <li>${item.name}</li>        
                        <li>弹药<span>${item.number ? item.number : '0'}</span></li>        
                      </ul>
                      <p class="ammunition_flagstaff"></p>
                    </div>`,
            iconSize: [width, 35]
          }),
        })
        divIcon.id = item.id + '_divIcon'
        layerGroup.addLayer(divIcon)
      }
      layerGroup.addTo(window['map'])

      for (let item of data) {
        this.$set(item, 'popup', false)   //给item对象添加popup属性 用于判断窗口状态
        // 获取数量
        let data = await AmmunitionInternetClient.getAmmunitionMsg(item.id)
        if (!data || !data.length) {
          this.$set(item, 'number', 0)
          continue
        }
        let number = 0
        for (let el of data) {
          if (el.code.slice(0, 2) === '02') number++
          else number += 4
        }
        this.$set(item, 'number', number)
      }
      this.repositoryList = data
      this.addStoreLists = data
      this.toggleAmmunition(data[0].id)
      this.styleSelected = '全部'
      this.datetimeSelected = '全部'
    }
    
  }
  async updateRepository() {    //添加 修改仓库
    let data, tip = ''
    let param: any = {
      id: this.addStoreTitle.id.value,
      name: this.addStoreTitle.name.value,
      level: this.addStoreTitle.level.value,
      lon: this.addStoreTitle.lon.value,
      lat: this.addStoreTitle.lat.value,
      region: this.addStoreTitle.region.value,
      manager: ["刘敏", "陈波", "奥巴马"]
    }
    if (this.popupType === 'add') {
      param.valid = true
      tip = '新增'
      data = await AmmunitionInternetClient.addRepository(param)
    } else if (this.popupType === 'modify') {
      tip = '修改'
      data = await AmmunitionInternetClient.modifyRepository(param)
    }
    if (data) {
      if (this.popupType === 'add') {
        this.addStoreTitle.id.value = null
        this.addStoreTitle.name.value = ''
        this.addStoreTitle.lon.value = ''
        this.addStoreTitle.lat.value = ''
        this.addStoreTitle.level.value = ''
        this.addStoreTitle.region.value = ''
      }

      Vue.prototype['$message']({
        type: 'success',
        message: tip + '成功'
      })
      this.popupType = null
      this.addModifyStorePop = false
      this.getRepository()
    } else {
      if (data === false)
        Vue.prototype['$message']({
          type: 'error',
          message: tip + '失败'
        })
      else if (data === undefined)
        Vue.prototype['$message']({
          type: 'error',
          message: tip + '失败，仓库名称与已有仓库冲突'
        })
    }
  }

  async deleteRepository(id) {   //删除仓库
    Vue.prototype['$confirm']('是否确定删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      let data = await AmmunitionInternetClient.deleteRepository(id)
      if (data) {
        Vue.prototype['$message']({
          type: 'success',
          message: '删除成功'
        })
        this.getRepository()
      } else {
        Vue.prototype['$message']({
          type: 'error',
          message: '删除失败'
        })
      }
    }).catch(() => { })
  }

  toggleEditor(item) {
    this.geoClient()
    let status = item.popup
    for (let el of this.repositoryList) {
      el.popup = false
    }
    item.popup = !status
  }
  toggleModifyStoreHouse(item) {               //修改仓库
    this.addStoreTitle.id.value = item.id
    this.addStoreTitle.name.value = item.name
    this.addStoreTitle.lon.value = item.lon
    this.addStoreTitle.lat.value = item.lat
    this.addStoreTitle.level.value = item.level
    this.addStoreTitle.region.value = item.region
    this.popupType = 'modify'
    this.addModifyStorePop = true
  }
  addStoreHouse() {                   //新建仓库
    if (this.popupType === 'add') {
      this.popupType = null
      this.addModifyStorePop = false
    } else {
      this.popupType = 'add'
      this.addModifyStorePop = true
    }
  }

  matchList(key) {            //搜索过滤
    this.addStoreLists = []
    for (let el of this.repositoryList) {
      let isMatch: boolean = false
      for (let i in el as string[]) {
        if (i === 'lon' || i === 'id' || i === 'lat' || i === 'level' || i === 'manager') continue
        let reg = new RegExp(key) 
        if (reg.test(el[i])) {
          isMatch = true
          break
        }
      }
      if (isMatch) this.addStoreLists.push(el)
    }
  }
  @Watch('keyString')
  onkeyStringChanged(val: any, oldVal: any) {
    this.matchList(val)
  }
  @Watch('ammunitionCounty')
  onammunitionCountyChanged(val: any, oldVal: any) {
    if (val === 'all') this.matchList('')
    else this.matchList(val)
  }
  async getAmmunitionBox() {  //获取弹药箱
    let data = await AmmunitionInternetClient.getAmmunitionBox()
    if (!data) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '弹药箱数据获取失败'
      })
      return
    }
  }
  async getAmmunition() {  //获取弹药
    let data = await AmmunitionInternetClient.getAmmunition()
    if (!data) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '弹药箱数据获取失败'
      })
      return
    }
  }
  async getAmmunitionMsg(id) {  //获取仓库的所有弹药、弹药箱信息
    let data = await AmmunitionInternetClient.getAmmunitionMsg(id)
    if (!data) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '弹药箱数据获取失败'
      })
      return
    }

    this.styleList = [] 
    this.datetimeList = []      
    for (let item of data) {        
      this.$set(item, 'time', moment(item.lastTime).format('YYYYMMDD'))
      let ammunitionStatus
      if (item.status ==='destroyed') ammunitionStatus = 'destroyed'
      else {
        if (Date.now() - item.lastTime > 3*365*24*60*60*1000) ammunitionStatus = 'overdue'
        else if (Date.now() - item.lastTime > 2*365*24*60*60*1000) ammunitionStatus = 'expiring'
        else ammunitionStatus = 'normal'
      }
      this.$set(item, 'ammunitionStatus', ammunitionStatus)       //添加炮弹状态颜色辨别字段
      if (this.styleList.indexOf(item.style) === -1) this.styleList.push(item.style)    //炮弹用途列表
      if (this.datetimeList.indexOf(item.time) === -1) this.datetimeList.push(item.time)    //生产日期列表
    }
    this.allAmmunitionList = data
    this.selAmmunitionList = data
    this.currentPageList = this.selAmmunitionList.slice(0,this.pageSize)
  }
  toggleAmmunition(id) {
    if (this.ammunitionSelected) {
      this.ammunitionEvents = []
      this.ammunitionEventsPop = false
      this.ammunitionSelected = null
    } 
    this.getAmmunitionMsg(id)
    this.selectedRepository = id
    this.currentPage = 1
    this.currentPageList = this.selAmmunitionList.slice(0, this.pageSize)
    this.typeSelected = 'listPop'
    if (myChart) {
      echarts.dispose(myChart)
      myChart = null
    }
  }
  toggleStyle(key) {       //炮弹用途筛选按钮
    this.styleSelected = key
    this.queryAmmunitionList()
    this.appuserTypePop = false
  }
  toggleDatetime(key) {  //生产日期筛选按钮
    this.datetimeSelected = key
    this.queryAmmunitionList()
    this.datetimePop = false
  }
  queryAmmunitionList() {       // 筛选
    this.selAmmunitionList = []
    for (let item of this.allAmmunitionList) {
      if (this.styleSelected !== '全部' && item.style !== this.styleSelected) continue
      if (this.datetimeSelected !== '全部' && item.time !== this.datetimeSelected) continue
      this.selAmmunitionList.push(item)
    }
    this.currentPage = 1
    this.currentPageList = this.selAmmunitionList.slice(0, this.pageSize)
  }
 
  async toggleAmmunitionEvent(item) { //获取指定弹药/弹药箱的事件历史
    this.ammunitionSelected = this.ammunitionSelected === item.id ? null : item.id
    if (this.ammunitionSelected) {
      this.ammunitionEventsPop = true
      let data
      if (item.code.slice(0,2) == '03')  // 弹药箱
        data = await AmmunitionInternetClient.getAmmunitionBoxEvent(item.id)
      else
        data = await AmmunitionInternetClient.getAmmunitionEvent(item.id)
      if(data) {
        this.ammunitionEvents = data
      }
    } else {
      this.ammunitionEvents = []
      this.ammunitionEventsPop = false
    }
  }
  currentChange(e) {
    this.currentPage = e
    this.currentPageList = this.selAmmunitionList.slice(this.pageSize*(e-1), this.pageSize*(e-1) + this.pageSize)
  }
  toggleListType(key) {  //展示方式选择
    if (myChart) {
      echarts.dispose(myChart)
      myChart = null
    }
    this.typeSelected = key
    if (key === 'listPop') return
    let normaldNum = 0,
        expiringNum = 0,
        overdueNum = 0
        for (let el of this.allAmmunitionList) {
          let num = el.code.slice(0,2) == '03' ?  4 : 1
          if (el.ammunitionStatus === 'normal') normaldNum += num
          else if (el.ammunitionStatus === 'expiring') expiringNum += num
          else if (el.ammunitionStatus === 'overdue') overdueNum += num
        }
        let seriesData = [
          { name: '正常', value: normaldNum, itemStyle: { normal: { color: '#1c1c1c' } } },
          { name: '即将过期', value: expiringNum, itemStyle: { normal: { color: '#f7931e' } } },
          { name: '已过期', value: overdueNum, itemStyle: { normal: { color: '#eb414f' } } }
        ]     
    if (key === 'histogramPop') {
      this.$nextTick(() => {
        myChart = echarts.init(document.getElementById('histogramPop'))
        myChart.setOption({
          tooltip: {},
          xAxis: { data: ['正常', '即将过期', '已过期'] },
          yAxis: {},
          series: [{
            name: '数量',
            type: 'bar',
            data: seriesData
          }]
        })
      })     
    } else if (key === 'piePop') {
      this.$nextTick(() => {
        myChart = echarts.init(document.getElementById('piePop'))
        myChart.setOption({
          tooltip : {},
          legend: {
            orient: 'vertical',
            left: 'left',
            data: ['正常','即将过期','已过期']
          },
          series : [
            {
              name: '数量',
              type: 'pie',
              radius : '55%',
              center: ['50%', '60%'],
              data: seriesData,
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        })
      })
    }
  }
}







