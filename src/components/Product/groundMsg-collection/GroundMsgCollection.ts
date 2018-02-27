import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './GroundMsgCollection.html?style=./GroundMsgCollection.scss'
import * as CONFIG from '../../../config/productId'
import { operuploadClient } from '../../../util/clientHelper'
import * as moment from 'moment'



@WithRender
@Component
export default class GroundMsgCollection extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  moment = moment
  productId: string = CONFIG.groundMsgCollection
  currentPage: number = 1       // 当前页数
  currentPageList: any = []     // 当前页数 用户数据
  pageSize: number = 11
  dataLength: number = 0

  async mounted(){
    let data = await operuploadClient.getOperation()
    if(data) this.dataLength = data.length
    this.getOperupload()
  }

  async getOperupload() {
    let data = await operuploadClient.getOperationByPage(this.currentPage ,this.pageSize)
    if (data) {
      for (let el of data) {
        this.$set(el, 'msgPopup', false)
      }
      this.currentPageList  = data
    }
    else this.currentPageList  = []
  }
  currentChange(e) {
    this.currentPage = e
    this.getOperupload()
  }
  toggleMsgDetail(item) {
    item.msgPopup = !item.msgPopup
  }
}