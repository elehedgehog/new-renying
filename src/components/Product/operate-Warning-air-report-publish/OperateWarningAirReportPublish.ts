import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import * as Config from '../../../config/productId'
import { OperateClient } from '../../../util/operateClient'
import WithRender from './OperateWarningAirReportPublish.html?style=./OperateWarningAirReportPublish.scss'
import PublishDocument from '../../commons/publish-document/PublishDocument'
import { Message } from 'element-ui'
import * as moment from 'moment'

import axios from 'axios'
import jsonp from 'axios-jsonp'

@WithRender
@Component
export default class OperateWarningAirReportPublish extends Vue {
  @Getter('systemStore/articleViewHolder_global') articleViewHolder_global
  @Action('systemStore/changeArticleViewHolder_global') changeArticleViewHolder_global
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  minify: boolean = false;
  Editor
  editor
  publishDocumentView = null
  htmlToDocUrl = 'http://10.148.16.217:11160/renyin5/fp/files/html/converter'
  docToHtml = 'http://10.148.16.217:11160/renyin5/fp/files/doc/converter'
  operateReqUrl = 'http://10.148.16.217:11160/renyin5/fp/exists'
  plOperateData: any[] = []
  datetime = moment().format('YYYY-MM-DD HH:mm:ss')
  htmlString = ''
  htmlStringHolder = ''
  docData
  docDataReqUrl = 'http://10.148.16.217:9020/doc/6?&data='
  imgPrefix = 'http://10.148.16.217:9020/dao/png?&path='

  created() {
    this.getOperateData()
  }

  mounted() {
    this.Editor = window['wangEditor']
    this.editor = new this.Editor('#editor')
    this.editor.customConfig.upload = true
    this.editor.customConfig.uploadImgMaxLength = 5
    this.editor.customConfig.uploadFileName = 'img'
    this.editor.customConfig.uploadImgServer = 'http://10.148.16.217:11160/renyin5/conn/fp/image/upload'
    this.editor.create()

    axios({
      url: '/static/technical_papers/OperateWarningAirReport.html',
    }).then(async res => {
      this.htmlStringHolder = res.data
      await this.getDocData()
      this.replaceHTMLString()
    })
  }

  @Watch('datetime')
  async onDatetimeSelectedChange(val) {
    await this.getDocData()
    this.replaceHTMLString()
  }

  replaceHTMLString() {
    this.htmlString = this.htmlStringHolder.replace(/datetime/, this.docData.time)
      .replace(/year/g, this.docData.year)
      .replace(/datetime/, this.docData.time)
      .replace(/imgSrc1/, this.imgPrefix + this.docData.png1Ttop)
      .replace(/imgSrc2/, this.imgPrefix + this.docData.png2Optn)
      .replace(/imgSrc3/, this.imgPrefix + this.docData.png3Clound)
      .replace(/imgSrc4/, this.imgPrefix + this.docData.png4Radar)
      .replace(/imgSrc5/, this.imgPrefix + this.docData.png5Ztop)
      .replace(/imgSrc6/, this.imgPrefix + this.docData.png6RadarProfile)
    this.editor.txt.html(this.htmlString)
  }

  async getDocData() {
    let res = await axios({
      url: this.docDataReqUrl +
      `{"datetime": "${moment(this.datetime).format('YYYY-MM-DD HH:mm:ss')}"}`,
      adapter: jsonp
    })
    this.docData = res.data
  }

  close() {
    this.publishDocumentView = null
  }

  async getOperateData() {
    let res = await axios({
      url: this.operateReqUrl,
      params: {
        type: 'pl'
      }
    })
    this.plOperateData = res.data.data
  }

  publishDocument(workStation, appGroup, extraInfoText, operateType) {
    this.publishDocumentView = null
    this.$store.dispatch('systemStore/socketSendMessage_global', JSON.stringify({
      mark: operateType,
      osId: workStation,
      stage: 3,
      message: `<html><head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        </head><body>` +
      this.editor.txt.html().replace(/10.148.16.217:9020/g, '113.108.192.95:11008') + `</body></html>`,
      note: extraInfoText,
      // userIds: [],
      groupIds: appGroup,
      word: '31'
    }))
    Message({
      type: 'success',
      message: '发布成功'
    })
  }

  openPublishDocumentPopup() {
    this.publishDocumentView = (this.publishDocumentView === null ? PublishDocument : null)
  }

  async getHtmlString() {
    OperateClient.downloadFile(this.editor.txt.html().replace(/10.148.16.217:9020/g, '113.108.192.95:11008'))
  }

  pickFile() {
    let ele = <HTMLInputElement>document.querySelector('#uploadFile')
    ele.click()
  }

  async uploadFileChange(e) {
    OperateClient.uploadFile(e.srcElement.files[0])
      .then(html => {
        this.editor.txt.html(html)
      })
  }
}