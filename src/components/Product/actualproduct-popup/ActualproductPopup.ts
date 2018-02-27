import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './ActualproductPopup.html?style=./ActualproductPopup.scss'

import SelectToggle from '../../commons/select-toggle/SelectToggle'

import { productsClient } from '../../../util/clientHelper'
import * as CONFIG from '../../../config/productId'
import { getVelLevel } from '../../../util/windHelper'
import { Message } from 'element-ui'
import * as moment from 'moment'
import Vacuate from './vacuate'

let L, map, vacuate
let realInfo: any = {         // 存储站点数据
  gdAuto: null,
  gdArea: null,
  gpsSteam: null,
}
const stationIcon = window['L'].icon({
  className: 'airdromePonit',
  iconUrl: '/static/img/station.png',
  iconSize: [8, 8],
  iconAnchor: [4, 4],
})
const clusterOpt = {
  animate: false,
  disableClusteringAtZoom: 10,
  maxClusterRadius: 120,
  chunkedLoading: true,
}

@WithRender
@Component({
  components: {
    SelectToggle,
  },
})
export default class ActualproductPopup extends Vue {
  @Action('systemStore/closeProductView_global') closeProductView_global
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  productId: string = CONFIG.actualproduct
  stationType: any = {
    gdAuto: { show: false, param: 'A' },    // param对应 链接中的字段
    gdArea: { show: false, param: 'B' },
    gpsSteam: { show: false, param: 'g' },
  }
  realType: any = {
    temp: { show: false, cname: '温度', unit: '℃', classname: 'temp' },
    ps: { show: false, cname: '气压', unit: 'hPa', classname: 'ps' },
    rfhour: { show: false, cname: '降水', unit: 'mm', classname: 'rfhour' },
    dp: { show: false, cname: '露点温度', unit: '℃', classname: 'dp' },
    wind: { show: false, cname: '风力风向', unit: 'm/s', classname: 'wind' },
    rh: { show: false, cname: '相对湿度', unit: '%', classname: 'rh' },
    mean31_pwv: { show: false, cname: 'GPS水汽', unit: '%', classname: 'mean31_pwv' },
  }
  flag: boolean
  listener: any = {}
  date: Date = null
  hour: number = null
  minute: number = null
  minutesArr: any[] = []
  hourData = (() => {
    let arr = []
    for (let i = 0; i <= 23; i++) {
      arr.push(i >= 10 ? i : '0' + i)
    }
    return arr
  })()
  minify: boolean = false

  created() {
    map = window['map']
    L = window['L']
    // for (let i = 0; i < 12; i++) {
    //   this.minutesArr.push(5 * i)
    // }
    for (let i = 0; i < 60; i += 5) {
      if (i === 0) {
        this.minutesArr.push('00')
      } else if (i < 10) {
        this.minutesArr.push('0' + i)
      } else {
        this.minutesArr.push(String(i))
      }
    }
    this.getProdTime()
  }

  destroyed() {
    for (let i in this.realType) {
      if (this.realType[i].show) this.removeLayer(i)
    }
  }

  // 获取数据时间
  async getProdTime() {
    let res = await productsClient.getProdTime()
    if (!res) return
    let date = res[res.length - 1].datetime
    // let date: any = Date.now()
    // date = date - date % (6*60*1000) - 30*60*1000

    this.date = new Date(date)
    this.hour = Number(moment(date).format('HH'))
    this.minute = Number(moment(date).format('mm'))
  }

  getTimeString() {
    let time = moment(this.date).format('YYYY/MM/DD') + ' ' + (this.hour < 10 ? '0' + this.hour : String(this.hour)) + ':' + (this.minute < 10 ? '0' + this.minute : String(this.minute)) + ':00'
    time = moment(time).subtract(0, 'hours').format('YYYY-MM-DD HH:mm:00')
    return time
  }

  close() {
    this.toggleProductView_global({ id: this.productId, action: false })
  }

  @Watch('date')
  onDateChanged(val, oldVal) {
    this.onTimeChanged()
  }

  @Watch('hour')
  onHourChanged(val, oldVal) {
    this.onTimeChanged()
  }

  @Watch('minute')
  onMinuteChanged(val, oldVal) {
    this.onTimeChanged()
  }

  onTimeChanged() {
    for (let i in this.stationType) {
      if (this.stationType[i].show) {
        this.getProduct(i)
      }
    }
  }

  // 切换站点
  async toggleStation(key) {
    this.stationType[key].show = !this.stationType[key].show

    if (this.stationType[key].show) {
      for (let i in this.stationType) {
        if (i == key) continue
        this.stationType[i].show = false
      }
      if (key == 'gpsSteam') {
        for (let i in this.realType) {
          this.removeLayer(i)
          this.realType[i].show = false
        }
        this.realType['mean31_pwv'].show = true
      }
      else {
        this.removeLayer('mean31_pwv')
        this.realType['mean31_pwv'].show = false
      }

      if (!realInfo[key]) {
        let data = await productsClient.getStation(this.stationType[key].param)
        if (!data) {
          Message({
            type: 'warning',
            message: '站点数据获取失败',
          })
          return
        }
        let obj = {}
        for (let item of data) {
          obj[item.id] = item
        }
        realInfo[key] = obj
      }
      // this.addStation(key, realInfo[key])
      this.getProduct(key)
    }
    else {
      for (let i in this.realType) {
        this.realType[i].show = false
        this.removeLayer(i)
      }
    }
  }

  async getProduct(key) {
    // 清除实况数据
    for (let i in realInfo[key]) {
      realInfo[key][i].datetime = null
      realInfo[key][i].elems = null
    }
    // 获取站点气象数据信息
    let msg = await productsClient.getProducts(this.stationType[key].param, this.getTimeString())
    if (!msg) {
      Message({
        type: 'warning',
        message: '实况数据获取失败',
      })
      return
    }
    if (!msg.length) {
      Message({
        type: 'warning',
        message: '实况数据获取失败',
      })
    }
    for (let opt of msg) {
      let id = opt.id
      if (realInfo[key][id]) {
        realInfo[key][id].datetime = opt.datetime
        realInfo[key][id].elems = opt.elems
      }
    }

    // 添加已选中实况元素数据
    for (let i in this.realType) {
      if (this.realType[i].show) {
        this.addReal(key, i, realInfo[key])
      }
    }
  }

  // 切换数据显示
  toggleReal(key) {
    this.realType[key].show = !this.realType[key].show
    if (this.realType[key].show) {
      for (let i in this.realType) {
        if (i != key) {
          this.realType[i].show = false
          this.removeLayer(i)
        }
      }
      for (let type in realInfo) {
        if (!this.stationType[type].show) continue
        this.addReal(type, key, realInfo[type])
      }
    }
    else {
      this.removeLayer(key)
    }
  }

  // 添加站点图标
  // addStation(key, data) {
  //   if (key === 'gdArea') {
  //     let markers = new L.layerGroup()
  //     for (let i in data) {
  //       let item = data[i]
  //       let marker = L.marker([item.loc.lat, item.loc.lon], {icon: stationIcon})
  //       markers.addLayer(marker)
  //     }
  //     markers.id = key
  //     map.addLayer(markers)
  //   } else {
  //     for (let i in data) {
  //       let item = data[i]
  //       let marker = L.marker([item.loc.lat, item.loc.lon], {icon: stationIcon})
  //       marker.id = key
  //       marker.addTo(map)
  //     }
  //   }
  // }

  // 添加站点实况数据
  addReal(type, key, data) {
    this.removeLayer(key)
    let tmp = []
    let className = `divIcon-${key}`
    for (let i in data) {
      let opt = data[i]
      if (!opt.elems || key != 'wind' && (opt.elems[key] === undefined || opt.elems[key] > 8888 ||
          opt.elems[key] < -8888) || key === 'ps' && opt.elems[key] < 900 || key === 'temp' && opt.elems[key] > 50 || key === 'dp' && opt.elems[key] > 50) continue
      let marker = key != 'wind' ? L.marker([opt.loc.lat, opt.loc.lon], {
        icon: L.divIcon({
          className: className,
          html: `<span>${Math.floor(opt.elems[key] * 100) / 100} ${this.realType[key].unit}</span>`,
        }),
      }) : L.angleMarker([opt.loc.lat, opt.loc.lon], {
        icon: new L.Icon({
          iconUrl: `static/wind/${getVelLevel(opt.elems.wd2df)}.png`,
          iconSize: [18, 32],
          iconAnchor: [0, 32],
        }),
        iconAngle: opt.elems.wd2dd,
        iconOrigin: '0% 100%',
        zIndexOffset: -1,
      })
      tmp.push({ marker: marker, x: opt.loc.lat, y: opt.loc.lon })
    }

    vacuate = new Vacuate(tmp, key == 'wind' ? 'distance2' : 'manhattan')

    let cb = () => {
      if (this.flag) return
      this.flag = true
      this.render2(type, key)
      setTimeout(() => this.flag = false, 50)
    }
    this.listener[key + 'z'] = cb
    this.listener[key + 'm'] = cb
    map.on('zoomend', cb)
    map.on('moveend', cb)
    this.render2(type, key)
  }

  render2(type, key) {
    //console.time('time')
    map.eachLayer(e => {
      if (e.id == key) {
        map.removeLayer(e)
      }
    })
    let markers = vacuate.render(map, L)
    markers.id = key
    map.addLayer(markers)
    //console.info('zoom level: ', map.getZoom(), ' total: ', markers.getLayers().length)
    //console.timeEnd('time')
  }

  hourChange(val) {
    this.hour = val
  }

  minuteChange(val) {
    this.minute = val
  }

  // 删除图层数据
  removeLayer(key) {
    map.eachLayer(e => {
      if (e.id == key) {
        map.removeLayer(e)
        if (this.listener[key + 'z'])
          map.off('zoomend', this.listener[key + 'z'])
        if (this.listener[key + 'm'])
          map.off('moveend', this.listener[key + 'm'])
        this.listener = {}
      }
    })
  }
}
