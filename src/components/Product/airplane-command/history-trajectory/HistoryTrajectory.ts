import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './HistoryTrajectory.html?style=./HistoryTrajectory.scss'

import { Message } from 'element-ui'

import axios from 'axios'
import jsonp from 'axios-jsonp'

@WithRender
@Component
export default class HistoryTrajectory extends Vue {
  selectReqUrl = 'http://10.148.16.217:9020/dao/airline_design/select'
  deleteReqUrl = 'http://10.148.16.217:9020/dao/airline_design/delete'
  data = []

  @Prop({ type: Function }) selectOldTrajectory

  async created() {
    this.getHistoryData()
  }

  async getHistoryData() {
    let res = await axios({
      url: this.selectReqUrl + `?_=${Date.now()}`,
      adapter: jsonp
    })
    this.data = res.data.listSql[0]
  }

  async deleteData(id) {
    let res = await axios({
      url: this.deleteReqUrl,
      adapter: jsonp,
      params: {
        data: JSON.stringify({
          id
        })
      }
    })
    Message({
      type: 'success',
      message: '删除成功'
    })
    this.getHistoryData()
  }
}
