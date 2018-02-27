import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import * as Config from '../../../config/productId'
import WithRender from './OperateDemandAnalysisPublish.html?style=./OperateDemandAnalysisPublish.scss'
import PublishDocument from '../../commons/publish-document/PublishDocument'
import { OperateClient } from '../../../util/operateClient'
import { Message } from 'element-ui'
import DatePickerToggle from '../../commons/date-picker-toggle/DatePickerToggle'
import SelectToggle from '../../commons/select-toggle/SelectToggle'
import * as moment from 'moment'

import axios from 'axios'
import jsonp from 'axios-jsonp'

@WithRender
@Component({
  components: {
    DatePickerToggle,
    SelectToggle
  }
})
export default class OperateDemandAnalysisPublish extends Vue {
  @Getter('systemStore/articleViewHolder_global') articleViewHolder_global
  @Action('systemStore/changeArticleViewHolder_global') changeArticleViewHolder_global
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  minify: boolean = false;
  // productId = Config.
  Editor
  editor
  publishDocumentView = null
  getDocDataUrl = "http://10.148.16.217:9020/doc/1?&data="
  datetime = Date.now()
  cityOperateData = []
  cityOperateSelected = []
  docData = null
  htmlString = ''

  async mounted() {
    this.Editor = window['wangEditor']
    this.editor = new this.Editor('#editor')
    this.editor.customConfig.upload = true
    this.editor.customConfig.uploadImgMaxLength = 5
    this.editor.customConfig.uploadFileName = 'img'

    this.editor.customConfig.uploadImgServer = 'http://10.148.16.217:11160/renyin5/conn/fp/image/upload'
    this.editor.create()
    await this.getDocData()

    axios({
      url: '/static/technical_papers/OperateDemandAnalysis.html?_=' + Date.now(),
    }).then(res => {
      this.htmlString = res.data
      if (this.docData !== null) {
        for (let item of this.docData) {
          if (item.cityName === this.cityOperateSelected) {
            this.htmlString = this.htmlString.replace(/datetime/g, item.time)
              .replace(/weatherAnalysis/g, item.weather)
              .replace(/year/g, item.year)
          }
        }
      }
      this.editor.txt.html(this.htmlString)
    })
  }

  async  getDocData() {
    let res = await axios({
      url: this.getDocDataUrl +
      `{"datetime":"${moment(this.datetime).format('YYYY-MM-DD HH:mm:ss')}";` +
      `"dryLevel3":10;"dryLevel4":1;"dryLevel5":1;"tempLev":10;"forestLev":10}`,
      adapter: jsonp
    })
    this.docData = res.data
    this.cityOperateData = []
    if (res.data === null) return
    for (let item of this.docData) {
      this.cityOperateData.push(item.cityName)
    }
    this.cityOperateSelected = this.cityOperateData[0]
  }

  citySelectionChange(val) {
    // for(let item of this.docData) {}
  }

  close() {
    this.publishDocumentView = null
  }

  publishDocument(workStation, appGroup, extraInfoText) {
    this.publishDocumentView = null
    this.$store.dispatch('systemStore/socketSendMessage_global', JSON.stringify({
      mark: '#all',
      stage: 0,
      message: `<html><head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        </head><body>` +
      this.editor.txt.html().replace(/10.148.16.217:9020/g, '113.108.192.95:11008') + `</body></html>`,
      note: extraInfoText,
      word: '00'
      // userIds: [],
      // groupIds: appGroup
    }))
    Message({
      type: 'success',
      message: '发布成功'
    })
  }

  openPublishDocumentPopup() {
    this.publishDocumentView = (this.publishDocumentView === null ? PublishDocument : null)
  }

  async downloadFile() {
    OperateClient.downloadFile(this.editor.txt.html().replace(/10.148.16.217:9020/g, '113.108.192.95:11008'))
  }

  async uploadFileChange(e) {
    OperateClient.uploadFile(e.srcElement.files[0])
      .then(html => {
        this.editor.txt.html(html)
      })
  }

  pickFile() {
    let ele = <HTMLInputElement>document.querySelector('#uploadFile')
    ele.click()
  }

}