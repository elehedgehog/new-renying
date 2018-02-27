import * as moment from 'moment'

export default class WindRadarDrawer {
  constructor(drawType: 'single' | 'multiple', canvasId: string) {
    this.drawType = drawType
    this.canvasId = canvasId
  }
  singleRadarData: Array<singleRadarData> = null
  multipleRadarData: Array<multipleRadarData> = null
  drawType: 'single' | 'multiple' = null
  canvasId: string = null
  rectHeight = 600
  rectWidth = 740
  imgHolder: HTMLImageElement[] = []
  heightNum: number = 11

  

  public setData(data) {
    if (this.drawType === 'multiple') {
      this.multipleRadarData = data
    } else {
      this.singleRadarData = data
    }
  }
  public setDrawType(type) {
    this.drawType = type
  }

  public draw(datetime: string, addr?: string) {
    this.drawSingleRadar(datetime, addr)
  }

  private async drawSingleRadar(datetime, addr) {
    let canvas = <HTMLCanvasElement>document.getElementById(this.canvasId)
    let ctx = canvas.getContext('2d')
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.textBaseline = 'bottom'
    ctx.strokeStyle = '#292929'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 2
    ctx.strokeRect(60, 50, 742, 602)
    ctx.fillStyle = 'black'
    ctx.font = '24px Microsoft YaHei'
    // 绘制抬头
    ctx.fillText(addr, 64, 45)
    ctx.font = '10px Microsoft YaHei'
    ctx.fillStyle = '#249224'
    ctx.textBaseline = 'hanging'
    ctx.fillText('高度', 35, 50)
    ctx.textAlign = 'center'
    ctx.fillText('(米)', 45, 63)
    ctx.fillStyle = 'black'
    ctx.font = '12px Microsoft YaHei'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`时间范围: ${moment(this.singleRadarData[0].datetime).format('YYYY-MM-DD HH:mm')} ~ ` +
      moment(this.singleRadarData[this.singleRadarData.length - 1].datetime).format('YYYY-MM-DD HH:mm'),
      800, 45)
    ctx.restore()

    await this.loadAllWindImg()
    this.drawExample(ctx)

    let maxHeight = this.getMaxHeight(this.singleRadarData)
    let heightNum = Math.floor(maxHeight / 1000) + 1
    let eachWidth = this.rectWidth / (this.singleRadarData.length + 1),
      eachHeight = this.rectHeight / heightNum
    // 绘制表格
    ctx.save()
    ctx.fillStyle = '#249224'
    ctx.lineWidth = 2
    ctx.strokeStyle = 'lightgray'
    ctx.setLineDash([3, 2])
    ctx.beginPath()
    ctx.textBaseline = 'hanging'
    ctx.textAlign = 'center'
    for (let i = 0; i < this.singleRadarData.length; i++) {
      let x = 61 + (i + 1) * eachWidth
      ctx.moveTo(x, 51)
      ctx.lineTo(x, 651)
      ctx.fillText(moment(this.singleRadarData[i].datetime).format('HH:mm'), x, 656)
    }
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    for (let i = 1; i < heightNum; i++) {
      let y = 51 + i * eachHeight
      ctx.moveTo(61, y)
      ctx.lineTo(800, y)
      ctx.fillText(String((heightNum - i) * 1000), 25, y)
      ctx.fillStyle = '#249224'
    }
    ctx.stroke()
    ctx.closePath()
    ctx.restore()

    ctx.save()
    for (let i in this.singleRadarData) {
      for (let j in this.singleRadarData[i].heights) {
        this.rotateAndPaintImage(ctx,
          this.imgHolder[this.getWindImgNum(this.singleRadarData[i].wss[j] * 2)],
          this.singleRadarData[i].wds[j],
          61 + ((Number(i) + 1) * eachWidth), 51 + 600 * (1 - this.singleRadarData[i].heights[j] / (heightNum * 1000)),
          0, 33)
      }
    }
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

  private drawExample(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.font = 'bold 14px Microsoft YaHei'
    ctx.fillStyle = 'black'
    ctx.textAlign = 'left'
    ctx.fillText('图例说明', 820, 140)
    ctx.font = 'normal 12px Microsoft YaHei'
    let speedCounter = 0
    for (let i in this.imgHolder) {
      let img = this.imgHolder[i],
        num = Number(i),
        text = ''

      if (num <= 2) {
        text = speedCounter.toString()
        speedCounter++
      } else if (num < 11) {
        text = speedCounter + '-' + (speedCounter + 3)
        speedCounter += 2
      } else if (num === 11) {
        text = '>=19'
        speedCounter = 20
      } else if (num < this.imgHolder.length - 1) {
        text = speedCounter + 1 + '-' + (speedCounter + 2)
        speedCounter += 2
      } else {
        text = `>=39`
      }

      ctx.drawImage(img, 820, 160 + num * 20, img.width * 0.7, img.height * 0.5)
      ctx.fillText(text, 845, 170 + num * 20)
    }
    ctx.fillStyle = '#0a8789'
    ctx.fillText('单位:米/秒', 825, 180 + this.imgHolder.length * 20)
    ctx.restore()
  }

  private async loadAllWindImg() {
    for (let i = 0; i <= 21; i++) {
      await this.createImgLoading(`/static/wind/${i}.png`)
    }
    return
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
  private rotateAndPaintImage(context: CanvasRenderingContext2D, image, angle, positionX, positionY, axisX, axisY) {
    let angleInRadian = angle * (Math.PI / 180)
    context.save()
    context.translate(positionX, positionY)
    context.rotate(angleInRadian);
    context.drawImage(image, -axisX, -axisY);
    context.rotate(-angleInRadian);
    context.translate(-positionX, -positionY);
    context.restore()
  }

  private getMaxHeight(data: multipleRadarData[] | singleRadarData[]) {
    let maxHeight: number = 0
    for (let item of data) {
      for (let subItem of item.heights) {
        maxHeight < subItem && (maxHeight = subItem)
      }
    }
    return maxHeight
  }
}

interface multipleRadarData {
  wds: number[]
  wss: number[]
  heights: number[]
  obtid: string
}

interface singleRadarData {
  wds: number[]
  wss: number[]
  datetime: string
  heights: number[]
  obtid: string
  ppointdatacount: number
}