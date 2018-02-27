import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './DisasterManage.html?style=./DisasterManage.scss'
import * as CONFIG from '../../../config/productId'
import { Message } from 'element-ui'
import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'
import { disasterClient } from '../../../util/clientHelper'

@WithRender
@Component
export default class DisasterManage extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  @Action('systemStore/storeDisasterManageImg_global') storeDisasterManageImg_global
  @Action('systemStore/storedisasterMsg_global') storedisasterMsg_global

  moment = moment
  productId: string = CONFIG.disasterManage
  disasterDate: any = new Date()
  disasterMsg: any = {}
  url = 'http://10.148.16.217:11160/renyin5/disaster'
  pickerOptions = {
    async disabledDate(val) {
      let res = await axios({
        method: 'post',
        url: 'http://10.148.16.217:11160/renyin5/disaster/selectByTime',
        data: {
          time: new Date(val).getTime()
        }
      })
      return res.data.data.length > 0
    }
  }

  mounted() {
    this.selectDisasterByTime()
  }
  async selectDisasterByTime() {          //灾情查询（按时间）
    let data = await disasterClient.selectDisasterByTime(new Date(this.disasterDate).getTime())
    if (!data) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '获取数据失败'
      })
    }
    this.disasterMsg = data
    console.log(this.disasterMsg)
  }

  toggleImgDetails(item) {
    this.storeDisasterManageImg_global()
    this.storedisasterMsg_global(item)

  }
  @Watch('disasterDate')
  ondisasterDateChanged(val: any, oldVal: any) {
    this.selectDisasterByTime()
  }



}