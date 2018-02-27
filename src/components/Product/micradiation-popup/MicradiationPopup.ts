import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './MicradiationPopup.html?style=./MicradiationPopup.scss'
import * as CONFIG from '../../../config/productId'

@WithRender
@Component
export default class MicradiationPopup extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  productId: string = CONFIG.micradiation
  dataType: string = null
  imgType: string = null
  toggleDataType(key) {
    this.dataType = key
  }
  imgTypeCon: string[] = ['t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000','t_20170807090000',]
  toggleImgType(key) {
    this.imgType = key
  }
}