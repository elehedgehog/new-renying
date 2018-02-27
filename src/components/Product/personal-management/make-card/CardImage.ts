export default class Card {
  canvas
  ctx

  photo: any = new Image()
  stamp: any = new Image()

  paraTop

  onload: Function

  constructor(
    public info:any,
    public photoSrc: string,
    public stampSrc: string,
    public font: String='30px jy3',
    public w: number = 780,
    public h: number = 1205,
    public imageBottom: number = 535,
    public infoTop: number = 590,
    public left: number = 90,
    public paraDistance: number = 60,
    public fontSize: number = 40,
    public stampTop: number = 410
  ) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = w
    this.canvas.height = h
    this.ctx = this.canvas.getContext('2d')
    this.ctx.font = font
  }

  private justifyText(t, s) {
    let size = this.ctx.measureText(s).width
    let l = (size - this.ctx.measureText(s[0]).width) / (t.length - 1)
    let p = this.left
    t.split('').forEach(c => {
      this.ctx.fillText(c, p, this.paraTop)
      p += l
    })
    return this.left + size
  }

  private putText(t) {
    let [title, content] = t.split('|||')
    this.ctx.fillText(content, this.justifyText(title, "口口口口"), this.paraTop)
    this.paraTop += this.paraDistance
  }

  private paintText() {
    let date = (new Date(this.info.date) || new Date()).toLocaleDateString().split('/')

    this.paraTop = this.infoTop
    this.putText(`单位|||： ${this.info.department}`)
    this.putText(`姓名|||： ${this.info.name}`)
    this.putText(`职务|||： ${this.info.position}`)
    this.putText(`从事岗位|||： ${this.info.post}`)
    this.putText(`作业区域|||： ${this.info.area}`)
    this.putText(`|||`)
    this.putText(`发证时间|||： ${date[0]} 年 ${date[1]} 月 ${date[2]} 日`)
    this.putText(`证件号码|||： ${this.info.workCredential}`)
    this.putText(`有效期|||： ${this.info.period}`)
  }

  private putImage(img, left, top) {
    this.ctx.drawImage(img, left, top)
  }

  private paintImage() {
    this.putImage(this.photo, (this.w - this.photo.width) / 2, this.imageBottom - this.photo.height)
    this.putImage(this.stamp, (this.w - this.photo.width - this.stamp.width) / 2, this.stampTop)
  }

  private paintBackground() {
    this.ctx.fillStyle = 'white'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.fillStyle = 'black'
  }

  gen() {
    this.photo.setAttribute('crossOrigin', 'anonymous');
    this.photo.src = this.photoSrc
    this.stamp.setAttribute('crossOrigin', 'anonymous');
    this.stamp.src = this.stampSrc

    let cnt = 0
    this.photo.onload = this.stamp.onload = () => {
      ++cnt
      if (cnt == 2) {
        this.paintBackground()
        this.paintText()
        this.paintImage()
        this.onload(this.canvas.toDataURL("image/png"))
      }
    }
  }
}
