import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './WindRadar.html?style=./WindRadar.scss'
import * as CONFIG from '../../../config/productId'
import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'
import { Message } from 'element-ui'
import { getVelLevel } from '../../../util/windHelper'

import WindRadarDrawer from '../../../util/windRadarUtil'

let markerCollection = [],
  L = window['L'],
  destroyed = false;

@WithRender
@Component
export default class WindRadar extends Vue {
  @Action('systemStore/closeProductView_global') closeProductView_global
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  datetime: any = Date.now()
  drawingType: 'single' = 'single' //0：单雷达多时次 1：多雷达单时次
  radarType: 'ROBS' | 'HOBS' | 'OOBS' = 'ROBS'
  reqUrl: { max: string, mini: string, radar: string } = {
    max: 'http://10.148.16.217:11160/renyin5/radar/windprofile/rpoints',
    radar: 'http://10.148.16.217:11160/renyin5/radar/windprofile/lls',
    mini: 'http://10.148.16.217:11160/renyin5/radar/windprofile/height'
  }
  request = null
  multipleRadarData = null
  rectHeight = 600
  rectWidth = 740
  productId = CONFIG.windRadar
  radar: { obtid: string, addr: string, lon: number, lat: number }[] = []
  radarSelected: string = null
  minify: boolean = true
  heightSelected: number = 5800
  heightData: number[] = [
    5800, 5500, 5000, 3000, 1500, 500, 200
  ]
  radarHeightData: { centerLat: number, centerLon: number, wd: number, ws: number } = null

  async created() {
    destroyed = false
    let res = await axios({
      url: this.reqUrl.radar,
      adapter: jsonp
    })

    if (destroyed) return

    if (res.data.stateCode !== 0) {
      Message({
        type: 'warning',
        message: '获取雷达数据出错'
      })
      return
    }
    this.radar = res.data.data
    this.radarSelected = this.radar[0].obtid

    this.getRadarByHeight()
  }

  destroyed() {
    this.removeMarkerCollection()
    destroyed = true
  }

  async getRadarByHeight() {
    let params = {
      height: this.heightSelected,
      proid: this.radarType,
      time: moment(this.datetime).format('YYYY-MM-DD HH:mm:00')
    }
    let res = await axios({
      url: this.reqUrl.mini,
      adapter: jsonp,
      params
    })
    if (res.data.stateCode === -99) {
      Message.warning('当前时次没有数据，请更换时次再试')
      return
    }
    this.removeMarkerCollection()
    markerCollection = []
    for (let item of res.data.data) {
      markerCollection.push(addWindMarker(item.centerLat, item.centerLon, item.wd, item.ws))
    }

    function addWindMarker(lat, lon, dir, val) {
      let iconOpts = L.divIcon({
        className: 'divIcon-wind',
        html: `<div class="divIcon-wind-img-container" style="transform: rotateZ(${dir}deg); background-image: url(static/wind/${getVelLevel(val)}.png);"></div>`
      })
      let windMarker = L.marker([lat, lon], { icon: iconOpts })     // 风向图标
      windMarker.addTo(window['map'])
      return windMarker
    }
  }

  @Watch('minify')
  minifyChanged(val: any, oldVal: any): void {
    if (val)
      this.getRadarByHeight()
    else
      this.removeMarkerCollection() 
  }
  @Watch('heightSelected')
  heightSelectedChanged(val: any, oldVal: any): void {
    this.getRadarByHeight()
  }
  @Watch('datetime')
  datetimeChanged(val: any, oldVal: any): void {
    if (this.minify)
      this.getRadarByHeight()
  }

  async getRadarData() {
    let params = null
    if (!this.drawingType)
      return
    else
      params = {
        time: moment(this.datetime).format('YYYY-MM-DD HH:mm:00'),
        interval: 30,
        num: 11,
        obtid: this.radarSelected,
        proid: this.radarType
      }

    if (!this.radarSelected) {
      Message({
        type: 'warning',
        message: '请选择雷达'
      })
    }

    axios({
      url: this.reqUrl.max,
      adapter: jsonp,
      params
    }).then(res => {
      if (res.data.stateCode !== 0) {
        Message({
          type: 'warning',
          message: '数据出错,请切换时次再试'
        })
        return
      }

      let drawer = new WindRadarDrawer('multiple', 'WindRadarCanvas')
      drawer.setDrawType(this.drawingType)
      drawer.setData(res.data.data)
      drawer.draw(moment(this.datetime).format('YYYY-MM-DD HH:mm'), '雷达站:' + this.getRadarCNName())
    })
  }

  getRadarCNName() {
    for(let item of this.radar){
      if(item.obtid === this.radarSelected)
        return item.addr
    }
  }

  removeMarkerCollection() {
    for (let item of markerCollection) {
      window['map'].removeLayer(item)
    }
  }
}