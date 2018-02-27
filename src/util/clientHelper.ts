// import fetchJsonp from 'fetch-jsonp'
import * as moment from 'moment'
import axios from 'axios'
import jsonpAdapter from 'axios-jsonp'

let baseUrl = 'http://10.148.16.217:11160/renyin5/'

export class userClient {
  static async login(username: string, pwd: string) {       //登录
    // let res = await fetchJsonp(baseUrl + `webuser/login?username=${username}&password=${pwd}`)
    // let msg: any = await res.json()
    // if (msg.stateCode == 0) {
    //   // return true
    //   return msg.data
    // } else {
    //   return false
    // }
    let msg: any = await axios({
      url: baseUrl + `webuser/login?username=${username}&password=${pwd}`,
      adapter: jsonpAdapter,
    })
    if (msg.status === 200 && msg.data.stateCode === 0) return msg.data.data
    else return false
  }

  static async register(userid: string, username: string, password: string, power: string, provinceid: string, cityid: string, countyid: string, provincename: string, cityname: string, countyname: string) {        //注册
    // let res = await fetchJsonp(baseUrl + `webuser/regist?userid=${userid}&username=${username}&password=${password}&power=${power}&provinceid==${provinceid}&cityid==${cityid}&countyid==${countyid}&provincename==${provincename}&cityname=${cityname}&countyname==${countyname}&callback=`)
    // let data: any = await res.json()
  }
}

export class combinationClient {
  static async getMenu() {  //导航栏
    // let res = await fetchJsonp(baseUrl + `combination/select`)
    // let msg: any = await res.json()
    // if (msg.stateCode == 0)
    //   return msg.data
    // else
    //   return false
    let res: any = await axios({
      url: baseUrl + `navMenu/firstMenu/selectAll?cacheCtrl=${Date.now()}`,
      adapter: jsonpAdapter,
    })
    if (res.status === 200 && res.data.stateCode === 0) return res.data.data
    else return false
  }


}

//工具栏 
export class toolbarClient {
  static async getAirports() {      //机场
    // let res = await fetchJsonp(baseUrl + `conn/airports`)
    // let msg: any = await res.json()
    // return msg
    let res: any = await axios({
      url: baseUrl + `conn/airports`,
      adapter: jsonpAdapter,
    })
    if (res.status === 200) return res.data
    else return false
  }

  static async getAirspace() {  //飞行区域
    let res: any = await axios({
      url: baseUrl + `conn/ryareas`,
      adapter: jsonpAdapter,
    })
    if (res.status === 200) return res.data
    else return false
  }

  static async getShotpoint(isFlow) {  //炮点
    let res: any = await axios({
      url: baseUrl + `fp/operation/list/flow?isFlow=${isFlow}`,
      adapter: jsonpAdapter,
    })
    if (res.status === 200) return res.data.data
    else return false
  }

  static async getRadios() {   //电台
    let res: any = await axios({
      url: baseUrl + `conn/radios`,
      adapter: jsonpAdapter,
    })
    if (res.status === 200) return res.data
    else return false
  }
}


// 实况产品
export class productsClient {
  static async getProdTime() {
    let res: any = await axios(`http://10.148.83.228:8922/dataunit/station/findStationData_Latest?provinces[]=广东&elements[]=DAS`)
    if (res.status === 200) return res.data
    else return false
  }

  static async getStation(type) {
    let res: any = await axios(`http://10.148.83.228:8922/dataunit/station/findStationInfo?types[]=${type}&provinces[]=广东`)
    if (res.status === 200) return res.data
    else return false
  }

  static async getProducts(type, datetime) {
    if (type == 'g') {
      datetime = datetime.slice(0, -6) + ":00:00"
    }
    let res: any = await axios(`http://10.148.83.228:8922/dataunit/station/findStationData?types[]=${type}&datetime=${datetime}&elements[]=temp&elements[]=ps&elements[]=rfhour&elements[]=dp&elements[]=wd2df&elements[]=wd2dd&elements[]=rh&elements[]=hourrf&elements[]=mean31_pwv&provinces[]=广东`)
    if (res.status === 200) return res.data
    else return false
  }
}

export class appUserClient {
  static async delete(id) {
    try {
      let res: any = await axios({
        url: baseUrl + `appuser/delete?id=${id}`,
      })
      if (res.status === 200 && res.data.stateCode === 0)
        return true
      else
        return false
    }
    catch (e) {
      return false
    }
  }

  static async pass(id) {
    try {
      let res: any = await axios({
        url: baseUrl + `appuser/update/isPass?id=${id}&isPass=1`,
      })
      if (res.status === 200 && res.data.stateCode === 0)
        return true
      else
        return false
    }
    catch (e) {
      return false
    }
  }

  static async update(data, image: File, isCard: boolean = false) {
    try {
      let formData = new FormData()
      if (image) {
        formData.append(isCard ? 'idCard' : 'imageUrl', image, data.id + Number(isCard) + '.png')
      }
      for (let i in data)
        if (data[i] != null && i != 'imageUrl' && i != 'idCard')
          formData.append(i, data[i])
      let res: any = await axios.post(
        baseUrl + `appuser/update?id=${data.id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      )
      if (res.status === 200 && res.data.stateCode === 0)
        return true
      else
        return false
    }
    catch (e) {
      return false
    }
  }

}

//人员管理
export class groupsClient {

  static async getAllMember() {
    try {
      let res: any = await axios({
        url: baseUrl + `appuser/selectAll?isPass=1&isWorker=1`,
        adapter: jsonpAdapter,
      })
      if (res.status === 200 && res.data.stateCode === 0)
        return res.data.data
      else
        return false
    }
    catch (e) {
      return false
    }
  }

  static async getNotWorker() {
    try {
      let res: any = await axios({
        url: baseUrl + `appuser/selectAll?isPass=1&isWorker=0`,
        adapter: jsonpAdapter,
      })
      if (res.status === 200 && res.data.stateCode === 0)
        return res.data.data
      else
        return []
    }
    catch (e) {
      return []
    }
  }

  static async getNotPassed() {
    try {
      let res: any = await axios({
        url: baseUrl + `appuser/selectAll?isPass=0`,
        adapter: jsonpAdapter,
      })
      if (res.status === 200 && res.data.stateCode === 0)
        return res.data.data
      else
        return false
    }
    catch (e) {
      return false
    }
  }

  static async getGroup(id) {
    try {
      let res: any = await axios({
        url: baseUrl + `webuser/group?groupId=${id || ""}&cacheCtrl=${Date.now()}`,
        adapter: jsonpAdapter,
      })
      if (res.status === 200 && res.data.stateCode === 0) {
        if (id == -1 || id == null) {
          res.data.data.splice(0, 0, {
            id: -1,
            groupname: "非工作人员",
            appUsers: await this.getNotWorker()
          })
        }
        return res.data.data
      }
      else
        return false
    }
    catch (e) {
      return false
    }
  }

  static async addGroup(groupName) {
    try {
      let res: any = await axios({
        url: baseUrl + `webuser/group/add?groupName=${groupName}`,
        adapter: jsonpAdapter,
      })
      if (res.status === 200 && res.data.stateCode === 0)
        return true
      else
        return false
    }
    catch (e) {
      return false
    }
  }

  static async renameGroup(groupId, groupName) {
    try {
      let res: any = await axios({
        url: baseUrl + `webuser/group/update?groupId=${groupId}&groupName=${groupName}`,
        adapter: jsonpAdapter,
      })
      if (res.status === 200 && res.data.stateCode === 0)
        return true
      else
        return false
    }
    catch (e) {
      return false
    }
  }

  static async deleteGroup(groupId) {
    try {
      let res: any = await axios({
        url: baseUrl + `webuser/group/delete?groupId=${groupId}`,
        adapter: jsonpAdapter,
      })
      if (res.status === 200 && res.data.stateCode === 0)
        return true
      else
        return false
    }
    catch (e) {
      return false
    }
  }

  static async addToGroup(appUserId, groupId) {
    try {
      let res: any = await axios({
        url: baseUrl + `webuser/group/sub/add?groupId=${groupId}&id=${appUserId}`,
        adapter: jsonpAdapter,
      })
      if (res.status === 200 && res.data.stateCode === 0)
        return true
      else
        return false
    }
    catch (e) {
      return false
    }
  }

  static async deleteFromGroup(appUserId, groupId) {
    try {
      let res: any = await axios({
        url: baseUrl + `webuser/group/sub/delete?groupId=${groupId}&id=${appUserId}`,
        adapter: jsonpAdapter,
      })
      if (res.status === 200 && res.data.stateCode === 0)
        return true
      else
        return false
    }
    catch (e) {
      return false
    }
  }

}

// 导航修改
export class menusClient {
  static async addFirstMenu(suffix) {  //添加一级菜单
    let res: any = await axios({
      url: baseUrl + `navMenu/firstMenu/add?${suffix}`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }
  static async modifyFirstMenu(id, name, url, subMenuIds) {  //修改一级菜单
    let res: any = await axios({
      url: baseUrl + `navMenu/firstMenu/modify?id=${id}&name=${name}&url=${url}&subMenuIds=${subMenuIds}`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }
  static async deleteFirstMenu(id) {  //删除一级菜单
    let res: any = await axios({
      url: baseUrl + `navMenu/firstMenu/delete?id=${id}`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }
  static async addSecondMenu(name) {  //添加二级级菜单
    let res: any = await axios({
      url: baseUrl + `navMenu/secondMenu/add?&name=${name}`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }
  static async modifySecondMenu(id, name, url, subMenuIds) { //修改二级菜单
    let res: any = await axios({
      url: baseUrl + `navMenu/secondMenu/modify?id=${id}&name=${name}&url=${url}&subMenuIds=${subMenuIds}`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }
  static async deleteSecondMenu(id) {   //删除二级菜单
    let res: any = await axios({
      url: baseUrl + `navMenu/secondMenu/delete?id=${id}`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }
  static async addThirdMenu(name, url) {   //添加三级菜单
    let res: any = await axios({
      url: baseUrl + `navMenu/thirdMenu/add?name=${name}&url=${url}`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }
  static async modifyThirdMenu(id, name, url) {   //修改三级菜单
    let res: any = await axios({
      url: baseUrl + `navMenu/thirdMenu/modify?id=${id}&name=${name}&url=${url}`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }
  static async deleteThirdMenu(id) {   //删除三级菜单
    let res: any = await axios({
      url: baseUrl + `navMenu/thirdMenu/delete?id=${id}`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }

  static async productList() {   //产品列表
    let res: any = await axios({
      url: baseUrl + `navMenu/getProductList`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return res.data.data
    else return false
  }


}

// 作业点管理
export class jobManagementClient {
  static async findsJobPoint() {   //查询作业点接口
    let res: any = await axios({
      url: `http://113.108.192.95:11008/renyin5/fp/operation/finds?city=&cacheCtrl=${Date.now()}`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return res.data.data
    else return false
  }
  static async deldeteJobPoint(id) {   //删除作业点接口
    let res: any = await axios({
      url: baseUrl + `fp/operation/delete?osId=${id}`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }
  static async updateJobPoint(id, address, latStr, lonStr, fireDirection, airport, fireRadius, fireHeight, height, city, county, appUser) {   //更新作业点接口
    let res: any = await axios({
      url: baseUrl + `fp/operation/update?id=${id}&address=${address}&latStr=${latStr}&lonStr=${lonStr}&fireDirection=${fireDirection}&airport=${airport}&fireRadius=${fireRadius}&fireHeight=${fireHeight}&height=${height}&city=${city}&county=${county}&appUser.id=${appUser}`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }
  static async addJobPoint(id, address, latStr, lonStr, fireDirection, airport, fireRadius, fireHeight, height, city, county, appUser) {   //增加作业点信息接口
    let res: any = await axios({
      url: baseUrl + `fp/operation/add?id=${id}&address=${address}&latStr=${latStr}&lonStr=${lonStr}&fireDirection=${fireDirection}&airport=${airport}&fireRadius=${fireRadius}&fireHeight=${fireHeight}&height=${height}&city=${city}&county=${county}&appUser.id=${appUser}`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }
  static async appuserJobPoint() {   //更新作业点指挥员接口
    let res: any = await axios({
      url: baseUrl + `fp/operation/update/appuser?osId=440203057&appUserId=1`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return res.data.data
    else return false
  }
}

//考试接口
export class examinationClient {
  static async getQuestion(page, pageSize, questionType) {   //获取试题
    let res: any = await axios({
      url: baseUrl + `exam/getQuestion?page=${page}&pageSize=${pageSize}&questionType=${questionType}&cacheCtrl=${Date.now()}`,
    })
    if (res.status === 200 && res.data.stateCode === 0) return res.data.data
    else return false
  }

  static async uploadQuestion(param) {   //批量上传试题
    let res: any = await axios({
      url: baseUrl + `exam/uploadQuestion?${param}`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }
  static async getExamState() {   //保存成绩
    let res: any = await axios({
      url: baseUrl + `exam/getExamState?cacheCtrl=${Date.now()}`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return res.data.data
    else return false
  }

  static async creatExam(param) {   //生成试卷
    let res: any = await axios({
      url: baseUrl + `exam/creatExamRandomly`,
      method: 'post',
      data: param,
      transformRequest: [function (data) {
        let ret = ''
        for (let i in data) {
          if (Array.isArray(data[i])) {
            for (let el of data[i]) {
              ret += encodeURIComponent(i) + '[]=' + encodeURIComponent(el) + '&'
            }
          }
          else
            ret += encodeURIComponent(i) + '=' + encodeURIComponent(data[i]) + '&'
        }
        return ret
      }]
    })
    if (res.status === 200 && res.data.stateCode === 0) return res.data.data
    else return false
  }

  static async getExam(url) {
    let res: any = await axios({
      url: baseUrl + 'exam' + url
    })
  }
}

//灾情上报
export class disasterClient {
  static async addDisaster() {   //灾情上报接口
    let res: any = await axios({
      url: baseUrl + `disaster/add`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return res.data.data
    else return false
  }
  static async selectDisasterByTime(time) {   //灾情查询（按时间）
    let res: any = await axios({
      url: baseUrl + `disaster/selectByTime?time=${time}`,
      method: 'post'
    })
    if (res.status === 200 && res.data.stateCode === 0) return res.data.data
    else return false
  }

}

//弹药装备物联网 
export class AmmunitionInternetClient {
  static async getRepository() {   // 获取仓库接口
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/repository/`
    })
    if (res.status === 200) return res.data
    else return false
  }

  static async modifyRepository(param) {   // 修改仓库接口
    let res: any 
    try {
      res= await axios({
        url: `http://10.148.16.217:11160/renying/repository/${param.id}`,
        method: 'patch',
        data: JSON.stringify(param),
        headers: { 'Content-Type': 'application/json' }
      })
    }
    catch (e) {
      return undefined
    }
    if (res !== undefined) {
      if (res.status === 200) return res.data
      else return false
    }
  }

  static async addRepository(param) {   // 新增仓库接口
    let res: any
    try {
      res = await axios({
        url: `http://10.148.16.217:11160/renying/repository/`,
        method: 'post',
        data: JSON.stringify(param),
        headers: { 'Content-Type': 'application/json' }
      })
    }
    catch (e) {
      return undefined
    }
    if (res !== undefined) {
      if (res.status === 201) return res.data
      else return false
    }
  }

  static async deleteRepository(id) {   // 删除仓库接口
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/repository/${id}`,
      method: 'delete',
      headers: { 'Content-Type': 'application/json' }
    })
    if (res.status === 204) return true
    else return false
  }

  static async getAmmunitionBox() {   //获取弹药箱
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/ammunitionBox/`
    })
    if (res.status === 200) return res.data
    else return false
  }
  static async getAmmunition() {   //获取弹药
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/ammunition/`
    })
    if (res.status === 200) return res.data
    else return false
  }

  static async getAmmunitionMsg(id) {   //获取仓库的全部弹药信息
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/repository/${id}/res`
    })
    if (res.status === 200) return res.data
    else return false
  }
  static async getAmmunitionEvent(id) {   //获取指定弹药的事件历史
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/ammunition/${id}/event`
    })
    if (res.status === 200) return res.data
    else return false
  }
  static async getAmmunitionBoxEvent(id) {   //获取指定弹药箱的事件历史
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/ammunitionBox/${id}/event`
    })
    if (res.status === 200) return res.data
    else return false
  }

}
//弹药仓库状态监测
export class AmmunitionStatus {
  static async getStatus() {   //获取状态接口
    let res: any = await axios({
      url: `http://113.108.192.95:11005/weather/humitures/all`,
      adapter: jsonpAdapter,
    })
    if (res.status === 200) return res.data
    else return false
  }
}
//获取各城市
export class geoClient {
  static async getCities() {
    let res = await axios('static/json/city.json')
    if (res.status === 200) return res.data
    else return false
  }
}

//获取广东省各市边界线
export class mapboundaryClient {
  static async getCitiesBoundary() {
    let res: any = await axios({
      url: `http://10.148.10.80:8111/dict/mapboundary/s3/广东,/JSONP/`,
      adapter: jsonpAdapter,
    })
    if (res.status === 200) return res.data
    else return false
  }

  static async getGdBoundary() {     //广东边界
    let res: any = await axios({
      url: `http://10.148.83.228:2008/projshare/geo/get/prov`,
    })
    if (res.status === 200) return res.data.tagObject
    else return false
  }
  static async getCityBoundary() {  //广东各市边界
    let res: any = await axios({
      url: `http://10.148.83.228:2008/projshare/geo/get/cities`,
    })
    if (res.status === 200) return res.data.tagObject
    else return false
  }
}


//短信调度
export class messageDispatchClient {
  static async getmsgSend(param) {
    let res: any = await axios({
      url: baseUrl + `msg/msgSend`,
      method: 'post',
      data: param,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=url-8"
      }
    })
    if (res.status === 200) return true
    else return false
  }
}

//作业点安全等级
export class safetyClient {
  static async safetyItem() {
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/safetyItem`,
    })
    if (res.status === 200) return res.data
    else return false
  }

  static async getSafetyRating() {
    let res: any = await axios(`http://10.148.16.217:11160/renying/safetyRating`)
    if (res.status === 200) return res.data
    else return false
  }

  static async submitSafetyRating(param) {
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/safetyRating`,
      method: 'post',
      data: param
    })
    if (res.status === 201) return true
    else return false
  }
}
//规范文件管理
export class specificationClient {
  static async getSpecification() {  //获取文件列表
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/specification`,
    })
    if (res.status === 200) return res.data
    else return false
  }
  static async uploadSpecification(form) {  //上传文件
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/specification`,
      method: 'post',
      data: form
    })
    if (res.status === 200) return true
    else return false
  }
  static async deleteSpecification(id) {  //删除文件
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/specification/${id}`,
      method: 'delete',
      headers: { 'Content-Type': 'application/json' }
    })
    if (res.status === 204) return true
    else return false
  }

}
//各市作业点查看审核
export class operationClient {
  static async getOperation(opId) {      //选择作业点查看文档列表接口
    let res: any = await axios({
      url: baseUrl + `fp/operation/files/list?osId=${opId}&cacheCtrl=${Date.now()}`,
      adapter: jsonpAdapter,
    })
    if (res.status === 200 && res.data.stateCode === 0) return res.data.data
    else return false
  }
  static async uploadOperation(form) {      //上传文件图片接口
    let res: any = await axios({
      url: baseUrl + `fp/operation/files/upload`,
      method: 'post',
      data: form
    })
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }
  static async updateOperation(id, isTarget) {      //修改是否通过
    let res: any = await axios({
      url: baseUrl + `fp/operation/update?id=${id}&isTarget=${isTarget}`,
      adapter: jsonpAdapter,
    })
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }

  static async deleteOperation(id, fileName) {      //删除作业点文档
    let res: any = await axios({
      url: baseUrl + `fp/operation/files/delete?osId=${id}&fileName=${fileName}`,
      adapter: jsonpAdapter,
    })
    console.log(res.data)
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }

}

//空域
export class airspaceClient {
  static async getAirspace() {   // 获取空域
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/airspace/`
    })
    if (res.status === 200) return res.data
    else return false
  }
  static async modifyAirspace(param, id) {   // 修改空域
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/airspace/${id}`,
      method: 'patch',
      data: JSON.stringify(param),
      headers: { 'Content-Type': 'application/json' }
    })
    if (res.status === 200) return res.data
    else return false
  }

  static async addAirspace(param) {   // 新增空域
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/airspace`,
      method: 'post',
      data: JSON.stringify(param),
      headers: { 'Content-Type': 'application/json' }
    })
    if (res.status === 201) return res.data
    else return false
  }

  static async deleteAirspace(id) {   // 删除空域
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/airspace/${id}`,
      method: 'delete',
      headers: { 'Content-Type': 'application/json' }
    })
    if (res.status === 204) return true
    else return false
  }
}
//市局账号管理
export class webuserClient {
  static async getWebuser() {   // web用户查询接口
    let res: any = await axios({
      url: baseUrl + `webuser/selectall?cacheCtrl=${Date.now()}`,
      adapter: jsonpAdapter,
    })
    if (res.status === 200) return res.data.data
    else return false
  }
  static async addWebuser(param) {    // web用户新增接口
    let suffix = ''
    Object.keys(param).map(el => {
      suffix += el + '=' + param[el] + '&'
    })
    suffix = suffix.slice(0, suffix.length - 1)
    let res: any = await axios({
      url: baseUrl + `webuser/regist?${suffix}`
    })
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }
  static async updateWebuser(param) {    // web用户更新接口
    let suffix = ''
    Object.keys(param).map(el => {
      suffix += el + '=' + param[el] + '&'
    })
    suffix = suffix.slice(0, suffix.length - 1)
    let res: any = await axios({
      url: baseUrl + `webuser/update/new?${suffix}`
    })
    if (res.status === 200 && res.data.stateCode === 0) return true
    else return false
  }
  static async deleteWebuser(id) {    // web用户删除接口
    let res: any = await axios({
      url: baseUrl + `webuser/delete?id=${id}`,
      adapter: jsonpAdapter,
    })
    if (res.status === 200) return true
    else return false
  }
}
//作业上报更新接口
export class operuploadClient {
  static async getOperation() {   // 作业上报查询接口
    let res: any = await axios({
      url: baseUrl + `fp/operation/result/list?cacheCtrl=${Date.now()}`,
      adapter: jsonpAdapter,
    })
    if (res.status === 200) return res.data.data
    else return false
  }

  static async getOperationByPage(currentPage, pageSize) {
    let res: any = await axios({
      url: baseUrl + `fp/operation/result/list/page?currentPage=${currentPage}&pageSize=${pageSize}&cacheCtrl=${Date.now()}`,
      adapter: jsonpAdapter,
    })
    if (res.status === 200) return res.data.data.objs
    else return false
  }
}
//html模版参数
export class templateClient {
  static async getTemplate() {   // 获取html模版参数
    let res: any = await axios({
      url: baseUrl + `fp/template/item/select?cacheCtrl=${Date.now()}`,
      adapter: jsonpAdapter,
    })
    if (res.status === 200) return res.data.data
    else return false
  }
  static async modifyTemplate(area,timeRange,goal,way) {   // 修改html模版参数
    let res: any = await axios({
      url: baseUrl + `fp/template/item/update?area=${area}&timeRange=${timeRange}&goal=${goal}&way=${way}&cacheCtrl=${Date.now()}`,
      adapter: jsonpAdapter,
    })
    if (res.status === 200) return true
    else return false
  }
}

//自动设备运输
export class transportClient {
  static async getInTransport() {  //获取所有正在运输中的自动设备
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/device?inTransit&cacheCtrl=${Date.now()}`,
    })
    if (res.status === 200) return res.data
    else return false
  }
  static async getTransport(id) {  //获取even
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/event/${id}?cacheCtrl=${Date.now()}`,
    })
    if (res.status === 200) return res.data
    else return false
  }
  static async stopTransport(param) {  //结束运输
    let res: any = await axios({
      url: `http://10.148.16.217:11160/renying/device/event`,
      method: 'post',
      data: JSON.stringify(param),
      headers: { 'Content-Type': 'application/json' }
    })
    if (res.status === 200) return res.data
    else return false
  }

}

//历史回归
export class airlineDesignClient {
  // static async getAirlineDesign() {
  //   let res: any = await axios({          //历史航迹
  //     url: `http://10.148.16.217:9020/dao/airline_design/select?_=${Date.now()}`,
  //     adapter: jsonpAdapter,
  //   })
  //   if (res.status === 200) return res.data
  //   else return false
  // }
  static async evaluate(strEffect, strCompare, datetime, effectHours) {
    let res: any
    try {
      res = await axios({
        url: `http://10.148.16.217:9020/dao/evaluate?strEffect=${strEffect}&strCompare=${strCompare}&datetime=${datetime}&effectHours=${effectHours}`,
        adapter: jsonpAdapter
      })
    }
    catch (e) {
      return false
    }
    if (res.status === 200) return res.data
    else return false
  }
  static async getTaskinfo() {    //飞行任务信息
    let res: any = await axios({        
      url: `http://113.108.192.95:11005/weather/trajectory/taskinfo?cacheCtrl=${Date.now()}`,
      adapter: jsonpAdapter,
    })
    if (res.status === 200) return res.data
    else return false
  }
  static async getTaskid(planeid, taskid) {    //飞行任务信息
    let res: any = await axios({        
      url: `http://113.108.192.95:11005/weather/trajectory/plane/task/${planeid}/${taskid}?cacheCtrl=${Date.now()}`,
      adapter: jsonpAdapter,
    })
    if (res.status === 200) return res.data
    else return false
  }
  
}


