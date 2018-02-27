import Vue from 'vue'
import {Component, Watch} from 'vue-property-decorator'
import {Action, Getter} from 'vuex-class'
import WithRender from './PersonalManagement.html?style=./PersonalManagement.scss'
import * as CONFIG from '../../../config/productId'
import CreateGroup from './create-group/CreateGroup'
import EditorMessage from './editor-message/EditorMessage'
import MakeCard from './make-card/MakeCard'
import {groupsClient, appUserClient} from '../../../util/clientHelper'
import axios from 'axios'

@WithRender
@Component
export default class PersonalManagement extends Vue {

  @Action('systemStore/toggleProductView_global') toggleProductView_global

  productId: string = CONFIG.personalManagement

  groupSelected: number = null
  itemSelected: any = null

  createGroupView: any = null
  editorMessageView: any = null
  makeCardView: any = null

  createPopup: boolean = true
  groupsListPopup: boolean = false

  userMsg: any = {}

  allPsnList: any = []
  personList: any = []
  notPassedList: any = []
  currentPageList: any = []

  selectall: boolean = false

  pageSize: number = 11
  currentPage: number = 1

  keyword: string = ''

  group: any = []

  mounted() {
    this.getGroup().then(group => {
      this.group = group
      this.toggleAll()
    })
    groupsClient.getNotPassed().then(data => this.notPassedList = data)
  }

  updateNotPassed() {
    groupsClient.getNotPassed().then(data => {
      this.notPassedList = data
      Vue.prototype['$message']({
        type: 'success',
        message: '已更新待审核列表',
      })
    })
  }

  async getGroup(id: number & undefined = undefined) {
    let data = await groupsClient.getGroup(id)
    if (!data || !data.length) return
    for (let opt of data) {
      for (let item of opt.appUsers) {
        item.selected = false
      }
    }
    return data
  }

  async updateGroup() {
    this.group = await this.getGroup()
  }

  async updateUser() {
    let data:any = await groupsClient.getAllMember()
    if (data === false) {
      Vue.prototype['$message']({
        type: 'error',
        message: '用户列表获取失败',
      })
      return
    }
    this.allPsnList = data.map(x => ({...x, selected: false}))
  }

  async toggleAll(page = 1) {
    //console.log(page)

    this.groupsListPopup = false
    this.groupSelected = null
    this.itemSelected = null
    await this.updateUser()
    if(this.keyword!=''){
      this.onkeywordChanged(this.keyword,this.keyword)
    }
    else{
      this.personList = this.allPsnList
      this.currentPage = page
      this.currentPageList = this.personList.slice(this.pageSize * (page - 1), this.pageSize * page)
    }
  }

  async toggleGroup(index: number, page = 1) {
    this.groupsListPopup = false
    this.group[index] = (await this.getGroup(this.group[index].id))[0]
    //todo: optimize
    // if (this.groupSelected === item.id) return
    this.itemSelected = this.group[index]
    this.groupSelected = index
    if(this.keyword!=''){
      this.onkeywordChanged(this.keyword,this.keyword)
    }
    else {
      this.personList = this.itemSelected.appUsers
      this.currentPage = page
      this.currentPageList = this.personList.slice(this.pageSize * (page - 1), this.pageSize * page)
    }
  }

  selectAll() {
    this.selectall = !this.selectall
    this.currentPageList.forEach(x => x.selected = this.selectall)
  }

  toggleCheckPerson(item) {
    item.selected = !item.selected
  }

  toggleCreateGroup() {
    this.createGroupView = this.createGroupView ? null : CreateGroup
    this.createPopup = this.createPopup ? false : true
  }

  toggleEditor(item) {
    this.userMsg = item
    this.editorMessageView = this.editorMessageView ? null : EditorMessage
  }

  toggleMakeCard(item) {
    this.userMsg = item
    this.makeCardView = this.makeCardView ? null : MakeCard
  }

  pageSelect(i) {
    this.currentPage = i
    this.currentPageList = this.personList.slice(this.pageSize * (i - 1), this.pageSize * i)
  }

  async pass(key) {
    let res: boolean = await appUserClient.pass(this.notPassedList[key].id)
    if (res == false) {
      Vue.prototype['$message']({
        type: 'error',
        message: '操作失败',
      })
      return
    }
    this.notPassedList.splice(key, 1)
    Vue.prototype['$message']({
      type: 'success',
      message: '操作成功',
    })
    if (this.groupSelected == null) {
      this.toggleAll(this.currentPage)
    }
  }

  async refuse(key) {
    let res: boolean = await appUserClient.delete(this.notPassedList[key].id)
    if (res == false) {
      Vue.prototype['$message']({
        type: 'error',
        message: '操作失败',
      })
      return
    }
    this.notPassedList.splice(key, 1)
    Vue.prototype['$message']({
      type: 'success',
      message: '已拒绝',
    })
  }

  deleteItem(key) {
    Vue.prototype['$confirm'](`是否从分组 ${this.itemSelected.groupname} 中删除用户 ${this.currentPageList[key].name}?`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => {
      let data = await groupsClient.deleteFromGroup(this.currentPageList[key].id, this.itemSelected.id)
      if (data) {
        this.toggleGroup(this.groupSelected, this.currentPage)
      }
      else {
        Vue.prototype['$message']({
          type: 'error',
          message: '删除失败',
        })
      }
    }).catch(() => {
    })
  }

  async modifyItem(item, image: File) {
    if (await appUserClient.update(item, image)) {
      Vue.prototype['$message']({
        type: 'success',
        message: '更新成功',
      })
      if (this.groupSelected != null)
        this.toggleGroup(this.groupSelected, this.currentPage)
      else
        this.toggleAll(this.currentPage)
    }
    else {
      Vue.prototype['$message']({
        type: 'error',
        message: '更新失败',
      })
    }
  }

  async saveCard(item, image: File) {
    if (await appUserClient.update(item, image, true)) {
      Vue.prototype['$message']({
        type: 'success',
        message: '工作证已上传至服务器',
      })
      if (this.groupSelected != null)
        this.toggleGroup(this.groupSelected, this.currentPage)
      else
        this.toggleAll(this.currentPage)
    }
    else {
      Vue.prototype['$message']({
        type: 'error',
        message: '工作证上传失败',
      })
    }
  }

  selectFile() {
    let file = document.getElementById("xlsfile")
    file.click()
  }

  async upxls(e) {
    let file = e.target.files[0]
    if (!file) return
    let formData = new FormData()
    formData.append("file", file)
    let res = await axios.post(
      "http://10.148.16.217:11160/renyin5/exam/uploadScoreFile",
      formData,
      {
        headers: {'Content-Type': 'multipart/form-data'},
      }
    )
    if(res.status==200&&res.data.stateCode==0){
      Vue.prototype['$message']({
        type: 'success',
        message: '成绩上传成功',
      })
    }
    else{
      Vue.prototype['$message']({
        type: 'error',
        message: '成绩上传失败',
      })
    }
  }

  @Watch('keyword')
  onkeywordChanged(val: any,old:String) {
    if(old!=val){
      this.currentPage = 1
    }
    let arr = []
    ;(this.groupSelected != null ? this.itemSelected.appUsers : this.allPsnList).forEach(x => {
      let isMatch = false
      let exp = new RegExp(val)
      for (let i in x) {
        if (i == 'id' || i == 'password' || i == 'username' || i == 'imageUrl' || i == 'selected') continue
        if (exp.test(x[i])) {
          isMatch = true
          break
        }
      }
      if (isMatch) arr.push(x)
    })
    this.personList = arr
    this.currentPageList = this.personList.slice(this.pageSize * (this.currentPage - 1), this.pageSize * this.currentPage)
  }
  downLoadPerson() {
    window.open(`http://10.148.16.217:11160/renyin5/appuser/excel/download`)
  }
}
