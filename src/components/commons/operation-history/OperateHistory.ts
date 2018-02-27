import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import WithRender from './OperateHistory.html?style=./OperateHistory.scss'
import axios from 'axios'
import * as moment from 'moment'

@WithRender
@Component
export default class OperateHistory extends Vue {

  @Prop() word

  data: any = {}
  selected: number = -1
  htmlString: string = ''
  date: any = new Date()

  url = {
    get: 'http://10.148.16.217:11160/renyin5/fp/word/records/page',
    del: 'http://10.148.16.217:11160/renyin5/fp/files/delete',
  }

  pageInfo = {
    index: 1,
    total: 0,
    size: 9,
  }

  @Watch('selected')
  async onSelectedChange(value) {
    if (value != -1)
      this.getHtmlString()
    else
      this.htmlString = ''
  }

  async getHtmlString() {
    this.htmlString = ''
    let res = await axios({
      url: this.data[this.selected].message,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
    if (res.status == 200) {
      this.htmlString = res.data
    }
    else {
      Vue.prototype['$message']({
        type: 'error',
        message: '文档获取失败',
      })
    }
  }

  async getHistoryData(time, page = 1, size = 9) {
    this.data = null
    let res = await axios({
      url: this.url.get,
      params: {
        word: this.word,
        currentPage: page,
        pageSize: size,
        time: time,
      },
    })
    if (res.status === 200) {
      return {
        data: res.data.data ? res.data.data.objs : null,
        total: res.data.data ? res.data.data.totalCount : 0,
      }
    }
    else {
      Vue.prototype['$message']({
        type: 'error',
        message: '历史文档获取失败',
      })
      // throw new Error()
    }
  }

  async download(i) {
    let a = document.createElement('a')
    let url = this.data[i].message
    let res = await axios({
      url:url,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
      method:'get',
      responseType:'blob'
    })
    if(res.status===200){
      let reader=new FileReader()
      reader.onloadend =(e:any)=>{
        a.href=e.target.result
        a.download = url.match(/(?:\/)([^\/]+?)(?:\.[a-zA-Z]+?$)/)[1] + '.doc'
        a.click()
      }
      reader.readAsDataURL(res.data)
    }
    else{
      Vue.prototype['$message']({
        type: 'error',
        message: '数据获取失败',
      })
    }
  }

  upload() {

  }

  open() {
    document.getElementById('file').click()
  }

  check() {
    if (this.data.length == 0 && this.pageInfo.index > 1)
      this.pageSelect(this.pageInfo.index - 1)
  }

  async deleteFile(i) {
    let res = await axios({
      url: this.url.del,
      params: {
        id: this.data[i].id,
        url: this.data[i].message,
      },
    })
    if (res.status == 200) {
      this.data.splice(i, 1)
      if (i === this.selected)
        this.selected = -1
      this.check()
      Vue.prototype['$message']({
        type: 'success',
        message: '删除成功',
      })
    }
    else {
      Vue.prototype['$message']({
        type: 'error',
        message: '删除失败',
      })
    }
  }

  created() {
    this.refresh()
  }

  loadData(data) {
    this.selected = -1
    this.data = data.data
    this.pageInfo.total = data.total
  }

  pageSelect(i) {
    this.pageInfo.index = i
    this.refresh(this.date, i)
  }

  @Watch('date')
  onDateChange(date, old) {
    this.refresh(date)
  }

  refresh(date = this.date, page = 1) {
    this.getHistoryData(date === undefined || date === '' ? '' : moment(date).format('YYYYMMDD'), page).then(data => this.loadData(data))
  }
}
