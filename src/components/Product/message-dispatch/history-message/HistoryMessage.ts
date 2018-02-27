import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './HistoryMessage.html?style=./HistoryMessage.scss'

import axios from 'axios'

@WithRender
@Component
export default class HistoryMessage extends Vue {
  @Getter('systemStore/appUserData_global') appUserData_global

  msgData: any[] = []
  subRes: any[] = []
  msgSelected: string = ''
  msgDataReqUrl = 'http://10.148.16.217:11160/renyin5/msg/getMsgSujectList'
  subResReqUrl = 'http://10.148.16.217:11160/renyin5/msg/checkMsgState'

  created() {
    this.getMsgData()
  }

  async getMsgData() {
    let res = await axios({
      url: this.msgDataReqUrl
    })
    this.msgData = res.data.data
  }

  getUser(phone) {
    for(let item of this.appUserData_global) {
      if(item.phone === phone) return item.name
    } 
  }

  @Watch('msgSelected')
  async  onMsgSelectedChange() {
    let res = await axios({
      method: 'post',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
      },
      url: this.subResReqUrl,
      data: 'msgId=' + this.msgSelected
    })
    this.subRes = res.data.data
  }
}