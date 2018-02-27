import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './MessageDispatch.html?style=./MessageDispatch.scss'
import NewMessage from './new-message/NewMessage'
import HistoryMessage from './history-message/HistoryMessage'
import * as CONFIG from '../../../config/productId'

@WithRender
@Component
export default class MessageDispatch extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  productId: string = CONFIG.messageDispatch

  msgSelected: string = 'new'
  currentView: any = NewMessage

  mounted(){
   
  }
  toggleMsg(key) {
    if (key === this.msgSelected) return
    this.msgSelected = key
    this.currentView = key === 'new' ? NewMessage : HistoryMessage
  }
  

}