import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './GroundControl.html?style=./GroundControl.scss'
import * as CONFIG from '../../../config/productId'

@WithRender
@Component
export default class GroundControl extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  @Getter('systemStore/isShowTransportLayer_global') isShowTransportLayer_global
  productId: string = CONFIG.groundControl

  toggleSwitch() {
    this.$store.commit('systemStore/toggleIsShowTransportLayer',
      !this.isShowTransportLayer_global)
  }
}