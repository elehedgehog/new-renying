import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './ShortRadar.html?style=./ShortRadar.scss'
import * as CONFIG from '../../../config/productId'
import { Message } from 'element-ui'
import * as moment from 'moment'
import SelectToggle from '../../commons/select-toggle/SelectToggle'

let map, L

@WithRender
@Component({
  components: {
    SelectToggle
  }
})
export default class ShortRadar extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  @Action('systemStore/storecolorbarElements_global') storecolorbarElements_global
  productId: string = CONFIG.shortRadar
  isComponetAlive: boolean = true
  radarDate: string = null
  radarHour: string = null
  radarMinute: string = null

  qpeqpfDate: string = null
  qpeqpfHour: string = null
  qpeqpfMinute: string = null
  minify: boolean = false
  bounds: any = []

  hourData: any = []
  minuteData: string[] = []
  mounted() {
    for(let i=0; i<=23; i++){
      if(i<10){
        this.hourData.push('0' + i)
      } else{
        this.hourData.push('' + i)
      }
    }

    for (let i = 0; i < 60; i += 6) {
      if (i === 0) {
        this.minuteData.push('00')
      } else if (i < 10) {
        this.minuteData.push('0' + i)
      } else {
        this.minuteData.push(String(i))
      }
    }
  }
  created() {
    map = window['map']
    L = window['L']
    this.getProdTime()
    map.on('moveend', this.radarLayerChanged)
  }

  destroyed() {
    map.off('moveend', this.radarLayerChanged)
    this.isComponetAlive = false
    for (let item in this.radarProduct) {
      if (this.radarProduct[item].layer) map.removeLayer(this.radarProduct[item].layer)
    }
    for (let item in this.qpeqpfProduct) {
      if (this.qpeqpfProduct[item].layer) {
        map.removeLayer(this.qpeqpfProduct[item].layer)
        this.storecolorbarElements_global({ key: this.qpeqpfProduct[item].colorParmar, type: 'remove' })
      }
    }
    for(let item in this.radarProduct){
      if (this.radarProduct[item].layer) {
        map.removeLayer(this.radarProduct[item].layer)
        this.storecolorbarElements_global({ key: this.radarProduct[item].colorParmar, type: 'remove' })
      }
    }
  }

  private getRadarUrl(element, level?: number) {
    return `http://10.148.83.228:8922/dataunit/temporary/renderTemporaryData?type=swan&datetime={datetime}&element=${element}&time=0&level=${level ? level : 0}&top={top}&bottom={bottom}&left={left}&right={right}&width=2000&height=2000`
  }

  private getQpfQpeUrl(element, level?: number, time?: number) {
    return `http://10.148.83.228:8922/dataunit/temporary/renderTemporaryData?type=swan&datetime={datetime}&element=${element}&time=${time ? time : 0}&level=${level ? level : 0}&top={top}&bottom={bottom}&left={left}&right={right}&width=2000&height=2000`
  }
  getProdTime() {
    let momentHolder = moment().subtract(18, 'minute')
    const minute = Math.floor(momentHolder.get('minute') / 6) * 6
    let date = momentHolder.set('minute', minute)
    console.log(moment(date).format('YYYY-MM-DD hh:mm:ss'))
    // this.radarDate = new Date(momentHolder.get('millisecond'))
    this.radarDate = momentHolder.format('YYYY-MM-DD')
    this.radarHour = momentHolder.format('HH')
    this.radarMinute = momentHolder.format('mm')
    // this.qpeqpfDate = new Date(momentHolder.get('millisecond'))
    this.qpeqpfDate = momentHolder.format('YYYY-MM-DD')
    this.qpeqpfHour = momentHolder.format('HH')
    this.qpeqpfMinute = momentHolder.format('mm')
  }

  radarProduct: any = {
    cappi3: { text: 'CAPPI3 公里', show: false, url: this.getRadarUrl('cappi', 3), colorParmar: 'cappi', layer: null },
    echoHeight: { text: '回波顶高', show: false, url: this.getRadarUrl('mtop'), layer: null },
    cappi1: { text: 'CAPPI1 公里', show: false, url: this.getRadarUrl('cappi', 1), colorParmar: 'cappi',layer: null },
    reflex: { text: '组合反射率', show: false, url: this.getRadarUrl('mcr'), layer: null },
    cappi5: { text: 'CAPPI5 公里', show: false, url: this.getRadarUrl('cappi', 5), colorParmar: 'cappi',layer: null },
    vil: { text: 'VI:液态降水', show: false, url: this.getRadarUrl('mvil'), layer: null },
    titan: { text: '雷暴跟踪（TITAN）', show: false, url: 'http://10.148.83.228:8922/dataunit/titan/renderTitan/?datetime={datetime}&top=27&bottom=18.2&left=108.5&right=119&width=2000&height=2000', layer: null },
    // hail: { text: '冰雹', show: false, url: '', layer: null },
  }
  qpeqpfProduct: any = {
    // qpe: { text: 'QPE', show: false, url: this.getQpfQpeUrl('qpe'), layer: null },
    // qpeAdd: { text: 'QPE逐小时累计', show: false, url: this.getQpfQpeUrl('qpe', 3, 60), layer: null }, //
    qpeSix: { text: 'QPE逐6分钟', show: false, url: this.getQpfQpeUrl('qpe',0,0), colorParmar: 'qpe', layer: null },
    // qpeSixAdd: { text: 'QPE逐6分钟累计', show: false, url: '', layer: null },
    qpf: { text: 'QPF半小时', show: false, url: this.getQpfQpeUrl('qpf', 3, 30), colorParmar: 'qpf', layer: null },
    qpfAdd: { text: 'QPF一小时', show: false, url: this.getQpfQpeUrl('qpf', 3, 60), colorParmar: 'qpf', layer: null },
    qpfTwo: { text: 'QPF两小时', show: false, url: this.getQpfQpeUrl('qpf', 3, 120), colorParmar: 'qpf', layer: null },
    qpfSix: { text: 'QPF三小时', show: false, url: this.getQpfQpeUrl('qpf', 3, 180), colorParmar: 'qpf', layer: null },
    // qpfSixAdd: { text: 'QPF逐6分钟累计', show: false, url: '', layer: null },
    mixRain:{ text:'融合降水逐小时', show: false, url: this.getQpfQpeUrl('mvil', 0, 0), layer: null },
    // mixRainAdd:{ text:'融合降水逐小时累计', show: false, url: '', layer: null },
  }
  toggleRadarProduct(key) {
    this.radarProduct[key].show = !this.radarProduct[key].show
    if (this.radarProduct[key].show) {
      let imageUrl = this.getRadarImageUrl(key)
      this.addRadarImageLayer(key, imageUrl)
    } else {
      this.removeRadarImageLayer(key)
    }
  }

  toggleQpeqpfProduct(key) {
    this.qpeqpfProduct[key].show = !this.qpeqpfProduct[key].show
    if (this.qpeqpfProduct[key].show) {
      let imageUrl = this.getQpeqpfImageUrl(key)
      this.addQpeqpfImageLayer(key, imageUrl)
    } else {
      this.removeQpeqpfImageLayer(key)
    }
  }

  // 获取雷达产品链接
  getRadarImageUrl(key) {
    let bounds = map.getBounds(),
      left = bounds._southWest.lng,
      right = bounds._northEast.lng,
      top = bounds._northEast.lat,
      bottom = bounds._southWest.lat
    this.bounds = [[top, left], [bottom, right]]
    let datetime = moment(this.radarDate).add(this.radarHour, 'hours').add(this.radarMinute, 'minutes').format('YYYY-MM-DD HH:mm:00')
    let url = this.radarProduct[key].url.replace('{datetime}', datetime).replace('{left}', left).replace('{right}', right).replace('{top}', top).replace('{bottom}', bottom)
    return url
  }

  addRadarImageLayer(key, url) {
    let img = new Image()
    img.onload = () => {
      if (this.isComponetAlive) {
        // this.removeRadarImageLayer(key)
        // this.radarProduct[key].layer = L.imageOverlay(url, this.bounds)
        // this.radarProduct[key].layer.addTo(map)
        if (!this.radarProduct[key].layer) {
          this.radarProduct[key].layer = L.imageOverlay(url, this.bounds)
          this.radarProduct[key].layer.addTo(map)
        } else {
          this.radarProduct[key].layer.setUrl(url)
          this.radarProduct[key].layer
            .setBounds(L.latLngBounds(L.latLng(this.bounds[0][0], this.bounds[0][1]), L.latLng(this.bounds[1][0], this.bounds[1][1])))
        }
        if (this.radarProduct[key].colorParmar)
        this.storecolorbarElements_global({ key: this.radarProduct[key].colorParmar, type: 'add' })
      } else {
        if (this.radarProduct[key].layer) map.removeLayer(this.radarProduct[key].layer)
        if (this.radarProduct[key].colorParmar)
        this.storecolorbarElements_global({ key: this.radarProduct[key].colorParmar, type: 'remove' })
      }

    }
    img.onerror = () => {
      if (this.isComponetAlive)
        Vue.prototype['$message']({
          type: 'warning',
          message: '该时暂无数据'
        })
      this.removeRadarImageLayer(key)
      if (this.radarProduct[key].colorParmar)
      this.storecolorbarElements_global({ key: this.radarProduct[key].colorParmar, type: 'remove' })
    }
    img.src = url
  }

  removeRadarImageLayer(key) {
    if (this.radarProduct[key].colorParmar)
    this.storecolorbarElements_global({ key: this.radarProduct[key].colorParmar, type: 'remove' })
    if (!this.radarProduct[key].layer) return
    map.removeLayer(this.radarProduct[key].layer)
    this.radarProduct[key].layer = null
  }

  // 获取QPEQPF产品链接
  getQpeqpfImageUrl(key) {
    let bounds = map.getBounds(),
      left = bounds._southWest.lng,
      right = bounds._northEast.lng,
      top = bounds._northEast.lat,
      bottom = bounds._southWest.lat
    this.bounds = [[top, left], [bottom, right]]
    let datetime = moment(this.qpeqpfDate).add(this.qpeqpfHour, 'hours').add(this.qpeqpfMinute, 'minutes').format('YYYY-MM-DD HH:mm:00')
    let url = this.qpeqpfProduct[key].url.replace('{datetime}', datetime).replace('{left}', left).replace('{right}', right).replace('{top}', top).replace('{bottom}', bottom)
    return url
  }
  addQpeqpfImageLayer(key, url) {
    let img = new Image()
    img.onload = () => {
      if (this.isComponetAlive) {
        if (!this.qpeqpfProduct[key].layer) {
          this.qpeqpfProduct[key].layer = L.imageOverlay(url, this.bounds)
          this.qpeqpfProduct[key].layer.addTo(map)
        } else {
          this.qpeqpfProduct[key].layer.setUrl(url)
          this.qpeqpfProduct[key].layer.setBounds(L.latLngBounds(L.latLng(this.bounds[0][0], this.bounds[0][1]), L.latLng(this.bounds[1][0], this.bounds[1][1])))
        }
        if (this.qpeqpfProduct[key].colorParmar)
          this.storecolorbarElements_global({ key: this.qpeqpfProduct[key].colorParmar, type: 'add' })
      } else {
        if (this.qpeqpfProduct[key].layer) map.removeLayer(this.qpeqpfProduct[key].layer)
        if (this.qpeqpfProduct[key].colorParmar)
          this.storecolorbarElements_global({ key: this.qpeqpfProduct[key].colorParmar, type: 'remove' })
      }
    }
    img.onerror = () => {
      if (this.isComponetAlive)
        Vue.prototype['$message']({
          type: 'warning',
          message: '该时暂无数据'
        })
      if (this.qpeqpfProduct[key].colorParmar)
        this.storecolorbarElements_global({ key: this.qpeqpfProduct[key].colorParmar, type: 'remove' })
    }
    img.src = url
  }
  removeQpeqpfImageLayer(key) {
    if (this.qpeqpfProduct[key].colorParmar)
      this.storecolorbarElements_global({ key: this.qpeqpfProduct[key].colorParmar, type: 'remove' })
    if (!this.qpeqpfProduct[key].layer) return
    map.removeLayer(this.qpeqpfProduct[key].layer)
    this.qpeqpfProduct[key].layer = null
  }

  @Watch('radarDate')
  onradarDateChanged(val: any, oldVal: any) {
    this.radarLayerChanged()
  }
  radarHourSelectedChange(val){
    this.radarHour = val
  }
  @Watch('radarHour')
  onradarHourChanged(val: any, oldVal: any) {
    this.radarLayerChanged()
  }
  radarMinuteSelectedChange(val){
    this.radarMinute = val
  }
  @Watch('radarMinute')
  onradarMinuteChanged(val: any, oldVal: any) {
    this.radarLayerChanged()
  }

  @Watch('qpeqpfDate')
  onqpeqpfDateChanged (val: any, oldVal: any) {
    this.qpeqpfLayerChanged()
  }
  qpeqpfHourSelectedChange(val){
    this.qpeqpfHour = val
  }
  @Watch('qpeqpfHour')
  onqpeqpfHourChanged (val: any, oldVal: any) {
    this.qpeqpfLayerChanged()
  }
  qpeqpfMinuteSelectedChange(val) {
    this.qpeqpfMinute = val
  }
  @Watch('qpeqpfMinute')
  onqpeqpfMinuteChanged (val: any, oldVal: any) {
    this.qpeqpfLayerChanged()
  }

  radarLayerChanged() {
    for (let item in this.radarProduct) {
      if (this.radarProduct[item].show) {
        let url = this.getRadarImageUrl(item)
        this.addRadarImageLayer(item, url)
      }
    }
  }
  qpeqpfLayerChanged() {
    for (let item in this.qpeqpfProduct) {
      if (this.qpeqpfProduct[item].show) {
        let url = this.getQpeqpfImageUrl(item)
        this.addQpeqpfImageLayer(item, url)
      }
    }
  }
  toggleDate() {
    this.minify = !this.minify
  }

}