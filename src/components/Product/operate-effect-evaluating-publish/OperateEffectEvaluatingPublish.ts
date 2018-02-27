import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import * as Config from '../../../config/productId'
import WithRender from './OperateEffectEvaluatingPublish.html?style=./OperateEffectEvaluatingPublish.scss'
import PublishDocument from '../../commons/publish-document/PublishDocument'

import axios from 'axios'
import jsonp from 'axios-jsonp'

@WithRender
@Component
export default class OperateEffectEvaluatingPublish extends Vue {
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

  mounted() {
    this.Editor = window['wangEditor']
    this.editor = new this.Editor('#editor')
    this.editor.customConfig.upload = true
    this.editor.customConfig.uploadImgMaxLength = 5
    this.editor.customConfig.uploadImgServer = 'http://10.148.16.217:11160/renyin5/conn/fp/image/upload'
    this.editor.customConfig.uploadFileName = 'img'
    this.editor.create()

    axios({
      url: '/static/technical_papers/technicalPapers_one.html',
    }).then(res => {
      this.editor.txt.html(res.data)
    })
  }

  publishDocument(workStation, appGroup, extraInfoText) {
    console.info(workStation, appGroup, extraInfoText)
    this.publishDocumentView = null
    this.$store.dispatch('systemStore/socketSendMessage_global', JSON.stringify({
      mark: '#rk',
      osId: workStation,
      stage: 0,
      message: this.editor.txt.html().replace(/10.148.16.217:9020/g, '113.108.192.95:11008'),
      note: extraInfoText,
      userIds: [],
      groupIds: appGroup
    }))
  }

  openPublishDocumentPopup() {
    this.publishDocumentView = (this.publishDocumentView === null ? PublishDocument : null)
  }

  async getHtmlString() {
    console.info(this.editor.txt.html().replace(/10.148.16.217:9020/g, '113.108.192.95:11008'))
    /*     let res = await axios({
          url: this.htmlToDocUrl,
          method: 'post',
          headers: {
            "Access-Control-Allow-Origin": "*",
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
          data: {
            message: this.editor.txt.html().replace(/10.148.16.217:9020/g, '113.108.192.95:11008')
          }
        }) */
    let downloadEle = <HTMLAnchorElement>document.createElement('a')
    // downloadEle.download = res.data
    downloadEle.click()
  }

  pickFile() {
    let ele = <HTMLInputElement>document.querySelector('#uploadFile')
    ele.click()
  }

  async uploadFileChange(e) {
    let res = await axios({
      method: 'post',
      url: this.docToHtml,
      data: {
        message: e.srcElement.files[0]
      }
    })
    this.editor.txt.html(res.data.data)
  }
}