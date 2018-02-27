import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './AgricultureAnalysis.html?style=./AgricultureAnalysis.scss'
import { agricultureAnalysis } from '../../../config/productId'
import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'
import { Message } from 'element-ui'
import SelectToggle from '../../commons/select-toggle/SelectToggle'

@WithRender
@Component({
  components: {
    SelectToggle
  }
})
export default class AgricultureAnalysis extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  reqUrl = {
    list: 'http://10.148.16.217:11160/renyin5/weather/climatic/allfiles',
    file: 'http://10.148.16.217:11160/renyin5/weather/climatic/name'
  }
  listData = []
  listDataForSelect = []
  fileName = ''
  productId = agricultureAnalysis
  htmlString = ''

  created() {
    this.getListData()
  }

  @Watch('forecastTypeSelected')
  forecastTypeSelectedChanged(val: any, oldVal: any): void {
    this.getListData()
  }

  @Watch('fileName')
  async fileNameChanged(val: any, oldVal: any) {
    let res = await axios({
      url: this.reqUrl.file,
      adapter: jsonp,
      params: {
        fileName: this.fileName
      }
    })
    if (res.data.stateCode === -99) {
      Message({
        type: 'warning',
        message: '数据出错'
      })
      return
    }
    this.htmlString = res.data.data
    this.htmlString = this.htmlString.replace(/src=\"/g, 'src=\"http://10.148.16.217:11160/renyin5/weather/climatic/')
  }

  listSelectChange(data) {
    for (const item of this.listData) {
      if (item.target === data) {
        this.fileName = item.fileName;
        return;
      }
    }
  }

  async getListData() {
    let res = await axios({
      adapter: jsonp,
      url: this.reqUrl.list,
      params: {
        currentPage: 1,
        pageSize: 999,
        type: 'farm'
      }
    })
    if (res.data.stateCode === -99) {
      Message({
        type: 'warning',
        message: '数据出错'
      })
      return
    }
    this.listData = []
    let name = '农用天气预报'
    for (let item of res.data.data.objs) {
      let holder = moment(item.datetime)
      this.listData.push({
        target: holder.format('YYYY/MM/DD'),
        month: holder.format('MM'),
        year: holder.format('Y'),
        fileName: item.fileName,
        datetime: item.datetime,
        name
      })
    }
    this.fileName = this.listData[0].fileName;
    this.listDataForSelect = []
    for (const item of this.listData) {
      this.listDataForSelect.push(item.target);
    }
  }
}



