import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import * as Config from '../../../config/productId'
import WithRender from './OperatePlanPublish.html?style=./OperatePlanPublish.scss'
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
export default class OperatePlanPublish extends Vue {
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
  datetime = moment().format('YYYY-MM-DD')
  utcSelected = 0
  forecastOptionData = (() => {
    let arr = []
    for (let i = 0; i <= 240; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })()
  forecastOptionSelected = '000'
  hourOptionData = [0, 12, 6, 18]
  hourSelected = 0
  prescriptionSelected = 0
  htmlString = ''
  htmlStringHolder = ''
  docData
  docDataReqUrl = 'http://10.148.16.217:9020/doc/3?&data='
  imgPrefix = 'http://10.148.16.217:9020/dao/png?&path='
  png500hpa = '000'
  png700hpa = '000'
  pngSeaPressure = '000'
  png24Rain = '000'


  async created() {
    this.getOperateData()
  }

  async mounted() {
    this.Editor = window['wangEditor']
    this.editor = new this.Editor('#editor')
    this.editor.customConfig.upload = true
    this.editor.customConfig.uploadImgMaxLength = 5
    this.editor.customConfig.uploadImgServer = 'http://10.148.16.217:11160/renyin5/conn/fp/image/upload'
    this.editor.customConfig.uploadFileName = 'img'
    this.editor.create()
    axios({
      url: '/static/technical_papers/OperatePlan.html',
    }).then(async res => {
      this.htmlStringHolder = res.data
      this.editor.txt.html(this.htmlString)
      await this.getDocData()
      this.replaceHTMLString()
    })
  }

  async hourChange(val) {
    this.hourSelected = val
    await this.getDocData()
    this.replaceHTMLString()
  }
  async png500hpaChange(val) {
    this.png500hpa = val
    await this.getDocData()
    this.replaceHTMLString()
  }
  async png700hpaChange(val) {
    this.png700hpa = val
    await this.getDocData()
    this.replaceHTMLString()
  }
  async pngSeaPressureChange(val) {
    this.pngSeaPressure = val
    await this.getDocData()
    this.replaceHTMLString()
  }
  async png24RainChange(val) {
    this.png24Rain = val
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

  replaceHTMLString() {
    this.htmlString = this.htmlStringHolder.replace(/datetime/, this.docData.time)
      .replace(/year/g, this.docData.year)
      .replace(/gdCity/g, this.docData.gdCity)
      .replace(/imgSrc1/, this.imgPrefix + this.docData.png2500Hpa)
      .replace(/imgSrc2/, this.imgPrefix + this.docData.png3700Hpa)
      .replace(/imgSrc3/, this.imgPrefix + this.docData.png4SeaPressure)
      .replace(/imgSrc4/, this.imgPrefix + this.docData.png5Rain24)
      .replace(/imgSrcDry/, this.imgPrefix + this.docData.png1Dry)
    this.editor.txt.html(this.htmlString)
  }

  async getDocData() {
    const holder = moment(this.datetime)
    holder.set('hours', this.hourSelected)
    const Datetime = holder.format('YYYY-MM-DD HH:00:00');
    let res = await axios({
      url: this.docDataReqUrl +
        `{"png1Dry":"${Datetime}";"png2500Hpa":"${Datetime},${this.png500hpa}";` +
        `"png3700Hpa":"${Datetime},${this.png700hpa}";` +
        `"png4SeaPressure":"${Datetime},${this.pngSeaPressure}";` +
        `"png5Rain24":"${Datetime},${this.png24Rain}"}`,
      adapter: jsonp
    })
    this.docData = res.data
  }

  forecastChange(val) {
    this.forecastOptionSelected = val
  }

  prescriptionChange(val) {
    this.prescriptionSelected = val
  }

  toggleUtcTime(val) {
    this.utcSelected = val
  }

  close() {
    this.publishDocumentView = null
  }

  async getOperateData() {
    let res = await axios({
      url: this.operateReqUrl,
      params: {
        word: '10'
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
      stage: 1,
      message: `<html><head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        </head><body>` +
        this.editor.txt.html().replace(/10.148.16.217:9020/g, '113.108.192.95:11008') + `</body></html>`,
      note: extraInfoText,
      // userIds: [],
      groupIds: appGroup,
      word: '10'
    }))
    Message({
      type: 'success',
      message: '发布成功'
    })
  }

  getPrescription(type: string) {
    let start = 0
    const arr = []
    if (type === 'rain') {
      start = 24;
    }
    for (let i = start; i <= 240; i += 6) {
      arr.push(
        i < 10 ? '00' + i : i < 100 ? '0' + i : i
      );
    }
    return arr;
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