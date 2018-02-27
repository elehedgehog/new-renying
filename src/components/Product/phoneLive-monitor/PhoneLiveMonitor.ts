import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './PhoneLiveMonitor.html?style=./PhoneLiveMonitor.scss'
import * as CONFIG from '../../../config/productId'

@WithRender
@Component
export default class PhoneLiveMonitor extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  @Getter('systemStore/isShowPhoneLiveLayer_global') isShowPhoneLiveLayer_global
  productId: string = CONFIG.phoneLiveMonitor

  toggleSwitch() {
    this.$store.commit('systemStore/toggleIsShowPhoneLiveLayer',
      !this.isShowPhoneLiveLayer_global)
  }

}