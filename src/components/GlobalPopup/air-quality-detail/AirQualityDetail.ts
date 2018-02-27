import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './AirQualityDetail.html?style=./AirQualityDetail.scss'

@WithRender
@Component
export default class AirQualityDetail extends Vue {
  @Getter('systemStore/aqiDetailInfo_global') info
}