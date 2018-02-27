import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './GroundTarget.html?style=./GroundTarget.scss'
import * as CONFIG from '../../../config/productId'
import { templateClient } from '../../../util/clientHelper'
@WithRender
@Component
export default class GroundTarget extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  productId: string = CONFIG.groundTarget
  itemList: any = {
    area: { name: '作业区域',borderPop: false, value: '' },
    timeRange:  {name: '作业时段',borderPop: false,  value: '' },
    goal: { name: '作业目的',borderPop: false,  value: '' },
    way: { name: '催化方式',borderPop: false,  value: '' },
  }
  mounted() {
    this.getTemplate()
  } 
  async getTemplate() {  //获取
    let data = await templateClient.getTemplate()
    if (!data) return
    for (let i in this.itemList) {
      this.itemList[i].value = data[i]
    }
  }
  async modifyTemplate() {        //修改
    let area = this.itemList.area.value,
        timeRange = this.itemList.timeRange.value,
        goal = this.itemList.goal.value,
        way = this.itemList.way.value
    let data = await templateClient.modifyTemplate(area,timeRange,goal,way)
    if(data){
      Vue.prototype['$message']({
        type: 'success',
        message: '保存成功'
      })
    }
  }
  confirmModify(){
    this.toggleProductView_global({id: this.productId, action: false})
    this.modifyTemplate()
    this.getTemplate()
  }
}