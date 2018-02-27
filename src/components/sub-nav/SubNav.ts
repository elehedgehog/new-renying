import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './SubNav.html?style=./SubNav.scss'

import ForecastPopup from './forecast-popup/ForecastPopup'
import ActualPopup from './actual-popup/ActualPopup'
import WpradarPopup from './wpradar-popup/WpradarPopup'
// import MicroRadiation from './micro-radiation/MicroRadiation'
import EcwmfInter from './ecwmf-inter/EcwmfInter'
import SunflowerInfrared from './sunflower-infrared/SunflowerInfrared'

@WithRender
@Component
export default class SubNav extends Vue {
  subNavList = subNavList
  navExtended: boolean = false
  subNavSelected: string = null

  currentView: any = null

  // toggleSubNav(subNavKey) {
  //   if (this.subNavSelected === subNavKey) {
  //     this.subNavSelected = null
  //     this.currentView = null
  //   } else {
  //     this.subNavSelected = subNavKey
  //   }
  // }
  toggleSubNav(subNavKey) {
    this.subNavSelected = this.subNavSelected === subNavKey ? null : subNavKey
  }

  @Watch('subNavSelected')
  issubNavSelectedChanged(val, oldVal) {
    // this.currentView = this.subNavList[val].view
    this.currentView = val ? this.subNavList[val].view : null
  }
}

const subNavList = {
  snatchForecast: {
    text: '短时预报',
    view: ForecastPopup
  },
  cloudAnalyse: {
    text: '探空云分析产品',
    view: null
  },
  windProfileRadar: {
    text: '风廓线雷达',
    view: WpradarPopup
  },
  // micRadiation: {
  //   text: '微波辐射计',
  //   view: MicroRadiation
  // },
  ecwmfMiniInter: {
    text: 'ECWMF 细网络模式产品',
    view: EcwmfInter
  },
  grapesMidium: {
    text: 'GRAPES 中尺度模式产品',
    view: null
  },
  infraredGrey: {
    text: '葵花 8 红外灰度图',
    view: SunflowerInfrared
  },
  raindropCloudLevel: {
    text: '雨滴谱,云高监测产品',
    view: null
  },
  actualProduct: {
    text: '实况产品',
    view: ActualPopup
  },
  droughtOperation: {
    text: '干旱作业',
    view: null
  },
  increasedOperation: {
    text: '增蓄作业',
    view: null
  },
}