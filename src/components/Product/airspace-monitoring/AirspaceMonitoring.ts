import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './AirspaceMonitoring.html?style=./AirspaceMonitoring.scss'
import * as CONFIG from '../../../config/productId'
import { airspaceClient } from '../../../util/clientHelper'
@WithRender
@Component
export default class AirspaceMonitoring extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  productId: string = CONFIG.airspaceMonitoring
  airspaceSelected: string = ''
  switchSelected: boolean = false
  airspaceList: any = []
  isPopupOn: boolean = false
  popupType: 'add' | 'modify' = null
  popupInfo: any = {
    id: { name: '编号', value: null },
    city: { name: '城市名', value: null },
    area: { name: '飞行区域', value: null },
    phone: { name: '电话', value: null },
  }
  mounted() {
    this.getAirspace()
  }
  async getAirspace() {   //获取空域列表
    let data = await airspaceClient.getAirspace()
    this.airspaceList = data
    if(!data){
      Vue.prototype['$message']({
        type: 'erroe',
        message: '获取空域列表失败'
      })
      return
    }
  }

  toggleSwitch(){
    this.switchSelected = !this.switchSelected
  }
  async toggleAddAirspace(){   //添加
    if (this.popupType === 'add') {
      this.popupType = null
      this.isPopupOn = false
    } else {
      for (let i in this.popupInfo) {
        this.popupInfo[i].value = null
      }
      this.popupType = 'add'
      this.isPopupOn = true
    }
  }
  toggleModifyAirspace(item){   //修改
    for (let i in this.popupInfo) {
      this.popupInfo[i].value = null
    }
    this.popupInfo.id.value = item.id
    this.popupInfo.city.value = item.city
    this.popupInfo.area.value = item.area
    this.popupInfo.phone.value = item.phone
    this.popupType = 'modify'
    this.isPopupOn = true
  }
  async deleteAirspace(item) {  //删除
    let data = await airspaceClient.deleteAirspace(item.id)
    Vue.prototype['$confirm']('是否确定删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      if(data){
        Vue.prototype['$message']({
          type: 'success',
          message: '删除成功'
        })
        this.getAirspace()
      } else {
        Vue.prototype['$message']({
          type: 'error',
          message: '删除失败'
        })
        return
      }
    }).catch(() => {})
  }
  async savePoint() {   //保存按钮
    let area = this.popupInfo.area.value,
    city = this.popupInfo.city.value,
    phone = this.popupInfo.phone.value
  let data, tip = ''
  if (this.popupType === 'add') {
    tip = '新增'
    let param = { area, phone, city }
    data = await airspaceClient.addAirspace(param)
  } else if (this.popupType === 'modify') {
    tip = '修改'
    let param = { area, phone, city }
    data = await airspaceClient.modifyAirspace(param, this.popupInfo.id.value)
  }
  if (data) {
    Vue.prototype['$message']({
      type: 'success',
      message: tip + '成功'
    })
    this.popupType = null
    this.isPopupOn = false
    this.getAirspace()
  } else
    Vue.prototype['$message']({
      type: 'error',
      message: tip + '失败'
    })
  }
}