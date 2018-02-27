import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './AirDetect.html?style=./AirDetect.scss'
import * as CONFIG from '../../../config/productId'
import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'
import { Message } from 'element-ui'
import { getVelLevel } from '../../../util/windHelper'
import AirDetectDrawer from '../../../util/airDetectUtil'

import WindRadarDrawer from '../../../util/windRadarUtil'
import SelectToggle from '../../commons/select-toggle/SelectToggle'

let markerCollection = [],
  L = window['L']

@WithRender
@Component({
  components: {
    SelectToggle
  }
})
export default class AirDetect extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  date = moment().format('YYYY-MM-DD')
  time: '08' | '20' = '08'
  productId = CONFIG.airDetect
  stationReqUrl = 'http://10.148.16.217:11160/renyin5/conn/st/high/infos'
  airDetectReqUrl = 'http://10.148.16.217:11160/renyin5/conn/st/high/detail'
  obtSelected = 0
  stationData: {
    staName: string, obtId: string, index: number
  }[] = []
  airDetectData = []
  drawer: AirDetectDrawer

  async created() {
    let nowHour = new Date().getHours()
    if (nowHour < 20 && nowHour > 8) {
      this.time = '08'
    } else if (nowHour < 8) {
      this.date = moment().subtract(1, 'days').format('YYYY-MM-DD')
      this.time = '20'
    } else {
      this.time = '20'
    }
    await this.getStationData()
    await this.getAirDetectData()
    this.drawer = new AirDetectDrawer('#airDetect1', this.airDetectData[0])
    this.drawer.draw()
  }

  @Watch('time')
  async timeChanged(val: any, oldVal: any) {
    await this.getAirDetectData()
    this.drawer = new AirDetectDrawer('#airDetect1', this.airDetectData[this.obtSelected])
    this.drawer.draw()
  }
  @Watch('date')
  async  dateChanged(val: any, oldVal: any) {
    await this.getAirDetectData()
    this.drawer = new AirDetectDrawer('#airDetect1', this.airDetectData[this.obtSelected])
    this.drawer.draw()
  }
  @Watch('obtSelected')
  async  obtSelectedChanged(val: any, oldVal: any) {
    await this.getAirDetectData()
    this.drawer = new AirDetectDrawer('#airDetect1', this.airDetectData[this.obtSelected])
    this.drawer.draw()
  }
  obtSelectedChange(val){
    this.obtSelected = val
  }

  async getAirDetectData() {
    let res = null
    this.airDetectData = []
    for (let item of this.stationData) {
      res = await axios({
        adapter: jsonp,
        url: this.airDetectReqUrl,
        params: {
          obtId: item.obtId,
          time: `${moment(this.date).format('YYYY-MM-DD')} ${this.time}:00:00`
        }
      })
      this.airDetectData.push(res.data.data)
    }
    return
  }

  async getStationData() {
    let res = await axios({
      url: this.stationReqUrl,
      adapter: jsonp
    })
    this.stationData = []
    for (let i in res.data.data) {
      this.stationData.push(
        Object.assign(res.data.data[i], { index: Number(i) })
      )
    }
    return
  }
}