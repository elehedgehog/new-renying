import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './PopupEntry.html?style=./PopupEntry.scss'

import ForecastPopup from '../forecast-popup/ForecastPopup'

@WithRender
@Component
export default class PopupEntry extends Vue {
  forecastView: any = null

  
}