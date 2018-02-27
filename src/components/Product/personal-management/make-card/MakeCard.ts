import Vue from 'vue'
import {Component, Watch, Prop} from 'vue-property-decorator'
import {Action, Getter} from 'vuex-class'
import WithRender from './MakeCard.html?style=./MakeCard.scss'
import Card from './CardImage'
import axios from 'axios'

@WithRender
@Component
export default class MakeCard extends Vue {
  @Prop() closeFn
  @Prop() userMsg
  @Prop() saveCard

  userInfo: any = {}
  path: String = '默认照片'
  generated: boolean = false
  showdownload:boolean=false

  async mounted() {
    this.userInfo = {
      ...this.userMsg,
      date: new Date().toLocaleDateString(),
      no: '',
      area: '广东省行政区域范围',
      period: '五年',
      imageUrl:'http://10.148.16.217:11160/renyin5/appuser/' + this.userMsg.imageUrl
    }
    if (this.userInfo.idCard) {
      let res = await axios({
        url:'http://10.148.16.217:11160/renyin5/appuser/' + this.userInfo.idCard,
        method:'get',
        responseType:'blob'
      })
      if (res.status == 200) {
        let reader=new FileReader()
        reader.onloadend =(e:any)=>{
          (<HTMLImageElement>document.getElementById("card")).src='data:image/png'+e.target.result.slice('data:text/xml'.length)
        }
        reader.readAsDataURL(res.data)
      }
    }
  }

  changePhoto(e) {
    let file = e.target.files[0]
    if (!file) return
    this.path = file.name
    let reader = new FileReader()
    reader.onloadend = (e: any) => {
      this.userInfo.imageUrl = e.target.result
    }
    reader.readAsDataURL(file)
  }

  upload() {
    document.getElementById('file').click()
  }

  dataURLtoBlob(dataurl): Blob {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], {type: mime})
  }

  makeCard() {
    let card = new Card(this.userInfo, this.userInfo.imageUrl, '/static/img/stamp.png')
    card.onload = imgUrl => {
      let img = <HTMLImageElement>document.getElementById('card')
      img.src = imgUrl
      this.saveCard(this.userMsg, this.dataURLtoBlob(imgUrl))
    }
    card.gen()
  }

  imgLoad(e) {
    let img = e.target
    let downloaBtn = <HTMLAnchorElement>document.getElementById('download')
    downloaBtn.href = e.target.src
    downloaBtn.download = `${this.userInfo.name}的工作证`
    this.showdownload=true
  }
}
