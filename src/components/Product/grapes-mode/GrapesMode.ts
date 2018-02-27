import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './GrapesMode.html?style=./GrapesMode.scss'
import * as CONFIG from '../../../config/productId'
import * as moment from 'moment'
import { Message } from 'element-ui'
import axios from 'axios'
import jsonp from 'axios-jsonp'

import SelectToggle from '../../commons/select-toggle/SelectToggle'

@WithRender
@Component({
  components: {
    SelectToggle
  }
})
export default class GrapesMode extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  productId: string = CONFIG.grapesMode
  forecasePopup: boolean = false
  imgUrl: string = ''
  utcSelected: number = null
  scopeSelected: string = 'SouthChina'
  grapesDate: any = null
  minify: boolean = false
  forecast: string = '000'
  forecastOptionData = []
  productSelected: string = 'mslp'
  productKind: string = '地面要素'
  citySelected: string = null
  cityRainSelected: string = null
  stationSelected: string = null
  stationRainSelected: string = null
  loading: boolean = false
  isInit: boolean = false
  products = productData
  optionData = this.products.SouthChina
  country: any = {
    '广州': { '59287': '广州', '59284': '花都', '59285': '从化', '59294': '增城', '59481': '番禺', },
    '韶关': { '59082': '韶关', '57988': '乐昌', '57989': '仁化', '57996': '南雄', '59081': '乳源', '59090': '始兴', '59094': '翁源', '59097': '新丰', },
    '深圳': { '59483': '深圳' },
    '珠海': { '59488': '珠海', '59487': '斗门', },
    '汕头': { '59316': '汕头', '59318': '潮阳', '59319': '澄海', '59324': '南澳', },
    '佛山': { '59279': '山水', '59288': '南海', '59480': '顺德', },
    '江门': { '59473': '鹤山', '59475': '开平', '59476': '新会', '59477': '恩平', '59478': '台山', '59673': '上川', },
    '湛江': { '59658': '湛江', '59650': '遂溪', '59654': '廉江', '59656': '吴川', '59750': '雷州', '59754': '徐闻', },
    '茂名': { '59659': '茂名', '59456': '信宜', '59653': '高州', '59655': '化州', '59664': '电白', },
    '肇庆': { '59264': '封开', '59269': '德庆', '59270': '怀集', '59271': '广宁', '59276': '四会', '59278 ': '高要', },
    '惠州': { '59290': '龙门', '59297': '博罗', '59298': '惠阳', '59492': '惠东', },
    '梅州': { '59117': '梅县', '59106': '平远', '59109': '兴宁', '59114': '蕉岭', '59116': '大埔', '59303': '五华', '59310': '丰顺', },
    '汕尾': { '59501': '汕尾', '59500': '海丰', '59502': '陆丰', },
    '河源': { '59293': '河源', '59096': '连平', '59099': '和平', '59107': '龙川', '59304': '紫金', },
    '阳江': { '59663': '阳江', '59469 ': '阳春', },
    '清远': { '59280': '清远', '59071': '连南', '59072': '连州', '59074': '连山', '59075': '阳山', '59087': '佛冈', '59088': '英德', },
    '东莞': { '59289': '东莞', },
    '中山': { '59485': '中山', },
    '潮州': { '59312': '潮州', '59313': '饶平', },
    '揭阳': { '59315': '揭阳', '59306': '揭西', '59314': '普宁', '59317': '惠来', },
    '云浮': { '59471': '云浮', '59268': '郁南', '59462': '罗定', '59470': '新兴', },
  }
  
  countryRain: any = {
    '茂名': { 'mm01jd': '金垌', 'mm02bj': '北界', 'mm03mg': '马贵', 'mm04xd': '新垌', 'mm05cp': '长坡', },
    '阳江': { 'yj01hk': '河口', 'yj02pg': '平冈', },
    '江门': { 'jm01df': '端芬', 'jm02sj': '深井', 'jm03cx': '赤溪', },
    '汕尾': { 'sw01ml': '梅陇', 'sw02hk': '河口', 'sw03kt': '可塘', },
    '惠州': { 'hz01lm': '龙门', 'hz02bp': '白盆珠', 'hz03gt': '高潭', },
    '揭阳': { 'jy01hc': '惠城', },
    '清远': { 'qy01st': '水头', 'qy02tp': '太平', 'qy03qg': '七拱', },
  }
  
  created() {
    this.getLatestHour()
    this.citySelected = Object.keys(this.country)[0]
    this.cityRainSelected = Object.keys(this.countryRain)[0]
    this.stationSelected = Object.keys(this.country[this.citySelected])[0]
    this.stationRainSelected = Object.keys(this.countryRain[this.cityRainSelected])[0]
    this.optionData[0]['isSelected'] = true
    this.optionData[0].sub[0]['isSelected'] = true
    this.forecastOptionData = this.optionData[0].sub[0].times
    setTimeout(() => {
      this.isInit = true
      this.changeUrl()
    }, 100)
  }
  async getLatestHour() {
    let latestHourUrl = 'http://10.148.16.217:11160/renyin5/satelite/grapes9km/latest'
    let res = await axios({
      adapter: jsonp,
      url: latestHourUrl,
      params: {
        product: this.productSelected,
        area: this.scopeSelected
      }
    })
    if (res.data.stateCode === 0) {
      let latestHour = res.data.data.datetime
      this.grapesDate = moment(latestHour).format('YYYY/MM/DD')
      this.utcSelected = Number(moment(latestHour).format('HH'))
    }
  }

  changeUrl() {
    let product = this.productSelected,
      time = moment(this.grapesDate).format('YYYY-MM-DD ') + (this.utcSelected >= 10 ? this.utcSelected : '0' + this.utcSelected) + ':00:00',
      area = this.scopeSelected,
      forecast = this.forecast,
      county
    if (area === "Rainnest") county = this.stationRainSelected
    else if (area === "SingleStation") county = this.stationSelected
    let url = `http://10.148.16.217:11160/renyin5/satelite/img/grapes9km?product=${product}&time=${time}&forecast=${forecast}&area=${area}`
    if (area === "Rainnest" || area === "SingleStation") url += `&county=${county}`
    console.log(url)
    this.loading = true
    let img = new Image()
    img.onload = () => {
      this.loading = false
      this.imgUrl = url
    }
    img.onerror = () => {
      this.loading = false
      if (this.isInit) this.imgUrl = 'static/img/nopic.png'
    }
    img.src = url
  }
  toggleUtcTime(key) {
    this.utcSelected = key
  }
  toggleScope(key) {
    this.scopeSelected = key
    this.optionData = this.products[key]
  }
  toggleOpt(subkey, key) {
    this.productSelected = subkey
    this.productKind = key
    for (let item of this.optionData) {
      for (let subItem of item.sub) {
        if (subItem.value === subkey)
          subItem.isSelected = true
        else
          subItem.isSelected = false
      }
    }
    this.changeUrl()
    // this.getLatestHour()
  }
  @Watch('grapesDate')
  ongrapesDateChanged(val: any, oldVal: any) {
    this.changeUrl()
  }
  @Watch('utcSelected')
  onutcSelectedChanged(val: any, oldVal: any) {
    this.changeUrl()
  }

  @Watch('scopeSelected')
  onscopeSelectedChanged(val: any, oldVal: any) {
    for (let i in productData) {
      for (let el of productData[i]) {
        for (let opt of el.sub) {
          opt.isSelected = false
        }
      }
    }
    let ele = Object.keys(this.products[val])[0]
    this.productSelected = this.products[val][ele].sub[0].value
    this.optionData[0]["isSelected"] = true
    this.optionData[0].sub[0].isSelected = true
    this.productKind = ele
    this.forecast = '000'
    this.changeUrl()
    // this.getLatestHour()
  }
  @Watch('citySelected')
  oncitySelectedChanged(val: any, oldVal: any) {
    this.stationSelected = Object.keys(this.country[this.citySelected])[0]
  }
  @Watch('cityRainSelected')
  oncityRainSelectedChanged(val: any, oldVal: any) {
    this.stationRainSelected = Object.keys(this.countryRain[this.cityRainSelected])[0]
  }
  @Watch('stationSelected')
  onstationSelectedChanged(val: any, oldVal: any) {
    this.changeUrl()
  }
  @Watch('stationRainSelected')
  onstationRainSelectedChanged(val: any, oldVal: any) {
    this.changeUrl()
  }
  @Watch('productSelected')
  onproductSelectedChanged(val: any, oldVal: any) {
    for (let item of this.optionData) {
      if (item['isSelected']) {
        for (let subItem of item.sub) {
          if (subItem.isSelected) {
            this.forecastOptionData = subItem.times
            if (this.forecastOptionData.indexOf(this.forecast) === -1) {
              this.forecast = this.forecastOptionData[0]
            }
            break
          }
        }
      }
    }
    this.changeUrl()
  }
  @Watch('forecast')
  onforecastChanged(val: any, oldVal: any) {
    this.changeUrl()
  }

  forecastChange(val) {
    console.info(val)
    this.forecast = val
  }
}

export const forseeTimeData = {
  '0-168': (() => {
    let arr = []
    for (let i = 0; i <= 168; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '14-168': (() => {
    let arr = []
    for (let i = 14; i <= 168; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '24-168': (() => {
    let arr = []
    for (let i = 24; i <= 168; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '0-144~*12': (() => {
    let arr = []
    for (let i = 0; i <= 144; i += 12) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '3-168': (() => {
    let arr = []
    for (let i = 3; i <= 168; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '6-168': (() => {
    let arr = []
    for (let i = 6; i <= 168; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '48-168': (() => {
    let arr = []
    for (let i = 48; i <= 168; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '0-84': (() => {
    let arr = []
    for (let i = 0; i <= 84; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '72-168': (() => {
    let arr = []
    for (let i = 72; i <= 168; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '0': ['000'],
}

const productData = {
  SouthChina: [
    {
      name: '地面要素',
      isSelected: false,
      sub: [{
        value: 'mslp',
        isSelected: false,
        name: '海平面气压',
        times: forseeTimeData['0-168']
      }, {
        value: 'mslp24',
        isSelected: false,
        name: '海平面24h变压',
        times: forseeTimeData['24-168']
      }, {
        value: 't2mm',
        isSelected: false,
        name: '2m气温',
        times: forseeTimeData['0-168']
      }, {
        value: 't2mm24',
        isSelected: false,
        name: '2m气温24h变温',
        times: forseeTimeData['24-168']
      }, {
        value: 't2mm-max',
        isSelected: false,
        name: '2m最高气温',
        times: forseeTimeData['0-144~*12']
      }, {
        value: 't2mm-min', isSelected: false, name: '2m最低气温',
        times: forseeTimeData['0-144~*12']
      }, {
        value: 't2mm-ave', isSelected: false, name: '2m平均气温',
        times: forseeTimeData['0-144~*12']
      }, {
        value: 'wind10mslp', isSelected: false, name: '10m阵风',
        times: forseeTimeData['0-168']
      }, /* {
        value: '10gust3', isSelected: false, name: '10m阵风(过去3h)',
      }, {
        value: '10gust6', isSelected: false, name: '10m阵风(过去6h)'
      }, */ {
        value: 'rain3', isSelected: false, name: '3h降水',
        times: forseeTimeData['3-168']
      }, {
        value: 'rain6', isSelected: false, name: '6h降水',
        times: forseeTimeData['6-168']
      }, {
        value: 'rain24', isSelected: false, name: '24h降水',
        times: forseeTimeData['24-168']
      }, {
        value: 'rain48', isSelected: false, name: '48h降水',
        times: forseeTimeData['48-168']
      }, {
        value: 'rain72', isSelected: false, name: '72h降水',
        times: forseeTimeData['72-168']
      }, {
        value: 'rain24stablization', isSelected: false, name: '24h累计降水稳定度',
        times: forseeTimeData['0']
      }, {
        value: 't-td-surf', isSelected: false, name: '地面温度露点差',
        times: forseeTimeData['0-168']
      }],
    }, {
      name: '不稳定层节',
      isSelected: false,
      sub: [{
        value: 'si', isSelected: false, name: 'SI',
        times: forseeTimeData['0-168']
      }, {
        value: 'kiki', isSelected: false, name: 'K指数',
        times: forseeTimeData['0-168']
      }, {
        value: 'cape', isSelected: false, name: 'CAPE',
        times: forseeTimeData['0-168']
      }],
    }, {
      name: '高空要素',
      isSelected: false,
      sub: [{
        value: 'temp24500', isSelected: false, name: '500hPa24h变温',
        times: forseeTimeData['24-168']
      }, {
        value: 'temp24700', isSelected: false, name: '700hPa24h变温',
        times: forseeTimeData['24-168']
      }, {
        value: 'temp24850', isSelected: false, name: '850hPa24h变温',
        times: forseeTimeData['24-168']
      }, {
        value: 'temp850-500', isSelected: false, name: '850-500温度',
        times: forseeTimeData['0-168']
      }, {
        value: 'temp700-500', isSelected: false, name: '700-500温度',
        times: forseeTimeData['0-168']
      }, {
        value: 'hghtwind500', isSelected: false, name: '500hPa高度(副高)',
        times: forseeTimeData['0-168']
      }, {
        value: 'hght24500', isSelected: false, name: '500hPa高度(变高)',
        times: forseeTimeData['24-168']
      }, {
        value: '500hght-850wind-rain', isSelected: false, name: '500高度+850风+降水',
        times: forseeTimeData['6-168']
      }, {
        value: 'wind200stream200hght200', isSelected: false, name: '200hPa形式',
        times: forseeTimeData['0-168']
      }, {
        value: 'wind500hght500temp500', isSelected: false, name: '500hPa形式',
        times: forseeTimeData['0-168']
      }, {
        value: 'wind700', isSelected: false, name: '700hPa形式',
        times: forseeTimeData['0-168']
      }, {
        value: 'wind850hght500', isSelected: false, name: '850hPa风',
        times: forseeTimeData['0-168']
      }, {
        value: 'wind850', isSelected: false, name: '850hPa风_单要素',
        times: forseeTimeData['0-168']
      }, {
        value: 'wind925', isSelected: false, name: '925hPa风',
        times: forseeTimeData['0-168']
      }],
    },
    {
      name: '水汽条件',
      isSected: false,
      sub: [{
        value: 'rhum500', isSelected: false, name: '500hPa相对湿度',
        times: forseeTimeData['0-168']
      }, {
        value: 'rhum700', isSelected: false, name: '700hPa相对湿度',
        times: forseeTimeData['0-168']
      }, {
        value: 'rhum850', isSelected: false, name: '850hPa相对湿度',
        times: forseeTimeData['0-168']
      }, {
        value: 'tcdc', isSelected: false, name: '总云量',
        times: forseeTimeData['0-168']
      }, {
        value: 'vflux850', isSelected: false, name: '850hPa水汽通量',
        times: forseeTimeData['0-168']
      }, {
        value: 'vflux925', isSelected: false, name: '925hPa水汽通量',
        times: forseeTimeData['0-168']
      }, {
        value: '-td850', isSelected: false, name: '850hPa温度露点差',
        times: forseeTimeData['0-168']
      }]
    }, {
      name: '热动力因子',
      isSelected: false,
      sub: [{
        value: 'wind700jet200', isSelected: false, name: '700hPa风+200hPa急流',
        times: forseeTimeData['0-168']
      }, {
        value: 'windshear', isSelected: false, name: '200-850风切变',
        times: forseeTimeData['0-168']
      }, {
        value: 'thse50-850', isSelected: false, name: '假相当位温',
        times: forseeTimeData['0-168']
      }, {
        value: 'omeg500', isSelected: false, name: '500hPa垂直速度',
        times: forseeTimeData['0-168'],
      }, {
        value: 'omeg700', isSelected: false, name: '700hPa垂直速度',
        times: forseeTimeData['0-168'],
      }, {
        value: 'omeg850', isSelected: false, name: '850hPa垂直速度',
        times: forseeTimeData['0-168'],
      }, {
        value: 'dive200', isSelected: false, name: '200hPa散度',
        times: forseeTimeData['0-168']
      }, {
        value: 'dive700', isSelected: false, name: '700hPa散度',
        times: forseeTimeData['0-168']
      }, {
        value: 'dive850', isSelected: false, name: '850hPa散度',
        times: forseeTimeData['0-168']
      }, {
        value: 'dive925', isSelected: false, name: '925hPa散度',
        times: forseeTimeData['0-168']
      }, {
        value: 'vort500', isSelected: false, name: '500hPa涡度',
        times: forseeTimeData['0-168']
      }, {
        value: '500vad-rain', isSelected: false, name: '500hPa涡度平流+降水',
        times: forseeTimeData['14-168']
      }, {
        value: 'vadv850', isSelected: false, name: '850hPa涡度平流',
        times: forseeTimeData['0-168']
      }, {
        value: 'vadv925', isSelected: false, name: '925hPa涡度平流',
        times: forseeTimeData['0-168']
      }, {
        value: 'tadv500', isSelected: false, name: '500hPa温度平流',
        times: forseeTimeData['0-168']
      }, {
        value: 'tadv850', isSelected: false, name: '850hPa温度平流',
        times: forseeTimeData['0-168']
      }, {
        value: 'tadv925', isSelected: false, name: '925hPa温度平流',
        times: forseeTimeData['0-168']
      },],
    }, {
      name: '雷达和能见度',
      isSelected: false,
      sub: [{
        value: 'cref', isSelected: false, name: '组合雷达反射率',
        times: forseeTimeData['0-168']
      }, {
        value: 'dbzr', isSelected: false, name: '3km高度雷达反射率',
        times: forseeTimeData['0-168']
      }, {
        value: 'visi', isSelected: false, name: '能见度',
        times: forseeTimeData['0-168']
      }]
    }
  ],
  GuangDong: [{
    name: '地面要素',  
    isSelected: false,
    sub: [
      {
        value: 'mslp', isSelected: false, name: '海平面气压',
        times: forseeTimeData['0-168']
      }, {
        value: 'mslp24', isSelected: false, name: '海平面24h变压',
        times: forseeTimeData['24-168']
      }, {
        value: 't2mm', isSelected: false, name: '2m气温',
        times: forseeTimeData['0-168']
      }, {
        value: 't2mm24', isSelected: false, name: '2m气温24h变温',
        times: forseeTimeData['24-168']
      }, {
        value: 'wind10m', isSelected: false, name: '10m风',
        times: forseeTimeData['0-168']
      }, {
        value: 'rain3', isSelected: false, name: '3h降水',
        times: forseeTimeData['3-168']
      }, {
        value: 'rain6', isSelected: false, name: '6h降水',
        times: forseeTimeData['6-168']
      }, {
        value: 'rain24', isSelected: false, name: '24h降水',
        times: forseeTimeData['24-168']
      }, {
        value: 'rain48', isSelected: false, name: '48h降水',
        times: forseeTimeData['48-168']
      }, {
        value: 'rain72', isSelected: false, name: '72h降水',
        times: forseeTimeData['72-168']
      }, {
        value: 'rain24stablization', isSelected: false, name: '24h累计降水稳定度',
        times: forseeTimeData['0']
      }, {
        value: 't-td-surf', isSelected: false, name: '地面温度露点差',
        times: forseeTimeData['0-168']
      }
    ],
  }, {
    name: '不稳定层节',
    isSelected: false,
    sub: [{
      value: 'kiki', isSelected: false, name: 'K指数',
      times: forseeTimeData['0-168']
    }, {
      value: 'si', isSelected: false, name: 'SI',
      times: forseeTimeData['0-168']
    }, {
      value: 'cape', isSelected: false, name: 'CAPE',
      times: forseeTimeData['0-168']
    }],
  }],
  SingleStation: [{
    name: '时间序列',
    isSelected: false,
    sub: [{
      value: 'surfparameters', isSelected: false, name: '温压湿雨',
      times: forseeTimeData['0']
    }, {
      value: 'tz-omeg', isSelected: false, name: '垂直速度高度时间剖面',
      times: forseeTimeData['0']
    }, {
      value: 'tz-wind-rhum', isSelected: false, name: '相对湿度垂直剖面',
      times: forseeTimeData['0']
    }, {
      value: 'tz-windzthse', isSelected: false, name: '假相当位问垂直剖面',
      times: forseeTimeData['0']
    }],
  }, {
    name: 'Tlogp',
    isSelected: false,
    sub: [{
      value: 'tlogp', isSelected: false, name: 'tlogp',
      times: forseeTimeData['0-168']
    }],
  }],
  Rainnest: [{
    name: '时间序列',
    isSelected: false,
    sub: [{
      value: 'surfparameters', isSelected: false, name: '温压湿雨',
      times: forseeTimeData['0']
    }, {
      value: 'tzZomeg', isSelected: false, name: '垂直速度高度时间剖面',
      times: forseeTimeData['0']
    }, {
      value: 'tzZwindZrhum', isSelected: false, name: '相对湿度垂直剖面',
      times: forseeTimeData['0']
    }, {
      value: 'tzZwindZthse', isSelected: false, name: '假相当位问垂直剖面',
      times: forseeTimeData['0']
    }],
  }, {
    name: 'Tlogp',
    isSelected: false,
    sub: [{ value: 'tlogp', isSelected: false, name: 'tlogp', times: forseeTimeData['0-168'] }],
  }]
}