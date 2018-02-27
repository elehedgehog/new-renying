import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import * as Config from '../../../config/productId'
import WithRender from './OperateAirPlanPublish.html?style=./OperateAirPlanPublish.scss'
import PublishDocument from '../../commons/publish-document/PublishDocument'
import { OperateClient } from '../../../util/operateClient'
import { Message } from 'element-ui'
import * as moment from 'moment'
import SelectToggle from '../../commons/select-toggle/SelectToggle'

import axios from 'axios'
import jsonp from 'axios-jsonp'

@WithRender
@Component({
  components: {
    SelectToggle
  }
})
export default class OperateAirPlanPublish extends Vue {
  @Getter('systemStore/articleViewHolder_global') articleViewHolder_global
  @Action('systemStore/changeArticleViewHolder_global') changeArticleViewHolder_global
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  minify: boolean = false;
  // productId = Config.
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
  docDataReqUrl = 'http://10.148.16.217:9020/doc/7?&data='
  imgPrefix = 'http://10.148.16.217:9020/dao/png?&path='
  airLineSelected = null
  airLineOptionSelected = null
  airLineDesignData = []
  airLineDesignOptionData = []
  airLineDesignReqUrl = 'http://10.148.16.217:9020/dao/airline_design/select'

  created() {
    this.getOperateData()
    this.getAirLineDesignData()
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
      url: '/static/technical_papers/OperateAirPlan.html',
    }).then(async res => {
      this.htmlStringHolder = res.data
      this.editor.txt.html(this.htmlString)
      await this.getDocData()
      this.replaceHTMLString()
    })
  }

  airLineDesignChange(val) {
    this.airLineOptionSelected = val
    for (let item of this.airLineDesignData) {
      if (item.name === val) {
        this.airLineSelected = item.id
      }
    }
  }

  async getAirLineDesignData() {
    let res = await axios({
      url: this.airLineDesignReqUrl,
      adapter: jsonp
    })
    this.airLineDesignOptionData = []
    for (let item of res.data.listSql[0]) {
      this.airLineDesignOptionData.push(item.name)
    }
    if (this.airLineDesignOptionData.length > 0) {
      console.info(this.airLineDesignOptionData[0])
      this.airLineOptionSelected = this.airLineDesignOptionData[0]
    }
    this.airLineDesignData = res.data.listSql[0]
  }

  @Watch('datetime')
  async onDatetimeSelectedChange(val) {
    await this.getDocData()
    this.replaceHTMLString()
  }
  @Watch('airLineSelected')
  async onstationOptionSelectedSelectedChange(val) {
    await this.getDocData()
    this.replaceHTMLString()
  }

  replaceHTMLString() {
    let listPositionString = ''
    for (let item of this.docData.listPositions) {
      listPositionString +=
        `<tr>
          <td>${item.id}°</td> 
          <td>${item.lon}°</td> 
          <td>${item.lat}°</td> 
          <td>${item.name}</td> 
        </tr>`
    }
    this.htmlString = this.htmlStringHolder.replace(/datetime/, this.docData.time)
      .replace(/year/g, this.docData.year)
      .replace(/listPositions/, listPositionString)
      .replace(/region/, this.docData.area.split(';').join('区,') + '区')
    this.editor.txt.html(this.htmlString)
  }

  async getDocData() {
    let res = await axios({
      url: this.docDataReqUrl +
        `{"datetime": "${moment(this.datetime).format('YYYY-MM-DD HH:mm:ss')}"; 
          "id": "${this.airLineSelected}"}`,
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
      word: '33'
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