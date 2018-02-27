import * as moment from 'moment'

export default class AirDetectDrawer {
  constructor(canvasId: string, data: AirDetectData) {
    this.canvasId = canvasId
    this.data = data
    this.ele = <HTMLCanvasElement>document.querySelector(this.canvasId)
    this.ctx = this.ele.getContext('2d')
    this.getHeightFactor();
  }
  widthFactor: number
  ele: HTMLCanvasElement = null
  canvasId: string = null
  rectHeight = 530
  rectWidth = 340
  imgHolder = []
  data: AirDetectData = null
  ctx: CanvasRenderingContext2D = null
  temHeightColor = '#808040'
  zeroHeightColor = '#ff0080'
  tempLineColor = '#098443'
  demLineColor = '#2f5e5e'
  iceRHLineColor = '#f00000'
  waterRHLineColor = '#0058b0'
  cloudLevelOutlineColor = '#7bb780'
  cloudLevelColor = '#d3ffd3'
  cloudLayerOutlineColor = '#7bb780'
  heightFactor: number
  heightPositionHolder: number[] = []

  redraw(data) {
    this.data = data
    this.ctx.translate(-0.5, -0.5)
    this.draw()
  }

  draw() {
    this.ctx.translate(-0.5, -0.5)
    this.ctx.clearRect(0, 0, 1000, 1000)
    this.ctx.translate(0.5, 0.5)
    this.drawText()
    this.drawExample()
    this.drawCloudLayer()
    this.drawData()
    this.drawWind()
  }

  drawCloudLayer() {
    let layerHeightHolder = []
    this.ctx.save()
    this.ctx.strokeStyle = this.cloudLayerOutlineColor
    this.ctx.fillStyle = this.cloudLevelColor
    for (let i in this.data.levels) {
      if ((this.data.waterRhs[i] >= 90 && this.data.waterRhs[i] < 1000) ||
        (this.data.iceRhs[i] >= 90 && this.data.iceRhs[i] < 1000)) {
        layerHeightHolder.push(this.heightPositionHolder[i])
      } else {
        if (layerHeightHolder.length >= 2) {
          this.ctx.beginPath()
          this.ctx.moveTo(30 + 0.5, layerHeightHolder[0])
          this.ctx.lineTo(this.rectWidth - 30 - 0.5, layerHeightHolder[0])
          this.ctx.stroke()
          this.ctx.closePath()
          this.ctx.beginPath()
          this.ctx.moveTo(30 + 0.5, layerHeightHolder[layerHeightHolder.length - 1])
          this.ctx.lineTo(this.rectWidth - 30 - 0.5, layerHeightHolder[layerHeightHolder.length - 1])
          this.ctx.stroke()
          this.ctx.closePath()
          this.ctx.globalAlpha = 0.7
          this.ctx.fillRect(30 + 0.5, layerHeightHolder[0],
            this.rectWidth - 60 - 0.5, layerHeightHolder[layerHeightHolder.length - 1] - layerHeightHolder[0])
          this.ctx.globalAlpha = 1
        }
        layerHeightHolder = []
      }
    }
    this.ctx.restore()
  }

  async drawWind() {
    await this.loadAllWindImg()
    for (let i in this.data.levels) {
      this.rotateAndPaintImage(this.ctx,
        this.imgHolder[this.getWindImgNum(this.data.dfs[i])],
        this.data.dds[i],
        this.rectWidth - 60, this.heightPositionHolder[i],
        0, 0)
    }
  }

  private drawExample() {
    this.ctx.save()
    this.ctx.lineWidth = 1
    this.ctx.strokeStyle = '#000'
    this.ctx.fillStyle = '#000'
    this.ctx.setLineDash([])

    this.ctx.font = '16px MicroSoft YaHei'
    this.ctx.textBaseline = 'middle'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(this.data.staName, this.rectWidth / 2, 15) //绘制站点名

    this.ctx.strokeRect(30, 30, this.rectWidth - 60, this.rectHeight - 60) //绘制外边框

    this.ctx.font = '10px MicroSoft YaHei'
    this.ctx.textAlign = 'right'
    this.ctx.fillText('(km)', 25, 30)
    this.ctx.textAlign = 'left'
    this.ctx.fillText('(Pa)', this.rectWidth - 30 + 3, 30)
    this.ctx.strokeStyle = 'black'
    let heightFactor = this.heightFactor
    for (let i in this.data.levels) {
      if (this.data.levels[i] === 999999) continue
      let item = this.data.levels[i]
      this.ctx.textBaseline = 'middle'
      let heightPosition = (this.rectHeight - 30) - (item / heightFactor) * (this.rectHeight - 30)
      this.heightPositionHolder.push(heightPosition)
      this.ctx.fillText((item / 1000).toFixed(1), 3, heightPosition)
      this.ctx.beginPath()
      this.ctx.moveTo(25, heightPosition)
      this.ctx.lineTo(30, heightPosition)
      this.ctx.closePath()
      this.ctx.stroke()
      this.drawPa(Number(i), heightPosition, this.ctx)
    }
    this.widthFactor = Number(((this.rectWidth - 60) / 20).toFixed(0))
    this.ctx.textBaseline = 'top'
    for (let i = -10; i <= 10; i++) {
      let widthPosition = 30 + (i < 0 ? 10 - i * -1 : 10 + i) * this.widthFactor,
        lineTo = 0
      if (i === -10 || i === -5) {
        this.ctx.textAlign = 'right'
        this.ctx.fillText(String(i * 10), widthPosition - 2, 506)
        lineTo = 510
      } else if (i === 10 || i === 5 || i === 0) {
        this.ctx.textAlign = 'left'
        this.ctx.fillText(String(i * 10), widthPosition + 2, 506)
        lineTo = 510
      } else {
        lineTo = 505
      }
      this.ctx.moveTo(widthPosition, 500)
      this.ctx.lineTo(widthPosition, lineTo)
    }
    this.ctx.closePath()
    this.ctx.stroke()
    this.ctx.restore()
  }

  private drawData() {
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.setLineDash([2, 4])
    this.ctx.strokeStyle = this.temHeightColor
    this.ctx.fillStyle = this.temHeightColor
    this.ctx.textBaseline = 'middle'
    let lineHeight = this.getHeightPosition(this.data.tempMinus40)
    this.ctx.moveTo(30, lineHeight)
    this.ctx.lineTo(this.rectWidth - 30, lineHeight)
    this.ctx.fillText(this.data.tempMinus40.toString(), 34, lineHeight + 8)
    lineHeight = this.getHeightPosition(this.data.tempMinus20)
    this.ctx.moveTo(30, lineHeight)
    this.ctx.lineTo(this.rectWidth - 30, lineHeight)
    this.ctx.fillText(this.data.tempMinus20.toString(), 34, lineHeight + 8)
    lineHeight = this.getHeightPosition(this.data.tempMinus10)
    this.ctx.moveTo(30, lineHeight)
    this.ctx.lineTo(this.rectWidth - 30, lineHeight)
    this.ctx.fillText(this.data.tempMinus10.toString(), 34, lineHeight + 8)
    this.ctx.stroke()
    this.ctx.closePath()
    this.ctx.beginPath()
    this.ctx.setLineDash([])
    this.ctx.strokeStyle = this.zeroHeightColor
    this.ctx.fillStyle = this.zeroHeightColor
    lineHeight = this.getHeightPosition(this.data.temp0)
    this.ctx.moveTo(30, lineHeight)
    this.ctx.lineTo(this.rectWidth - 30, lineHeight)
    this.ctx.fillText(this.data.temp0.toString(), 34, lineHeight + 8)
    this.ctx.stroke()
    this.ctx.closePath()
    this.ctx.beginPath()
    this.ctx.strokeStyle = 'black'
    this.ctx.setLineDash([2, 4])
    let widthPosition = 30 + 19 * this.widthFactor
    this.ctx.moveTo(widthPosition, 30)
    this.ctx.lineTo(widthPosition, this.rectHeight - 30)
    this.ctx.stroke()
    this.ctx.closePath()

    let dirtyData = false
    this.ctx.setLineDash([])
    this.ctx.beginPath()
    this.ctx.strokeStyle = this.tempLineColor
    for (let i in this.data.levels) {
      // 温度
      let tem = this.data.ts[i] / 10
      if (tem > 1000) {
        dirtyData = true
        continue
      }
      let widthPosition = 30 + (tem < 0 ? 10 - tem * -1 : 10 + tem) * this.widthFactor
      if (Number(i) === 0 || dirtyData) {
        dirtyData = false
        this.ctx.moveTo(widthPosition, this.heightPositionHolder[i])
      } else {
        this.ctx.lineTo(widthPosition, this.heightPositionHolder[i])
      }
    }
    this.ctx.stroke()
    this.ctx.closePath()
    this.ctx.beginPath()
    //露点温度
    this.ctx.beginPath()
    this.ctx.strokeStyle = this.demLineColor
    for (let i in this.data.levels) {
      let tem = this.data.dps[i] / 10
      if (tem > 1000) {
        dirtyData = true
        continue
      }
      let widthPosition = 30 + (tem < 0 ? 10 - tem * -1 : 10 + tem) * this.widthFactor
      if (Number(i) === 0 || dirtyData) {
        dirtyData = false
        this.ctx.moveTo(widthPosition, this.heightPositionHolder[i])
      } else {
        this.ctx.lineTo(widthPosition, this.heightPositionHolder[i])
      }
    }
    this.ctx.stroke()
    this.ctx.closePath()
    // 冰面相对湿度
    this.ctx.beginPath()
    this.ctx.strokeStyle = this.iceRHLineColor
    for (let i in this.data.levels) {
      let tem = this.data.iceRhs[i] / 10
      if (tem > 1000) {
        dirtyData = true
        continue
      }
      let widthPosition = 30 + (tem < 0 ? 10 - tem * -1 : 10 + tem) * this.widthFactor
      if (Number(i) === 0 || dirtyData) {
        dirtyData = false
        this.ctx.moveTo(widthPosition, this.heightPositionHolder[i])
      } else {
        this.ctx.lineTo(widthPosition, this.heightPositionHolder[i])
      }
    }
    this.ctx.stroke()
    this.ctx.closePath()
    // 水面相对湿度
    this.ctx.beginPath()
    this.ctx.strokeStyle = this.waterRHLineColor
    for (let i in this.data.levels) {
      let tem = this.data.waterRhs[i] / 10
      if (tem > 1000) {
        dirtyData = true
        continue
      }
      let widthPosition = 30 + (tem < 0 ? 10 - tem * -1 : 10 + tem) * this.widthFactor
      if (Number(i) === 0 || dirtyData) {
        dirtyData = false
        this.ctx.moveTo(widthPosition, this.heightPositionHolder[i])
      } else {
        this.ctx.lineTo(widthPosition, this.heightPositionHolder[i])
      }
    }
    this.ctx.stroke()
    this.ctx.closePath()
  }

  getHeightPosition(height) {
    return (this.rectHeight - 30) - (height / this.heightFactor) * (this.rectHeight - 30)
  }

  drawText() {
    this.ctx.save()
    let xPos = this.rectWidth + 10
    this.ctx.font = '14px MicroSoft YaHei'
    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillStyle = 'black'
    this.ctx.fillText('日期时间:', xPos, 30)
    this.ctx.fillText(this.data.time, xPos, 50)
    this.ctx.font = '12px MicroSoft YaHei'
    this.ctx.fillText('图例', xPos, 165)
    this.ctx.setLineDash([2, 6])
    this.ctx.fillStyle = this.temHeightColor
    this.ctx.strokeStyle = this.temHeightColor
    this.ctx.beginPath()
    this.ctx.moveTo(xPos, 165 + 17)
    this.ctx.lineTo(xPos + 24, 165 + 17)
    this.ctx.stroke()
    this.ctx.closePath()
    this.ctx.fillText('-40°层高度', xPos + 30, 165 + 17)
    this.ctx.beginPath()
    this.ctx.moveTo(xPos, 165 + 17 * 2)
    this.ctx.lineTo(xPos + 24, 165 + 17 * 2)
    this.ctx.stroke()
    this.ctx.closePath()
    this.ctx.fillText('-20°层高度', xPos + 30, 165 + 17 * 2)
    this.ctx.beginPath()
    this.ctx.moveTo(xPos, 165 + 17 * 3)
    this.ctx.lineTo(xPos + 24, 165 + 17 * 3)
    this.ctx.stroke()
    this.ctx.closePath()
    this.ctx.fillText('-10°层高度', xPos + 30, 165 + 17 * 3)
    this.ctx.beginPath()
    this.ctx.setLineDash([])
    this.ctx.strokeStyle = this.zeroHeightColor
    this.ctx.fillStyle = this.zeroHeightColor
    this.ctx.moveTo(xPos, 165 + 17 * 4)
    this.ctx.lineTo(xPos + 24, 165 + 17 * 4)
    this.ctx.stroke()
    this.ctx.closePath()
    this.ctx.fillText('0°层高度', xPos + 30, 165 + 17 * 4)

    this.ctx.beginPath()
    this.ctx.setLineDash([])
    this.ctx.strokeStyle = this.tempLineColor
    this.ctx.fillStyle = this.tempLineColor
    this.ctx.moveTo(xPos, 260 + 17)
    this.ctx.lineTo(xPos + 24, 260 + 17)
    this.ctx.closePath()
    this.ctx.stroke()
    this.ctx.fillText('温度', xPos + 30, 260 + 17)
    this.ctx.beginPath()
    this.ctx.strokeStyle = this.demLineColor
    this.ctx.fillStyle = this.demLineColor
    this.ctx.moveTo(xPos, 260 + 17 * 2)
    this.ctx.lineTo(xPos + 24, 260 + 17 * 2)
    this.ctx.closePath()
    this.ctx.stroke()
    this.ctx.fillText('露点温度', xPos + 30, 260 + 17 * 2)
    this.ctx.beginPath()
    this.ctx.strokeStyle = this.iceRHLineColor
    this.ctx.fillStyle = this.iceRHLineColor
    this.ctx.moveTo(xPos, 260 + 17 * 3)
    this.ctx.lineTo(xPos + 24, 260 + 17 * 3)
    this.ctx.closePath()
    this.ctx.stroke()
    this.ctx.fillText('冰面相对湿度', xPos + 30, 260 + 17 * 3)
    this.ctx.beginPath()
    this.ctx.strokeStyle = this.waterRHLineColor
    this.ctx.fillStyle = this.waterRHLineColor
    this.ctx.moveTo(xPos, 260 + 17 * 4)
    this.ctx.lineTo(xPos + 24, 260 + 17 * 4)
    this.ctx.closePath()
    this.ctx.stroke()
    this.ctx.fillText('水面相对湿度', xPos + 30, 260 + 17 * 4)
    this.ctx.beginPath()
    this.ctx.strokeStyle = 'black'
    this.ctx.fillStyle = 'black'
    this.ctx.setLineDash([2, 6])
    this.ctx.moveTo(xPos, 260 + 17 * 5)
    this.ctx.lineTo(xPos + 24, 260 + 17 * 5)
    this.ctx.closePath()
    this.ctx.stroke()
    this.ctx.fillText('云阈值', xPos + 30, 260 + 17 * 5)
    this.ctx.restore()
  }

  private drawPa(index: number, heightPosition: number, ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.textBaseline = "bottom"
    let text = String(this.data.ps[index])
    ctx.fillText(text, this.rectWidth - 30 + 2, heightPosition - 2)
    let textWidth = ctx.measureText(text).width
    ctx.moveTo(this.rectWidth - 30, heightPosition)
    ctx.lineTo(this.rectWidth - 30 + 2 + textWidth, heightPosition)
    ctx.stroke()
    ctx.closePath()
    ctx.restore()
  }

  private getWindImgNum(speed: number) {
    if (speed > 39) {
      return 21
    } else if (speed > 37) {
      return 20
    } else if (speed > 35) {
      return 19
    } else if (speed > 33) {
      return 18
    } else if (speed > 31) {
      return 17
    } else if (speed > 29) {
      return 16
    } else if (speed > 27) {
      return 15
    } else if (speed > 25) {
      return 14
    } else if (speed > 23) {
      return 13
    } else if (speed > 21) {
      return 12
    } else if (speed > 19) {
      return 11
    } else if (speed > 17) {
      return 10
    } else if (speed > 15) {
      return 9
    } else if (speed > 13) {
      return 8
    } else if (speed > 11) {
      return 7
    } else if (speed > 9) {
      return 6
    } else if (speed > 7) {
      return 5
    } else if (speed > 5) {
      return 4
    } else if (speed > 3) {
      return 3
    } else if (speed > 2) {
      return 2
    } else if (speed > 1) {
      return 1
    } else {
      return 0
    }
  }

  private createImgLoading(address: string) {
    return new Promise(resolve => {
      let img = new Image()
      img.src = address
      img.onload = () => {
        this.imgHolder.push(img)
        resolve()
      }
    })
  }

  private async loadAllWindImg() {
    for (let i = 0; i <= 21; i++) {
      await this.createImgLoading(`/static/wind/${i}.png`)
    }
    return
  }

  private rotateAndPaintImage(context: CanvasRenderingContext2D, image, angle, positionX, positionY, axisX, axisY) {
    let angleInRadian = angle * (Math.PI / 180)
    context.save()
    context.translate(positionX, positionY)
    context.rotate(angleInRadian);
    context.drawImage(image, -axisX, -axisY, 8, 15);
    context.rotate(-angleInRadian);
    context.translate(-positionX, -positionY);
    context.restore()
  }

  private getHeightFactor() {
    for (let i = this.data.levels.length - 1; i >= 0; i--) {
      if (this.data.levels[i] !== 999999) {
        this.heightFactor = (this.data.levels[i] / 10000 + 0.4) * 10000
        break;
      }
    }
  }
}

interface AirDetectData {
  obtId: string
  staName: string
  temp0: number
  tempMinus10: number
  tempMinus20: number
  tempMinus40: number
  ps: number[]
  levels: number[]
  ts: number[]
  dps: number[]
  waterRhs: number[]
  iceRhs: number[]
  time: string
  dfs: number[]
  dds: number[]
}