import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './FileManagement.html?style=./FileManagement.scss'
import { specificationClient } from '../../../util/clientHelper'
import * as CONFIG from '../../../config/productId'
import * as moment from 'moment'
@WithRender
@Component
export default class FileManagement extends Vue {
  @Getter('systemStore/userInfo_global') userInfo_global
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  moment = moment
  productId: string = CONFIG.fileManagement
  pageSize: number = 11
  currentPage: number = 1       // 当前页数
  currentPageList: any = []     // 当前页数 用户数据
  specificationList = []
  uploadPop: boolean = false
  file: any = null

  mounted() {
    this.getSpecification()
  }

  
  async getSpecification(){  //获取文件列表
    let data = await specificationClient.getSpecification()
    console.log(data)
    this.specificationList = data
    this.currentPageList = this.specificationList.slice(this.pageSize*(this.currentPage-1), this.pageSize*(this.currentPage-1) + this.pageSize)
  }
  fileChanged(e) {
    console.log(e)
    this.file = e.target.files[0]
  }

  async uploadFile(){  //上传文件
    if (!this.file) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '请添加文件'
      })
      return
    }
    let formdata = new FormData()
    formdata.append('file', this.file)
    let filename = this.file.name
    let index = filename.lastIndexOf('.')
    filename = filename.slice(0, index)
    formdata.append('title', filename)
    formdata.append('uploader', this.userInfo_global.username)
    let level = this.userInfo_global.power ? 'province' : 'city'
    formdata.append('level', level)
    let res = await specificationClient.uploadSpecification(formdata)
    if (res) {
      Vue.prototype['$message']({
        type: 'success',
        message: '文件上传成功'
      })
      this.uploadPop = false
      this.getSpecification()
    } else {
      Vue.prototype['$message']({
        type: 'warning',
        message: '文件上传失败'
      })
    }
  }
  
  downloadSpecification(id) {  //下载文件
    window.open(`http://10.148.16.217:11160/renying/specification/${id}/file`)
  }
  async deleteSpecification(id) {  //删除文件
    let res = await specificationClient.deleteSpecification(id)
    Vue.prototype['$confirm']('是否确定删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      if (res) {
        Vue.prototype['$message']({
          type: 'success',
          message: '文件删除成功'
        })
        this.getSpecification()
      } else {
        Vue.prototype['$message']({
          type: 'warning',
          message: '文件删除失败'
        })
      }
    }).catch(() => {})
  }

  currentChange(e) {
    this.currentPage = e
    this.currentPageList = this.specificationList.slice(this.pageSize*(e-1), this.pageSize*(e-1) + this.pageSize)
  }
}