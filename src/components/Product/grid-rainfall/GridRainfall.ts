import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './GridRainfall.html?style=./GridRainfall.scss'
import * as CONFIG from '../../../config/productId'
import { Message } from 'element-ui'
import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'
import SelectToggle from '../../commons/select-toggle/SelectToggle'

let map, L, imgLayer
@WithRender

@Component({
  components: {
    SelectToggle
  }
})
export default class GridRainfall extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  productId: string = CONFIG.gridRainfall
  
  utcSelected: number = 0
  ecwmfDate: any = moment().format('YYYY/MM/DD')
  minify: boolean = false
  imgUrl: string = ''
  forecast: string = '003'
  stationRainSelected: string = null
  productSelected: string = '3'
  forecasePopup: boolean = false
  loading: boolean = false
  isInit: boolean = false
  forseeOptionData = []
  optionData = productData.SouthChina
  products: any = productData
  forecastOptionData
  isComponetAlive: boolean = true
  bounds: any[] = [
    [25.7, 109.4],
    [20, 118]
  ]
  mounted() {
    map = window['map']
    L = window['L']
  }
  created() {
    this.optionData[0]['isSelected'] = true
    this.optionData[0].sub[0]['isSelected'] = true
    this.forecastOptionData = this.optionData[0].sub[0].times
    
    setTimeout(() => {
      this.isInit = true
      this.changeUrl()
    }, 100)

  }

  destroyed() {
    this.isComponetAlive = false
    if (imgLayer) map.removeLayer(imgLayer)
    imgLayer = null
  }

  changeUrl() {
    let product = this.productSelected,
      time = moment(this.ecwmfDate).format('YYYY-MM-DD ') + (this.utcSelected >= 10 ? this.utcSelected : '0' + this.utcSelected) + ':00:00',
      forecast = this.forecast
    // let url = `http://10.148.16.217:11160/renyin5/satelite/img/grid/giftzd/rain?time=${time}&leadtime=${forecast}&cumulate=${product}&left=109.4&right=118&top=25.7&bottom=20&width=800&height=800&proName=`
    let url = `http://10.148.16.217:11160/renyin5/satelite/img/giftzd/rain?time=${time}&leadtime=${forecast}&cumulate=${product}`
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
  toggleOpt(subkey, key) {
    this.productSelected = subkey
    for (let item of this.optionData) {
      for (let subItem of item.sub) {
        if (subItem.value === subkey)
          subItem.isSelected = true
        else
          subItem.isSelected = false
      }
    }
  }
  @Watch('ecwmfDate')
  onecwmfDateChanged(val: any, oldVal: any) {
    this.changeUrl()
  }
  @Watch('utcSelected')
  onutcSelectedChanged(val: any, oldVal: any) {
    this.changeUrl()
  }
  @Watch('productSelected')
  onproductSelectedChanged(val: any, oldVal: any) {
    for (let item of this.optionData) {
      if (item['isSelected']) {
        for (let subItem of item.sub) {
          if (subItem.value === val) {
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
  toggleUtcTime(key) {
    this.utcSelected = key
  }
}
export const forseeTimeData = {
  '3-72': (() => {
    let arr = []
    for (let i = 3; i <= 72; i += 3) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '6-240': (() => {
    let arr = []
    for (let i = 6; i <= 240; i += 3) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '24-240': (() => {
    let arr = []
    for (let i = 24; i <= 240; i += 3) {
      
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '48-240': (() => {
    let arr = []
    for (let i = 48; i <= 240; i += 3) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '72-240': (() => {
    let arr = []
    for (let i = 72; i <= 240; i += 3) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '0': ['000'],
}

let timeArr = (() => {
  let arr = []
  for (let i = 0; i < 72; i++)
    arr.push(i)
  for (let i = 72; i <= 240; i+=6)
    arr.push(i)
  return arr
})()

const productData = {
  SouthChina: [
    {
      sub: [{
        value: '3', isSelected: false, name: '3h降水',
        // times: forseeTimeData['3-72']
        times: (() => {
          let arr = []
          for (let i = 3; i <= 72; i++)
            arr.push(i)
          return arr
        })()
      }, {
        value: '6', isSelected: false, name: '6h降水',
        // times: forseeTimeData['6-240']
        times: timeArr.filter(i => i >= 6)
      }, {
        value: '24', isSelected: false, name: '24h降水',
        // times: forseeTimeData['24-240']
        times: timeArr.filter(i => i >= 24)
      }, {
        value: '48', isSelected: false, name: '48h降水',
        // times: forseeTimeData['48-240']
        times: timeArr.filter(i => i >= 48)
      }, {
        value: '72', isSelected: false, name: '72h降水',
        // times: forseeTimeData['72-240']
        times: timeArr.filter(i => i >= 72)
      }],
    }
  ],
}