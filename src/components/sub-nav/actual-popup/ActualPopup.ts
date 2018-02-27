import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './ActualPopup.html?style=./ActualPopup.scss'

@WithRender
@Component
export default class ActualPopup extends Vue {
  actualCon = {
    temperature: {
      text: '温度',
      selected: false,
    },
    rainfall: {
      text: '降水',
      selected: false,
    },
    windDirection: {
      text: '风力方向',
      selected: false,
    },
    gpswaterVapour : {
      text: 'GPS水汽',
      selected: false,
    },
    pressure: {
      text: '气压',
      selected: false,
    },
    dewPointTem: {
      text: '露点温度',
      selected: false,
    },
    relativeHumidity: {
      text: '相对湿度',
      selected: false,
    },
  }

  toggleActual(actualKey) {
    this.actualCon[actualKey].selected = !this.actualCon[actualKey].selected
  }
}