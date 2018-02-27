import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './EcwmfInter.html?style=./EcwmfInter.scss'

@WithRender
@Component
export default class EcwmfInter extends Vue {
  utcSelected: number = 0
  scopeSelected: string = 'eurasian'

  toggleUtcTime(key) {
    this.utcSelected = key
  }

  toggleScope(key) {
    this.scopeSelected = key
  }
}