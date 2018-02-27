import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import WithRender from './EditorMessage.html?style=./EditorMessage.scss'

@WithRender
@Component
export default class EditorMessage extends Vue {
  @Prop() closeFn
  @Prop() userMsg
  @Prop() modifyItem

  userInfo: any = {}
  file: File = null

  mounted() {
    this.reset()
  }

  selectImage() {
    document.getElementById("image").click()
  }

  imageChange(e) {
    this.file = e.target.files[0]
    if (!this.file) return
    let reader = new FileReader()
    reader.readAsDataURL(this.file)
    reader.onload = e => {
      let target: any = e.target
      document.getElementById("imageShow").setAttribute('src', target.result)
    }
  }

  reset() {
    this.userInfo = { ...this.userMsg }
    this.file = null
    document.getElementById("imageShow").setAttribute('src', 'http://10.148.16.217:11160/renyin5/appuser/' + this.userMsg.imageUrl)
  }

  save() {
    this.modifyItem(this.userInfo, this.file)
  }

  @Watch('userMsg')
  f() {
    this.reset()
  }
}
