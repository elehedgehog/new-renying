let distance = {
  7: 0.4993614386198417,
  8: 0.24951781223511085,
  9: 0.1247799952753877,
  10: 0.06239248685878533,
  11: 0.031196517779115324,
  12: 0.015598283981356395,
  13: 0.007799142826702872,
}

function distance2(x, y, d) {
  return (xx, yy) => (x - xx) * (x - xx) + (y - yy) * (y - yy) < d
}

function manhattan(x, y, d) {
  return (xx, yy) => Math.abs(x - xx) + Math.abs(y - yy) < d
}

function check(tmp, cmp) {
  for (let p of tmp) {
    if (cmp(p.x, p.y)) {
      return false
    }
  }
  return true
}

export default class Vacuate {
  res = {}
  cmp

  constructor(data,fn) {
    // console.time('init')
    if(fn=='manhattan')
      this.cmp=(x,y,d)=>manhattan(x,y,d)
    if(fn=='distance2')
      this.cmp=(x,y,d)=>distance2(x,y,d*d)

    let tmp = []
    this.res[13] = [...data]
    for (let i = 7; i < 13; ++i) {
      for (let j = 0; j < data.length;) {
        let f = this.cmp(data[j].x, data[j].y, distance[i])
        if (check(tmp, f)) {
          tmp.push(data[j])
          data.splice(j, 1)
        }
        else {
          ++j
        }
      }
      this.res[i] = [...tmp]
    }
    // console.timeEnd('init')
  }

  render(map, L) {
    let z = map.getZoom()
    if (z > 13) z = 13
    if (z < 7) z = 7
    let data = this.res[z]
    let bounds = map.getBounds()
    let xmax = bounds._northEast.lat, xmin = bounds._southWest.lat, ymax = bounds._northEast.lng,
      ymin = bounds._southWest.lng
    let lg = new L.LayerGroup()
    for (let m of data) {
      if (m.x < xmax && m.x > xmin && m.y < ymax && m.y > ymin) {
        lg.addLayer(m.marker)
      }
    }
    return lg
  }
}
