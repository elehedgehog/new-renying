import {

} from '../mutation-types'
import axios from 'axios'
import jsonp from 'axios-jsonp'

export class State {
  constructor() {
    this.getAppGroupData().then(data => {
      this.appGroupData = [].concat(data)
    })
    this.getWorkStationData().then(data => {
      this.operateStationData = [].concat(data)
    })
    this.getAllMember().then(data => {
      this.appUserData = [].concat(data)
    })
    this.getRepoData().then(data => {
      this.repoData = [].concat(data)
    })
    this.getPhoneLiveData().then(data => {
      this.phoneLiveData = data
    })
    this.getAirRequestData().then(data => {
      this.airRequestData = data
    })
  }
  userInfo: any = {}
  subMenu: any[] = []

  productViewHolder: any = {}
  articleViewHolder: any = {
    id: null,
    type: null
  }
  isClosingPopup: boolean = false
  isMenuChanged: boolean = false    // 改变时更改目录
  isSecondMenuChanged: boolean = false
  isTransportOpened: boolean = false //是否打开运输状态

  // 是否打开作业点搜索按钮
  isSearchOperateStationWindowOn: boolean = false
  // 侧边导航栏是否展开
  isLeftNavOpened: boolean = false

  socket: WebSocket = null
  socketIntervalHolder: any = null
  socketMessage: any[] = []
  socketCurrentMessage: any = ''
  // 强制刷新任务跟踪
  freshOperate: any = ''
  // 是否显示运输弹药航迹
  isShowTransportLayer: boolean = true
  // 是否显示空域申报图纸
  isShowAirRequestLayer: boolean = true
  // 是否显示飞机航迹
  isShowAirLineLayer: boolean = true
  // 是否显示直播图标
  isShowPhoneLiveLayer: boolean = true
  // 

  // 直播数据
  phoneLiveData: any[] = []
  // 申请空域数据
  airRequestData: any[] = []
  
  // 手机直播id
  phoneLiveId = ''

  // 运输数组
  transportData = {}
  isTransportDataChange = 0
  // 仓库数据
  repoData = []

  // #todo 每个修改app人员 作业点 人员群组的都要更新全局仓库的数据
  // 作业点
  operateStationData: any[] = []
  // 人员群组
  appGroupData: any[] = []
  // app账户人员
  appUserData: any[] = []

  isDisasterManageImg: boolean = false   //灾情管理
  disasterMsg: any = {}

  isCappiProfileOn: boolean = false
  cappiProfile: any = { SLat: null, SLon: null, ELat: null, ELon: null }      // 雷达剖面
  isOrderDispatchOn: boolean = false          //指令调度
  async  getWorkStationData() {
    let res = await axios({
      url: this.workStationRequestUrl,
      adapter: jsonp
    })
    return res.data.data
  }

  async getRepoData() {
    let res = await axios({
      url: 'http://10.148.16.217:11160/renying/repository'
    })
    return res.data
  }

  async  getAppGroupData() {
    let res = await axios({
      url: this.appGroupRequestUrl,
      adapter: jsonp
    })
    return res.data.data
  }

  async getAllMember() { //获取全部成员列表
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renyin5/appuser/selectAll`,
      adapter: jsonp,
    })
    return res.data.data
  }
  async getPhoneLiveData() {
    let res = await axios({
      url: 'http://10.148.16.217:11160/renying/live?started'
    })
    return res.data
  }
  async getAirRequestData() {
    let res = await axios({
      url: 'http://10.148.16.217:11160/renying/airspaceApplication?started'
    })
    return res.data
  }

  workStationRequestUrl = 'http://10.148.16.217:11160/renyin5/fp/operation/finds'
  appGroupRequestUrl = 'http://10.148.16.217:11160/renyin5/webuser/group'
  // 获取运输所有数据
  getTransportDataUrl = 'http://10.148.16.217:11160/renying/event/'
  aqiDetailInfo: any = {}

  // 颜色条
  colorbarElements: any = {}
}
