export class OperateClient {
  private static htmlToDocUrl = 'http://10.148.16.217:11160/renyin5/fp/files/html/converter'
  private static docToHtml = 'http://10.148.16.217:11160/renyin5/fp/files/doc/converter'
  private static downloadPrefix = 'http://10.148.16.217:11160/renyin5/fp/files/doc/download/'
  static async downloadFile(htmlString: string) {
    console.info(htmlString.indexOf('<hr'))
    let blob = new Blob([`<html><head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    </head><body>${htmlString}</body></html>`], { type: 'text/html' })
    let form = new FormData()
    form.append('uploadFile', blob)
    // let res = await fetch(this.htmlToDocUrl, {
    //   method: 'post',
    //   mode: 'cors',
    //   cache: 'no-cache',
    //   body: form
    // })
    let downloadEle = <HTMLAnchorElement>document.createElement('a')
    // let data = await res.json()
    let url = URL.createObjectURL(blob)
    downloadEle.download = 'test.doc'
    console.info(url)
    downloadEle.href = url
    downloadEle.click()
    URL.revokeObjectURL(url)
  }
  static async uploadFile(file) {
    /* let form = new FormData()
    form.append('uploadFile', file)
    let res = await fetch(this.docToHtml, {
      method: 'post',
      mode: 'cors',
      body: form
    })
    let data = await res.json() */
    return new Promise((resolve, reject) => {
      let read = new FileReader()
      read.readAsText(file)
      read.onload = (e: any) => {
        resolve(e.currentTarget.result)
      }
    })
  }
}