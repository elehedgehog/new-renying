import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './NewTrajectory.html?style=./NewTrajectory.scss'
import { Message } from 'element-ui'

import axios from 'axios'
import jsonp from 'axios-jsonp'
import * as moment from 'moment'

import SelectToggle from '../../../commons/select-toggle/SelectToggle'

let map, L
let airportData = null
@WithRender
@Component({
  components: {
    SelectToggle
  }
})
export default class NewTrajectory extends Vue {
  name: string = ''
  polylineHolder: any = null
  areaSelected: number[] = []
  minDbz = 10
  maxDbz = 30
  airport = ''
  airportData = airportData ? airportData : null
  markerHolder: any[] = []
  lineReqUrl = 'http://10.148.16.217:9020/radar/AirLineDesign'
  changeReUrl = 'http://10.148.16.217:9020/dao/airline_design/update'
  addReqUrl = 'http://10.148.16.217:9020/dao/airline_design/add'
  loading: boolean = false
  lonInput: string = null
  latInput: string = null
  points: any[] = []  //经纬度
  @Prop() historyData
  @Prop() clearHistoryData
  @Prop() layer

  //雷达产品
  private getRadarUrl(element, level?: number) {
    return `http://10.148.83.228:8922/dataunit/temporary/renderTemporaryData?type=swan&datetime={datetime}&element=${element}&time=0&level=${level ? level : 0}&top={top}&bottom={bottom}&left={left}&right={right}&width=2000&height=2000`
  }
  radarProduct: any = {
    cappi3: { text: 'CAPPI3 公里', url: this.getRadarUrl('cappi', 3) },
    echoHeight: { text: '回波顶高', show: false, url: this.getRadarUrl('mtop') },
    cappi1: { text: 'CAPPI1 公里', url: this.getRadarUrl('cappi', 1), },
    reflex: { text: '组合反射率', url: this.getRadarUrl('mcr'), },
    cappi5: { text: 'CAPPI5 公里', url: this.getRadarUrl('cappi', 5), },
    vil: { text: 'VI:液态降水', url: this.getRadarUrl('mvil'), },
    titan: { text: '雷暴跟踪（TITAN）', url: 'http://10.148.83.228:8922/dataunit/titan/renderTitan/?datetime={datetime}&top=27&bottom=18.2&left=108.5&right=119&width=2000&height=2000', layer: null },
    // hail: { text: '冰雹',url: '', },
  }
  radarProductLayer: any = null
  radarProductSelected: string = ''
  isComponetAlive: boolean = true
  radarDate: Date = null
  radarHour: string = null
  radarMinute: string = null
  radarDatetime: string = ''
  bounds: any = []
  hourData: string[] = []
  minuteData: string[] = []
  unitSelected: string = 'dfm'
  async created() {
    if (!this.airportData)
      await this.getAirportData()

    if (this.historyData) {
      this.airport = this.historyData.airport
      this.convertData(this.historyData.data)
      this.drawAirLien()
      this.clearHistoryData()
    }
    window['map'].on('mousemove', this.mouseMoveEvent)
    window['map'].on('click', this.clickEvent)
    //雷达
    for (let i = 0; i <= 23; i++) {
      if (i < 10) {
        this.hourData.push('0' + i)
      } else {
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

    map = window['map']
    L = window['L']

    let date = Date.now() - Date.now() % (6 * 60 * 1000) - 18 * 60 * 1000
    let momentHolder = moment(date)
    // this.radarDate = new Date(momentHolder.get('millisecond'))
    this.radarDate = new Date(date)
    this.radarHour = momentHolder.format('HH')
    this.radarMinute = momentHolder.format('mm')
    map.on('moveend', this.radarLayerChanged)
    Vue.prototype['$message']({
      type: 'success',
      message: '左键按住拖动航点，右键删除'
    })
  }
  destroyed() {
    this.removeAllLayer()
    window['map'].off('mousemove', this.mouseMoveEvent)
    let ele = document.querySelector('#trajectory')
    if (ele) document.body.removeChild(ele)
    window['map'].off('click', this.clickEvent)


    //雷达
    map.off('moveend', this.radarLayerChanged)
    this.isComponetAlive = false
    for (let item in this.radarProduct) {
      if (this.radarProductLayer) map.removeLayer(this.radarProductLayer)
    }
  }

  drawAirLien() {
    this.removeAllLayer()
    this.points.map((item, index) => {
      let marker = L.marker([item.lat, item.lon], {
        draggable: true,
        icon: L.divIcon({
          className: 'airplane_icon',
          html: `<span class="airplane_icon_marker">${index + 1}</span>`
        })
      }).addTo(window['map'])
      marker.on('drag', (e) => {
        for (let i in this.markerHolder) {
          if (e.target === this.markerHolder[i]) {
            this.points[i].lat = Number(e.latlng.lat.toFixed(4))
            this.points[i].lon = Number(e.latlng.lng.toFixed(4))
            this.polylineHolder.setLatLngs(this.points)
          }
        }
      })
      marker.on('contextmenu', e => {
        for (let i in this.markerHolder) {
          if (e.target === this.markerHolder[i]) {
            this.points.splice(Number(i), 1)
            map.removeLayer(this.markerHolder[i])
            this.markerHolder.splice(Number(i), 1)
            this.polylineHolder.setLatLngs(this.points)
          }
        }
      })
      this.markerHolder.push(marker)
    })
    this.polylineHolder = L.polyline(this.points, { color: 'violet' }).addTo(map)
  }
  convertData(data) {
    this.points = []
    for (let el of data) {
      this.points.push({ lat: el[1], lon: el[0], isPopupOn: false })
    }
  }
  removeAllLayer() {
    let map = window['map']
    if (this.markerHolder.length) {
      for (let item of this.markerHolder) {
        map.removeLayer(item)
      }
      this.markerHolder = []
    }
    if (map.hasLayer(this.polylineHolder)) {
      map.removeLayer(this.polylineHolder)
      this.polylineHolder = null
    }
  }

  async getAirportData() {
    let res = await axios({
      adapter: jsonp,
      url: 'http://10.148.16.217:11160/renyin5/conn/airports'
    })
    this.airportData = res.data
    this.airport = this.airportData[0].chinesename
  }

  async savePlane() {
    if (this.name.length === 0) {
      Message({
        type: 'warning',
        message: '请输入航迹名称'
      })
      return
    }

    let convertedData = []
    for (let item of this.points) {
      convertedData.push([item.lon, item.lat])
    }
    let data = {
      data: convertedData,
      datetime: this.radarDatetime,
      name: this.name,
      airport: this.airport
    }
    let res = await axios({
      url: this.addReqUrl,
      adapter: jsonp,
      params: {
        data: JSON.stringify(data)
      }
    })
    Message({
      type: 'success',
      message: '成功保存'
    })
    this.removeAllLayer()
    this.name = ''
  }

  toggleAreaSelected(key) {
    let index = this.areaSelected.indexOf(key)
    if (index === -1) this.areaSelected.push(key)
    else this.areaSelected.splice(index, 1)
  }

  addCoordinate() {  //添加坐标点按钮
    if (!this.latInput || !this.lonInput) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '经度纬度不得为空'
      })
      return
    }
    this.points.push({ lat: this.latInput, lon: this.lonInput, isPopupOn: false })
    this.latInput = null
    this.lonInput = null
    this.drawAirLien()
  }
  openModifyPopup(el) {   //点出修改框按钮
    let flag = el.isPopupOn
    for (let opt of this.points) {
      opt.isPopupOn = false
    }
    el.isPopupOn = !flag
  }
  shiftUp(el, index) {   //上移
    el.isPopupOn = false
    let i = this.points.splice(index, 1)
    this.points.splice(index - 1, 0, i[0])
    this.drawAirLien()
  }
  shiftDown(el, index) {   //下移
    el.isPopupOn = false
    let i = this.points.splice(index, 1)
    this.points.splice(index + 1, 0, i[0])
    this.drawAirLien()
  }
  deleteCoordinate(index) {  //删除
    this.points.splice(index, 1)
  }

  moveEventTransformUnit(latlng: number) {
    if (this.unitSelected === 'dfm') {
      const int = Number(latlng.toFixed(0));
      const minuteString = latlng.toString().split('.');
      const minute = Number('0.'+ minuteString[minuteString.length - 1]) * 60;
      const secondString = minute.toString().split('.');
      const second = Number('0.' + secondString[secondString.length - 1]) * 60;

      return int + '°' + minute.toFixed(0) + '′' + second.toFixed(2) + '″';
    } else {
      return latlng.toFixed(4);
    }
  }

  mouseMoveEvent(e) {   //鼠标移动事件
    let text = `经度: ${this.moveEventTransformUnit(e.latlng.lng)},&nbsp 纬度：${this.moveEventTransformUnit(e.latlng.lat)}`
    let left = e.containerPoint.x + 10, top = e.containerPoint.y + 10
    if (!document.querySelector('#trajectory')) {
      let ele = document.createElement('div')
      ele.id = 'trajectory'
      ele.style.position = 'absolute'
      ele.style.top = top + 'px'
      ele.style.left = left + 'px'
      ele.style.padding = '0 10px'
      ele.style.background = '#fff'
      ele.style.lineHeight = '20px'
      ele.style.fontSize = '12px'
      ele.style.color = '#2c3e50;'
      ele.style.borderRadius = '4px'
      ele.style.zIndex = '999'
      ele.innerHTML = text
      document.body.appendChild(ele)
    } else {
      let ele: HTMLElement = <HTMLElement>document.querySelector('#trajectory')
      ele.style.top = top + 'px'
      ele.style.left = left + 'px'
      ele.innerHTML = text
    }
  }

  clickEvent(e) {    //鼠标点击事件
    this.points.push({ lat: Number(e.latlng.lat.toFixed(4)), lon: Number(e.latlng.lng.toFixed(4)), isPopupOn: false })
    this.drawAirLien()
  }



  /** 雷达产品 */
  @Watch('radarDate')
  onradarDateChanged(val: any, oldVal: any) {
    this.radarDatetime = moment(this.radarDate).format('YYYY-MM-DD') + ' ' + this.radarHour + ':' + this.radarMinute + ':00'
    this.radarLayerChanged()
  }
  radarHourSelectedChange(val) {
    this.radarHour = val
  }
  @Watch('radarHour')
  onradarHourChanged(val: any, oldVal: any) {
    this.radarDatetime = moment(this.radarDate).format('YYYY-MM-DD') + ' ' + this.radarHour + ':' + this.radarMinute + ':00'
    this.radarLayerChanged()
  }
  radarMinuteSelectedChange(val) {
    this.radarMinute = val
  }
  @Watch('radarMinute')
  onradarMinuteChanged(val: any, oldVal: any) {
    this.radarDatetime = moment(this.radarDate).format('YYYY-MM-DD') + ' ' + this.radarHour + ':' + this.radarMinute + ':00'
    this.radarLayerChanged()
  }

  radarLayerChanged() {
    if (!this.radarProductSelected) return
    let url = this.getRadarImageUrl(this.radarProductSelected)
    this.addRadarImageLayer(url)
  }

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

  addRadarImageLayer(url) {
    let img = new Image()
    img.onload = () => {
      if (this.isComponetAlive) {
        if (!this.radarProductLayer) {
          this.radarProductLayer = L.imageOverlay(url, this.bounds)
          this.radarProductLayer.addTo(map)
        } else {
          this.radarProductLayer.setUrl(url)
          this.radarProductLayer.setBounds(L.latLngBounds(L.latLng(this.bounds[0][0], this.bounds[0][1]), L.latLng(this.bounds[1][0], this.bounds[1][1])))
        }
      } else {
        if (this.radarProductLayer) map.removeLayer(this.radarProductLayer)
      }

    }
    img.onerror = () => {
      if (this.isComponetAlive)
        Vue.prototype['$message']({
          type: 'warning',
          message: '该时暂无数据'
        })
      this.removeRadarImageLayer()
    }
    img.src = url
  }

  toggleRadarProduct(key) {
    this.radarProductSelected = this.radarProductSelected === key ? '' : key
  }

  @Watch('radarProductSelected')
  onradarProductSelectedChanged(val: any, oldVal: any) {
    if (oldVal) this.removeRadarImageLayer()
    if (val) {
      let imageUrl = this.getRadarImageUrl(val)
      this.addRadarImageLayer(imageUrl)
    }
  }

  removeRadarImageLayer() {
    if (!this.radarProductLayer) return
    map.removeLayer(this.radarProductLayer)
    this.radarProductLayer = null
  }

  toggleUnit(key) {
    this.unitSelected = key
  }

  changeUnit(num) {       //经纬度换算
    let angle = Math.floor(num)
    let decimal = num - angle
    if (decimal === 0) return angle + '°'
    let p = decimal * 60
    let point = Math.floor(p)
    let pointDec = p - point
    let sec = Math.floor((pointDec * 60) * 10) / 10
    return angle + '°' + point + '\'' + sec + '"'
  }

}

