import Vue from 'vue'
import {Component, Watch, Prop} from 'vue-property-decorator'
import WithRender from './CreateGroup.html?style=./CreateGroup.scss'
import {groupsClient} from '../../../../util/clientHelper'


@WithRender
@Component
export default class CreateGroup extends Vue {
  @Prop() closeFn
  @Prop() group
  @Prop() curPageList
  @Prop() itemSelected
  @Prop() toggleAll
  @Prop() updateGroup

  groupingName: string = ''
  modifyGroupSelected: any = null
  oldname: String = ''

  mounted() {
    this.initData()
  }

  initData() {
    this.modifyGroupSelected = this.group.slice().map(x => ({
      ...x,
      isPopupOn: false,
      inputPopup: false,
      checked: false,
    }))
  }

  async createGroup() {
    if (!this.groupingName) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '分组名称不得为空',
      })
      return
    }
    let data = await groupsClient.addGroup(this.groupingName)
    if (data) {
      this.updateGroup()
    }
    else
      Vue.prototype['$message']({
        type: 'error',
        message: '创建分组失败',
      })
  }

  @Watch('group')
  ongroupChanged(val: any, oldVal: any) {
    this.initData()
  }

  toggleRename(item) {
    item.inputPopup = true
    item.isPopupOn = false
    this.oldname = item.groupname
  }

  async renameBtn(item) {
    item.inputPopup = false
    if (this.oldname == item.groupname) return
    let res = await groupsClient.renameGroup(item.id, item.groupname)
    if (res) {
      this.updateGroup()
    }
    else
      Vue.prototype['$message']({
        type: 'error',
        message: '修改失败',
      })
  }

  deleteGroup(item) {
    Vue.prototype['$confirm'](`是否删除分组 ${item.groupname}?`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => {
      let res = await groupsClient.deleteGroup(item.id)
      if (res) {
        if (this.itemSelected.id == item.id) {
          this.toggleAll()
        }
        this.updateGroup()
      }
      else
        Vue.prototype['$message']({
          type: 'error',
          message: '删除失败',
        })
    }).catch(() => {
    })
  }

  toggleGroupCheck(item) {
    item.checked = !item.checked
  }

  async finish() {
    let group = this.modifyGroupSelected.filter(x => x.checked)
    let info = ""
    for (let i of this.curPageList) {
      if (i.selected) {
        for (let g of group) {
          let res = await groupsClient.addToGroup(i.id, g.id)
          if (!res) {
            info += `${i.name} 加入 ${g.groupname} 失败; `
          }
        }
      }
    }
    if (info == "") {
      Vue.prototype['$message']({
        type: 'success',
        message: "操作成功",
      })
    }
    else {
      Vue.prototype['$message']({
        type: 'error',
        message: info,
      })
    }
    this.closeFn()
  }
}
