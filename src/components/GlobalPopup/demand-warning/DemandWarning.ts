import Vue from 'vue'
import * as CONFIG from '../../../config/productId'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './DemandWarning.html?style=./DemandWarning.scss'

import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'

@WithRender
@Component
export default class DemandWarning extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  dryProductId = CONFIG.dryCondition
  reservoirProductId = CONFIG.reservoirLevel
  forestProductID = CONFIG.forestFire
  displayPopup: boolean = false
  panelNum: number = 0
  tempData = []
  forestData = []
  reservoirData = []
  dryData = []
  warnItem = []
  reqUrl: string[] = [
    'http://10.148.16.217:9020/dao/ghjcData',
    'http://10.148.16.217:11160/renyin5/waterline/reservoir',
    'http://10.148.16.217:11160/renyin5/warn/tf',
    'http://10.148.16.217:11160/renyin5/warn/tf'
  ]
  typeArray: string[] = [
    '',
    '',
    'temp',
    'forest'
  ]

  created() {
    this.getTempAndForest()
    this.getReservoirData()
    this.getDryData()
  }

  mouseOver(num: number) {
    this.displayPopup = true
    this.panelNum = num
    this.warnItem = []
    if (num === 0) {
      for (let item of this.dryData) {
        this.warnItem.push(`城市:${item.name} 预警等级:${this.getDryLevelText(item.dj)}`)
      }
    } else if (num === 2)
      for (let item of this.tempData) {
        this.warnItem.push(`城市:${item.city} 预警等级:${this.getTempLevelText(item.tempLev)}色`)
      }
    else if (num === 3)
      for (let item of this.forestData) {
        this.warnItem.push(`城市:${item.city} 预警等级:${item.forestLev}`)
      }
    else {
      for (let item of this.reservoirData) {
        this.warnItem.push(`站点名:${item.stationname} 水位:${item.waterlev}`)
      }
    }
  }

  async getReservoirData() {
    let date = moment().subtract(20, 'minute').format('YYYY-MM-DD HH:mm:00')
    let params = {
      time: date,
      addrType: 'province',
      name: '广东'
    }
    let res = await axios({
      adapter: jsonp,
      url: this.reqUrl[1],
      params
    })
    this.reservoirData = []
    if (res.data.stateCode != -99)
      for (let item of res.data.data) {
        if (item.waterlev < (item.alertLev * (3 / 4))) {
          this.reservoirData.push(item)
        }
      }
  }

  async getTempAndForest() {
    let date = moment().format('YYYY-MM-DD HH:mm:00')
    let reqArr = []
    for (let i = 2; i < 4; i++) {
      reqArr.push(
        axios({
          url: this.reqUrl[i],
          params: {
            time: date,
            warnType: this.typeArray[i],
            addrType: 'province',
            name: '广东'
          },
          adapter: jsonp
        })
      )
    }

    let res = await Promise.all(reqArr)
    this.tempData = res[0].data.data
    this.forestData = res[1].data.data
    this.$forceUpdate()
  }

  async getDryData() {
    let params = {
      dateStart: moment().format('YYYY-MM-DD HH:mm:00')
    }
    let res = await axios({
      adapter: jsonp,
      params,
      url: this.reqUrl[0]
    })
    this.dryData = []
    if (res.data.status) {
      for (let item of res.data.list) {
        if (item.dj >= 2) {
          this.dryData.push(item)
        }
      }
    }
  }
  getDryLevelText(val) {
    switch (val) {
      case 1: return '轻旱'
      case 2: return '中旱'
      case 3: return '重旱'
      case 4: return '特旱'
      default: return '正常'
    }
  }
  getTempLevelText(val) {
    switch (val) {
      case 1: return '白'
      case 2: return '蓝'
      case 3: return '黄'
      case 4: return '橙色'
      case 5: return '红'
      default: '正常'
    }
  }
}



