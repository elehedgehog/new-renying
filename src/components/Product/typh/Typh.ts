import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './Typh.html?style=./Typh.scss'

import * as moment from 'moment'
import jsonp from 'axios-jsonp'
import axios from 'axios'
import { Message } from 'element-ui'
import * as CONFIG from '../../../config/productId'
import { TyphoonHelper } from '../../../util/TyphoonHelper'

let tyLayer: any = null

@WithRender
@Component
export default class Typh extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  productId: string = CONFIG.typh
  moment: any = moment
  reqUrl = 'http://10.148.83.228:8922/dataunit/typhoon/findTyphoonInfoHeader_Latest'
  typhMsgUrl = `http://10.148.83.228:8922/dataunit/typhoon/findLatestRealForecast?fcids[]=BCGZ&tsids[]=`
  selectedId = null
  typhData = []
  typhSelected: number = null

  created() {
    this.getTyphData()
  }
  destroyed() {
    this.typhSelected = null
    window['map'].removeLayer(tyLayer)
  }

  async getTyphData() {
    let res = await axios({ url: this.reqUrl + '?limit=10' })
    this.typhData = res.data
    console.info(this.typhData)
  }
  async getTyphMsg(tsid) {
    if (tyLayer) {
      window['map'].removeLayer(tyLayer)
      tyLayer = null
    }
    if (this.typhSelected === tsid) {
      this.typhSelected = null
      return
    }
    this.typhSelected = tsid
    let res:any = await axios({ url: this.typhMsgUrl + tsid})
    if (res.status !== 200) {
      Vue.prototype['$message']({
        type: 'error',
        message: '台风数据获取失败'
      })
      return
    }
    res = res.data
    console.log(res)
    let json: any = {}
    for (let el of this.typhData) {
      if (el.tsid == tsid) {
        json = {
          tsid,
          tscname: el.cname,
          tsename: el.ename,
          real: [],
          fst: []
        }
        break
      }
    }
    for (let opt of res.reals) {
      let real = this.formartTyphData(opt)
      json.real.push(real)
    }
    for (let opt of res.forecasts) {
      let fst = this.formartTyphData(opt)
      json.fst.push(fst)
    }

    let helper = new TyphoonHelper(window['map'])
    let layer: any = helper.drawTy(json)
    tyLayer = layer.tyLayerGroup
  }
  formartTyphData(opt) {
    return {
      time: moment(opt.datetime).format('YYYY-MM-DD HH:mm:ss'),
      leadtime: opt.leadtime,
      level: opt.elems.level,        
      lon: opt.loc.lon,
      lat: opt.loc.lat,
      ps: opt.elems.prressure,
      ws: opt.elems.windspeed,
      rr06: opt.elems.rr06 || null,
      rr07: opt.elems.rr07 || null,
      rr08: opt.elems.rr08 || null,
      rr10: opt.elems.rr10 || null
    }
  }

}
