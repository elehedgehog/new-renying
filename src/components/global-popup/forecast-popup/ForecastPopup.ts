import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './ForecastPopup.html?style=./ForecastPopup.scss'

@WithRender
@Component
export default class ForecastPopup extends Vue {
  forecastCon: string[] = ['作业潜力与作业计划', '作业潜力与作业计划', '作业潜力与作业计划', '作业潜力与作业计划','作业潜力与作业计划','作业潜力与作业计划' ]
  
}