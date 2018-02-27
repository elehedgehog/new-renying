import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './LocalCloud.html?style=./LocalCloud.scss'

import * as CONFIG from '../../../config/productId'
import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'
import { Message } from 'element-ui'
import SelectToggle from '../../commons/select-toggle/SelectToggle'

let mapLayer = null

@WithRender
@Component({
  components: {
    SelectToggle
  }
})
export default class LocalCloude extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  optionData = optionData
  optionSelected: string = null
  minify: boolean = false
  subOptionSelected: string = null
  startDate: string = moment().subtract(1, 'days').format('YYYY-MM-DD')
  startTime: string = '08'
  forseeTime: number = 1
  elementSelected: string = null
  playStartTime: string = ''
  playStopTime: string = ''
  playInterval: any = null
  playCurrentFrame: number = 0
  levelSelected = '800'
  levelData = levelData
  noLevelElement = noLevelElement
  intLevelSelected: number = 19
  intLevelData: number[] = [19, 22, 24, 26, 28, 30]
  intLevelElement = intLevelElement
  productId = CONFIG.localCloud
  imgUrl: string = ''
  reqUrl = {
    gis: 'http://10.148.16.217:9020/dao/cpefs/',
    img: 'http://10.148.16.217:9020/dao/cpefspng/'
  }
  projName: string = 'mercator'
  CrossDomain: boolean = false
  forecastHourData: any = []
  startForecastHourData: number = null

  created() {
    this.optionData[0].isSelected = true
    this.optionData[0].sub[0].isSelected = true
    this.elementSelected = this.optionData[0].sub[0].value
    window['map'].on('zoomend', () => {
      this.submit
    }, this)

    for (let i = 1; i <= 48; i++) {
      this.forecastHourData.push(i)
    }
  }


  destroyed() {
    window['map'].removeEventListener('zoomend', this.submit)
    window['map'].hasLayer(mapLayer) ? window['map'].removeLayer(mapLayer) : ''
  }

  getForecastHourData() {
    this.forecastHourData = [];
    let startCount = this.startForecastHourData ? this.startForecastHourData : 1;
    for (let i = startCount; i <= 48; i += this.startForecastHourData ? this.startForecastHourData : 1) {
      this.forecastHourData.push(i)
    }
    this.forseeTimeChange(this.forecastHourData[0])
  }


  @Watch('elementSelected')
  elementSelectedChanged(val: any, oldVal: any): void {
    if (val)
      this.submit()
  }
  @Watch('startDate')
  startDateChanged(val: any, oldVal: any): void {
    this.submit()
  }
  @Watch('startTime')
  startTimeChanged(val: any, oldVal: any): void {
    this.submit()
  }
  @Watch('forseeTime')
  forseeTimeChanged(val: any, oldVal: any): void {
    this.submit()
  }
  forseeTimeChange(val) {
    this.forseeTime = val
  }
  @Watch('levelSelected')
  levelSelectedChanged(val: any, oldVal: any): void {
    this.submit()
  }
  @Watch('intLevelSelected')
  intLevelSelectedChanged(val: any, oldVal: any): void {
    this.submit()
  }

  submit() {
    if (!this.elementSelected) {
      Message.warning('请先选择要素')
      return
    }

    if (this.minify)
      this.addGISLayer()
    else
      this.addIMG()
  }

  addIMG() {
    let computedUrl = this.reqUrl.img + this.elementSelected
    let params = {
      date: moment(this.startDate).format('YYYY-MM-DD') + ` 00:00:00`,
      forecastHour: this.startTime,
      prescription: this.forseeTime,
      level: this.intLevelElement.indexOf(this.elementSelected) === -1 ?
        this.noLevelElement.indexOf(this.elementSelected) === -1 ? this.levelSelected : 1000
        : 'n' + this.intLevelSelected
    }
    computedUrl += this.computeUrl(params) + '&callback=null'
    this.imgUrl = computedUrl
  }

  addGISLayer() {
    let bound = window['map'].getBounds()
    let params = {
      projName: this.projName,
      CrossDomain: this.CrossDomain,
      date: moment(this.startDate).format('YYYY-MM-DD'),
      width: document.body.clientWidth,
      height: document.body.clientHeight,
      top: bound._northEast.lat,
      right: bound._northEast.lng,
      bottom: bound._southWest.lat,
      left: bound._southWest.lng,
      forecastHour: this.startTime,
      prescription: this.forseeTime,
      clip: true,
      level: this.noLevelElement.indexOf(this.elementSelected) !== -1 ? 1000 : this.levelSelected
    }

    let computedUrl = this.reqUrl.gis + this.elementSelected + this.computeUrl(params)
    window['map'].hasLayer(mapLayer) ? window['map'].removeLayer(mapLayer) : ''
    mapLayer = window['L'].imageOverlay(computedUrl, [bound._northEast, bound._southWest])
    mapLayer.addTo(window['map'])
  }

  computeUrl(params) {
    let queryString = '?'
    for (let key in params) {
      queryString += '&' + key + '=' + params[key]
    }
    return queryString
  }

  selectOption(item, name) {
    for (let item of this.optionData) {
      for (let subItem of item.sub) {
        if (subItem.name === name) {
          this.elementSelected = subItem.value
          this.startForecastHourData = subItem['start'];
          subItem.isSelected = true
          this.getForecastHourData();
        } else
          subItem.isSelected = false
      }
    }
  }
}

const optionData = [
  {
    name: '云宏现场',
    isSelected: false,
    sub: [
      {
        name: '云带',
        isSelected: false,
        value: 'cband'
      }, {
        name: '垂直累计液态水',
        isSelected: false,
        value: 'vil'
      }, {
        name: '垂直累积过冷水',
        isSelected: false,
        value: 'visl'
      }, {
        name: '云顶温度',
        isSelected: false,
        value: 'cloudtopt'
      }, {
        name: '云顶高度',
        isSelected: false,
        value: 'cloudtoph'
      }, {
        name: '云底高度',
        isSelected: false,
        value: 'cloudboth'
      }, {
        name: '云底温度',
        isSelected: false,
        value: 'cloudbott'
      }, {
        name: '雷达反射率',
        isSelected: false,
        value: 'dbz'
      }, /* {
        name: '雷达组合反射率',
        isSelected: false,
        value: ''
      }, */ {
        name: '相对湿度',
        isSelected: false,
        value: 'rh'
      },
    ]
  }, {
    name: '云微现场',
    isSelected: false,
    sub: [
      {
        name: '总水成物场+风场+温度',
        value: 'rainnc',
        isSelected: false
      }, {
        name: '云水混合比',
        value: 'QCLOUD',
        isSelected: false
      }, {
        name: '雨水混合比',
        value: 'QRAIN',
        isSelected: false
      }, {
        name: '冰晶混合比',
        value: 'QICE',
        isSelected: false
      }, {
        name: '雪混合比',
        value: 'QSNOW',
        isSelected: false
      }, {
        name: '霰混合比',
        value: 'QGRAUP',
        isSelected: false
      }, {
        name: '冰晶数浓度',
        value: 'QNICE',
        isSelected: false
      }, {
        name: '雨滴数浓度',
        value: 'QNRAIN',
        isSelected: false
      }, {
        name: '雪数浓度',
        value: 'QNSNOW',
        isSelected: false
      }, {
        name: '霰数浓度',
        value: 'QNGRAUPEL',
        isSelected: false
      }
    ]
  }, {
    name: '垂直结构',
    isSelected: false,
    sub: [
      {
        name: 'Qc,Ni,T垂直剖面',
        isSelected: false,
        value: 'Qvtc'
      }, {
        name: 'Qs+Qg,Qr,H垂直剖面',
        isSelected: false,
        value: 'Qvtr'
      },
    ]
  }, {
    name: '降水场',
    isSelected: false,
    sub: [
      {
        name: '逐小时降水',
        isSelected: false,
        value: 'rain1'
      }, {
        name: '3小时降水',
        isSelected: false,
        value: 'rain3',
        start: 3
      }, {
        name: '6小时降水',
        isSelected: false,
        value: 'rain6',
        start: 6
      }, {
        name: '12小时降水',
        isSelected: false,
        value: 'rain12',
        start: 12
      }, {
        name: '24小时降水',
        isSelected: false,
        value: 'rain24',
        start: 24
      },
    ]
  }
]

const noLevelElement = [
  "cband",
  "vil",
  "visl",
  "cloudboth",
  "cloudbott",
  "cloudtoph",
  "cloudtopt",
]
const intLevelElement = [
  'Qvtc',
  'Qvtr'
]

const levelData = [
  "850",
  "800",
  "750",
  "700",
  "650",
  "600",
  "550",
  "500",
  "450",
  "400"
]