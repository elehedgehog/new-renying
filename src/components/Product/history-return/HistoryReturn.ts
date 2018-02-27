import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './HistoryReturn.html?style=./HistoryReturn.scss'
import * as CONFIG from '../../../config/productId'
import * as moment from 'moment'
import { airlineDesignClient } from '../../../util/clientHelper'
import Helper from '../../../util/drawAirAreaHelper'

let helper: any
let map, L
@WithRender
@Component
export default class HistoryReturn extends Vue {
  moment = moment
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  productId: string = CONFIG.historyReturn
  msgSelected: string = 'airplane'
  airplaneDate: Date = new Date()
  airplaneHour: string = ''
  workDate: Date = new Date()
  historyAirline:any = []
  effectList: any= [1, 2, 3, 6, 12, 24]
  effectTime: number = 1
  lonLatEffect: any = []
  strEffectList: any = []
  strCompareList: any = []
  calPopup: boolean = false
  result: any = {}     
  points: any[] = []        //经纬度
  markerHolder: any[] = []
  polylineHolder: any = null
  lineTimeSelected: string = ''
  planeLine: any = {}
  async created() {
    map = window['map']
    L = window['L']
    let hour = new Date().getHours()
    this.airplaneHour = hour > 9 ? hour + '' : '0' + hour
    this.getTaskinfo()
  }
  destroyed() {
    if (helper) {
      helper.clearArea()
      helper = null
    }
    this.removeAllLayer()
  }
  async getTaskinfo() {
    let data = await airlineDesignClient.getTaskinfo()
    let obj = {}
    data.map(el => {
      el.FromTime.replace(/\((\w*)\+/, ($1, $2) => {
        this.$set(el, 'fTime', moment(+$2).format('YYYY年MM月DD日 HH时mm分'))
        obj[$2] = el
      })
    })
    this.planeLine = obj
    this.lineTimeSelected = Object.keys(obj)[0]
  }
  @Watch('lineTimeSelected')
  onLineTimeChanged (val: any, oldVal: any) {
    this.getTaskid()
  }

  async getTaskid() {  //获取飞行航迹信息
    this.removeAllLayer()
    let data = await airlineDesignClient.getTaskid(this.planeLine[this.lineTimeSelected].PlaneId, this.planeLine[this.lineTimeSelected].TaskId)
    console.log(data)
    let letlngs = []
    data.map((item, index) => {
      letlngs.push([item.Lat, item.Lon])
      let marker = L.marker([item.Lat, item.Lon], {
        icon: L.divIcon({
          className: 'airplane_icon',
          html: `<span class="airplane_icon_marker">${index + 1}</span>`
        })
      }).addTo(window['map'])
      this.markerHolder.push(marker)
    })
    this.polylineHolder = L.polyline(letlngs, { color: 'violet' }).addTo(map)
  }

  removeAllLayer() {
    let map = window['map']
    if (this.markerHolder.length) {
      for (let item of this.markerHolder) {
        map.removeLayer(item)
      }
      this.markerHolder = []
    }
    if (this.polylineHolder) {
      map.removeLayer(this.polylineHolder)
      this.polylineHolder = null
    }
  }

  toggleMsg(key) {
    this.calPopup = false
    if (key === this.msgSelected) return
    if (helper) {
      helper.clearArea()
      helper = null
    }
    this.removeAllLayer()
    this.msgSelected = key
    if (key === 'airplane') this.getTaskid()
  }
  
  drawAffectArea() {  //绘制影响区
    let global: any = <any>window
    let L = global['L'],
        map = global['map']
    if (helper) {
      helper.clearArea()
      helper = null
    }
    helper = new Helper(L, map)
    helper.startDrawAffectArea()
  }
  drawCompareArea() { //绘制对比区
    if (helper && helper.isFinishDarwCompare) return
    else if (helper && helper.isFinishDarwAffect) {
      Vue['prototype']['$message']({ type: 'warning', message: '鼠标左键点击影响区，移动鼠标，左键点击选择对比区' })
      helper.startDrawCompareArea()
    }
    else
      Vue['prototype']['$message']({ type: 'warning', message: '请先绘制影响区' })
  }
  async evaluate() {   //计算
    this.result = {}
    if (!helper || !helper.isFinishDarwAffect || !helper.isFinishDarwCompare) {
      Vue['prototype']['$message']({
        type: 'warning',
        message: '请先绘制影响区与对比区'
      })
      return
    }
    let strEffect = this.stringAreaArray(helper.affects)
    let strCompare = this.stringAreaArray(helper.compares)
    let datetime = moment(this.airplaneDate).format('YYYYMMDD') + this.airplaneHour
    let effectHours = this.effectTime
    let data = await airlineDesignClient.evaluate(strEffect, strCompare, datetime, effectHours)
    this.workDate = this.airplaneDate
    if (!data) {
      Vue['prototype']['$message']({
        type: 'error',
        message: '暂无数据'
      })
    } else
      this.result = data
    this.calPopup = true
  }

  stringAreaArray(arr) {
    let list: string[] = []
    for (let el of arr)
      list.push(el[1].toFixed(3) + ',' + el[0].toFixed(3))
    return list.join(';')
  }

 
}