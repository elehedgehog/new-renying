import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import * as Config from '../../../config/productId'
import WithRender from './OperatePotentialPublish.html?style=./OperatePotentialPublish.scss'
import PublishDocument from '../../commons/publish-document/PublishDocument'
import { OperateClient } from '../../../util/operateClient'
import SelectToggle from '../../commons/select-toggle/SelectToggle'
import { Message } from 'element-ui'
import * as moment from 'moment'

import axios from 'axios'
import jsonp from 'axios-jsonp'

@WithRender
@Component({
  components: {
    SelectToggle
  }
})
export default class OperatePotentialPublish extends Vue {
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
  rkOperateData: any[] = []
  plOperateData: any[] = []
  datetime = moment().format('YYYY-MM-DD HH:mm:ss')
  utcSelected = 0
  forecastOptionData = (() => {
    let arr = []
    for (let i = 1; i <= 48; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })()
  forecastOptionSelected = '01'
  latOptionData = [19, 22, 24, 26, 28, 30]
  latOptionSelected = 22
  hourSelected = 8
  hourOptionData = [8, 20]
  htmlString = ''
  htmlStringHolder = ''
  docData
  docDataReqUrl = 'http://10.148.16.217:9020/doc/4?&data='
  imgPrefix = 'http://10.148.16.217:9020/dao/png?&path='
  png1CBand = '000'
  png2Visl = '000'
  png3Qvtc = '000'
  png4Qvtr = '000'
  png5Rain3_6 = '000'
  png6Rain3_12 = '000'
  png7Rain3_24 = '000'
  png8Rain3_48 = '000'

  created() {
    this.getOperateData()
  }

  mounted() {
    this.Editor = window['wangEditor']
    this.editor = new this.Editor('#editor')
    this.editor.customConfig.upload = true
    this.editor.customConfig.uploadImgMaxLength = 5
    this.editor.customConfig.uploadImgServer = 'http://10.148.16.217:11160/renyin5/conn/fp/image/upload'
    this.editor.customConfig.uploadFileName = 'img'
    this.editor.create()

    axios({
      url: '/static/technical_papers/OperatePotential.html',
    }).then(async res => {
      this.htmlStringHolder = res.data
      await this.getDocData()
      this.replaceHTMLString()
    })
  }


  async hourChange(val) {
    this.hourSelected = val
    await this.getDocData()
    this.replaceHTMLString()
  }
  async png1CBandChange(val) {
    this.png1CBand = val
    await this.getDocData()
    this.replaceHTMLString()
  }
  async pn2VislChange(val) {
    this.png2Visl = val
    await this.getDocData()
    this.replaceHTMLString()
  }
  async png3QvtcChange(val) {
    this.png3Qvtc = val
    await this.getDocData()
    this.replaceHTMLString()
  }
  async png4QvtrChange(val) {
    this.png4Qvtr = val
    await this.getDocData()
    this.replaceHTMLString()
  }
  async png5Rain3_6Change(val) {
    this.png5Rain3_6 = val
    await this.getDocData()
    this.replaceHTMLString()
  }
  async png6Rain3_12Change(val) {
    this.png6Rain3_12 = val
    await this.getDocData()
    this.replaceHTMLString()
  }
  async png7Rain3_24Change(val) {
    this.png7Rain3_24 = val
    await this.getDocData()
    this.replaceHTMLString()
  }
  async png8Rain3_48Change(val) {
    this.png8Rain3_48 = val
    await this.getDocData()
    this.replaceHTMLString()
  }

  @Watch('prescriptionSelected')
  async onPrescriptionSelectedChange(val) {
    await this.getDocData()
    this.replaceHTMLString()
  }
  @Watch('datetime')
  async onDatetimeSelectedChange(val) {
    await this.getDocData()
    this.replaceHTMLString()
  }
  @Watch('forecastOptionSelected')
  async onForecastOptionSelectedSelectedChange(val) {
    await this.getDocData()
    this.replaceHTMLString()
  }
  @Watch('latOptionSelected')
  async onLatOptionSelectedSelectedChange(val) {
    await this.getDocData()
    this.replaceHTMLString()
  }

  replaceHTMLString() {
    this.htmlString = this.htmlStringHolder.replace(/datetime/, this.docData.time)
      .replace(/year/g, this.docData.year)
      .replace(/datetime/, this.docData.time)
      .replace(/imgSrc1/, this.imgPrefix + this.docData.png2Visl)
      .replace(/imgSrc2/, this.imgPrefix + this.docData.png3Qvtc)
      .replace(/imgSrc3/, this.imgPrefix + this.docData.png4Qvtr)
      .replace(/imgSrc4/, this.imgPrefix + this.docData.png5Rain3_6)
      .replace(/imgSrc5/, this.imgPrefix + this.docData.png6Rain3_12)
      .replace(/imgSrc6/, this.imgPrefix + this.docData.png7Rain3_24)
      .replace(/imgSrc7/, this.imgPrefix + this.docData.png8Rain3_48)
      .replace(/imgSrc8/, this.imgPrefix + this.docData.png1Cband)
    this.editor.txt.html(this.htmlString)
  }

  async getDocData() {
    const holder = moment(this.datetime)
    holder.set('hours', this.hourSelected)
    const Datetime = holder.format('YYYY-MM-DD HH:00:00');
    let res = await axios({
      url: this.docDataReqUrl +
        `{"png1Cband":"${Datetime},${this.png1CBand}";"png2Visl":"${Datetime},${this.png2Visl}";` +
        `"png3Qvtc":"${Datetime},${this.png3Qvtc},${this.latOptionSelected}";` +
        `"png4Qvtr":"${Datetime},${this.png2Visl},${this.latOptionSelected}";` +
        `"png5Rain3_6":"${Datetime},${this.png5Rain3_6}";` +
        `"png6Rain3_12":"${Datetime},${this.png6Rain3_12}";` +
        `"png7Rain3_24":"${Datetime},${this.png7Rain3_24}";` +
        `"png8Rain3_48":"${Datetime},${this.png8Rain3_48}"}`,
      adapter: jsonp
    })
    this.docData = res.data
  }

  latChange(val) {
    this.latOptionSelected = val
  }


  close() {
    this.publishDocumentView = null
  }

  async getOperateData() {
    let res = await axios({
      url: this.operateReqUrl,
      params: {
        type: 'rk'
      }
    })
    this.rkOperateData = res.data.data
    res = await axios({
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
      stage: 2,
      message: `<html><head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        </head><body>` +
        this.editor.txt.html().replace(/10.148.16.217:9020/g, '113.108.192.95:11008') + `</body></html>`,
      note: extraInfoText,
      // userIds: [],
      groupIds: appGroup,
      word: '20'
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

  getPrescription(start: number = 1) {
    const arr = []
    let factor = 1
    if (typeof start === 'undefined') {
      
      factor = 3
    }
    for (let i = start; i <= 48; i += factor) {
      arr.push(
        i < 10 ? '0' + i : i
      );
    }
    return arr;
  }
}