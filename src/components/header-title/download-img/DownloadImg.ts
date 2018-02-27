import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './DownloadImg.html?style=./DownloadImg.scss'
import SelectToggle from '../../commons/select-toggle/SelectToggle'
import * as moment from 'moment'
@WithRender
@Component({
  components: {
    SelectToggle
  }
})

export default class DownloadImg extends Vue {
  moment = moment
  @Prop() closeFn
  forecastDate: any = []
  productDate: any = null
  modifyPop: boolean = false
  modifyInfo: any = {}
  utcSelected: number = 0
  scopeList: any = {
    SouthChina: '华南',
    GuangDong: '广东',
    SingleStation: '单站',
    Rainnest: '雨窝'
  }
  products: any[] = [
    {
      key: 'g9',
      name: 'GRAPES中尺度模式产品',
      forecasts: (() => {
        let arr = []
        for (let i = 0; i <= 168; i++) {
          arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
        }
        return arr
      })(),
      forecastsNum: 1,
      startForecast: '000',
      endForecast: '000',
      areas: ['SouthChina', 'GuangDong', 'SingleStation', 'Rainnest'],
      areasSelected: 'SouthChina',
      hours: ['00', '06', '12', '18'],
      startDate: new Date(),
      startHour: '00',
      endDate: new Date(),
      endHour: '00',
      products: ['mslp', 'mslp24','t2mm','t2mm24','wind10m','rain3','rain6','rain24','rain48','rain72','rain24stablization','t-td-surf','kiki','si','cape','surfparameters', 'tz-omeg','tz-wind-rhum','tz-windzthse','Tlogp','tlogp','surfparameters','tzZomeg','tzZwindZrhum','tzZwindZthse','tlogp'],
      singleStationCountys: ['59287', '59284', '59285', '59294', '59481', '59082', '57988', '57989', '57996', '59081', '59090', '59094', '59097', '59483', '59488', '59487', '59316', '59318',  '59319', '59324', '59279', '59288', '59480',  '59473', '59475', '59476', '59477', '59478', '59673', '59658', '59650', '59654', '59656', '59750', '59754', '59659', '59456', '59653', '59655', '59664', '59264', '59269', '59270', '59271', '59276', '59278 ', '59290', '59297', '59298', '59492', '59117', '59106', '59109', '59114', '59116', '59303', '59310', '59501', '59500', '59502','59293', '59096', '59099', '59107', '59304',  '59663', '59469 ', '59280', '59071', '59072', '59074', '59075', '59087', '59088', '59289', '59485', '59312', '59313', '59315', '59306', '59314', '59317', '59471', '59268' , '59462', '59470'],
      rainnestCountys: ['mm01jd', 'mm02bj', 'mm03mg', 'mm04xd', 'mm05cp','yj01hk', 'yj02pg','jm01df', 'jm02sj', 'jm03cx','sw01ml', 'sw02hk', 'sw03kt','hz01lm', 'hz02bp', 'hz03gt', 'jy01hc','qy01st', 'qy02tp', 'qy03qg'],
      productSelected: false
    }, {
      key: 'g1',
      name: 'GRAPES_1KM',
      forecasts: (() => {
        let arr = []
        for (let i = 0; i <= 360; i += 12) {
          arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
        }
        return arr
      })(),
      forecastsNum: 12,
      startForecast: '000',
      endForecast: '000',
      hours: (() => {
        let arr = []
        for (let i = 0; i <= 23; i++) {
          arr.push(i < 10 ? '0' + i : i)
        }
        return arr
      })(),
      minutes: (() => {
        let arr = []
        for (let i = 0; i <= 54; i += 6) {
          arr.push(i < 10 ? '0' + i : i)
        }
        return arr
      })(),
      startDate: new Date(),
      startHour: '00',
      startMinute: '00',
      endDate: new Date(),
      endHour: '00',
      endMinute: '00',
      products:['mslp','temp2m','rh2m_wind10m','rain12min','wind10m','rain1h','cref',],
      productSelected: false
    }, {
      key: 'g3',
      name: 'GRAPES短临(3km)',
      forecasts: (() => {
        let arr = []
        for (let i = 0; i <= 24; i++) {
          arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
        }
        return arr
      })(),
      forecastsNum: 1,
      startForecast: '000',
      endForecast: '000',
      hours: (() => {
        let arr = []
        for (let i = 0; i <= 23; i++) {
          arr.push(i < 10 ? '0' + i : i)
        }
        return arr
      })(),
      areas: ['SouthChina', 'GuangDong'],
      areasSelected: 'SouthChina',
      startDate: new Date(),
      startHour: '00',
      endDate: new Date(),
      endHour: '00',
      products:['mslp', 'temp2m','wind10m','rain1h','rain3h','rain6h','dbzr','wind925hght925','wind850hght500','wind700hght700','wind500hght500temp500','wind200stream200hght200','temp850-500', 'temp700-500', 'rhum500','rhum850','rhum925','vflux850', 'vflux925','kiki','sweat','tti', 'epi',],
      productSelected: false
    }, {
      key: 'h8',
      name: '葵花8红外灰度图',
      areas: ['SouthChina', 'GuangDong'],
      areasSelected: 'SouthChina',
      hours: (()=>{
        let arr = []
        for(let i=0; i<=23; i++){
          arr.push(i<10 ? '0'+i : ''+i)
        }
        return arr
      })(),
      startDate: new Date(),
      startHour: '00',
      endDate: new Date(),
      endHour: '00',
      products:['inf_bw', 'inf_col', 'vap_bw', 'vis_3ch', 'vis_col', 'vis_bw'],
      productSelected: false
    },{
      key: 'ec',
      name: 'ECWMF细网格模式产品',
      forecasts: (() => {
        let arr = []
        for (let i = 0; i <= 240; i += 3) {
          arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
        }
        return arr
      })(),
      forecastsNum: 3,
      startForecast: '000',
      endForecast: '000',
      areas: ['SouthChina', 'GuangDong', 'SingleStation', 'Rainnest'],
      areasSelected: 'SouthChina',
      hours: ['00', '12',],
      startDate: new Date(),
      startHour: '00',
      endDate: new Date(),
      endHour: '00',
      products: ['mslp','mslp24','t2mm','t2mm24','t2mm-max','t2mm-min','t2mm-ave','wind10mslp','10gust3','10gust6','rain3','rain6','rain24','rain48','rain72','rain24stablization','t-td-surf','si','kiki','cape','temp24500','temp24850','temp850-500','temp700-500','hghtwind500', 'hght24500','500hght-850wind-rain','wind200stream200hght200','wind500hght500temp500','wind700','wind850hght500','wind850','wind925','rhum500','rhum700','rhum850','vflux850','vflux925','-td850','wind700jet200','windshear','thse50-850','omeg500','omeg700','omeg850','dive200', 'dive700','dive850','dive925','vort500','500vad-rain','vadv850','vadv925','tadv500', 'tadv850','tadv925',],
      singleStationCountys: ['59287', '59284', '59285', '59294', '59481', '59082', '57988', '57989', '57996', '59081', '59090', '59094', '59097', '59483', '59488', '59487', '59316', '59318',  '59319', '59324', '59279', '59288', '59480',  '59473', '59475', '59476', '59477', '59478', '59673', '59658', '59650', '59654', '59656', '59750', '59754', '59659', '59456', '59653', '59655', '59664', '59264', '59269', '59270', '59271', '59276', '59278 ', '59290', '59297', '59298', '59492', '59117', '59106', '59109', '59114', '59116', '59303', '59310', '59501', '59500', '59502','59293', '59096', '59099', '59107', '59304',  '59663', '59469 ', '59280', '59071', '59072', '59074', '59075', '59087', '59088', '59289', '59485', '59312', '59313', '59315', '59306', '59314', '59317', '59471', '59268' , '59462', '59470'],
      rainnestCountys: ['mm01jd', 'mm02bj', 'mm03mg', 'mm04xd', 'mm05cp','yj01hk', 'yj02pg','jm01df', 'jm02sj', 'jm03cx','sw01ml', 'sw02hk', 'sw03kt','hz01lm', 'hz02bp', 'hz03gt', 'jy01hc','qy01st', 'qy02tp', 'qy03qg'],
      productSelected: false
    }, {
      key: 'fy2',
      name: '人影卫星云反演产品',
      hours: (() => {
        let arr = []
        for (let i = 0; i <= 23; i++) {
          arr.push(i < 10 ? '0' + i : i)
        }
        return arr
      })(),
      startDate: new Date(),
      startHour: '00',
      endDate: new Date(),
      endHour: '00',
      products: ['ttop', 'ztop', 'hsc', 'optn','ref', 'lwp','tbb'],
      productSelected: false
    },{
      key: 'cpe',
      name: 'CPEFS本地化云模式产品',
      forecasts: (() => {
        let arr = []
        for (let i = 0; i <= 48; i ++) {
          arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
        }
        return arr
      })(),
      forecastsNum: 1,
      startForecast: '000',
      endForecast: '000',
      hours: ['08', '20'],
      startDate: new Date(),
      startHour: '00',
      endDate: new Date(),
      endHour: '00',
      products: ['cband','vil','visl','cloudtopt','cloudtoph','cloudboth','cloudbott','dbz' ,'rh','rainnc','QCLOUD','QRAIN','QICE','QSNOW','QGRAUP','QNICE','QNRAIN','QNSNOW','QNGRAUPEL','Qvtc','Qvtr','rain1','rain3','rain6','rain12','rain24'],
      levs1: [400,450,500,550,600,650,700,750,800,850],
      levs2: [19,22,24,26,28,30],
      productSelected: false
    },
  ]

  productData =  {
    g9: {
      SouthChina: [
        {
          name: '地面要素',
          isSelected: true,
          isToggle: false,
          sub: [{
            value: 'mslp',
            isSelected: true,
            name: '海平面气压',
            times: forseeTimeData['0-168']
          }, {
            value: 'mslp24',
            isSelected: true,
            name: '海平面24h变压',
            times: forseeTimeData['24-168']
          }, {
            value: 't2mm',
            isSelected: true,
            name: '2m气温',
            times: forseeTimeData['0-168']
          }, {
            value: 't2mm24',
            isSelected: true,
            name: '2m气温24h变温',
            times: forseeTimeData['24-168']
          }, {
            value: 't2mm-max',
            isSelected: true,
            name: '2m最高气温',
            times: forseeTimeData['0-144~*12']
          }, {
            value: 't2mm-min', isSelected: true, name: '2m最低气温',
            times: forseeTimeData['0-144~*12']
          }, {
            value: 't2mm-ave', isSelected: true, name: '2m平均气温',
            times: forseeTimeData['0-144~*12']
          }, {
            value: 'wind10mslp', isSelected: true, name: '10m阵风',
            times: forseeTimeData['0-168']
          }, /* {
            value: '10gust3', isSelected: true, name: '10m阵风(过去3h)',
          }, {
            value: '10gust6', isSelected: true, name: '10m阵风(过去6h)'
          }, */ {
            value: 'rain3', isSelected: true, name: '3h降水',
            times: forseeTimeData['3-168']
          }, {
            value: 'rain6', isSelected: true, name: '6h降水',
            times: forseeTimeData['6-168']
          }, {
            value: 'rain24', isSelected: true, name: '24h降水',
            times: forseeTimeData['24-168']
          }, {
            value: 'rain48', isSelected: true, name: '48h降水',
            times: forseeTimeData['48-168']
          }, {
            value: 'rain72', isSelected: true, name: '72h降水',
            times: forseeTimeData['72-168']
          }, {
            value: 'rain24stablization', isSelected: true, name: '24h累计降水稳定度',
            times: forseeTimeData['0']
          }, {
            value: 't-td-surf', isSelected: true, name: '地面温度露点差',
            times: forseeTimeData['0-168']
          }],
        }, {
          name: '不稳定层节',
          isSelected: true,
          isToggle: false,
          sub: [{
            value: 'si', isSelected: true, name: 'SI',
            times: forseeTimeData['0-168']
          }, {
            value: 'kiki', isSelected: true, name: 'K指数',
            times: forseeTimeData['0-168']
          }, {
            value: 'cape', isSelected: true, name: 'CAPE',
            times: forseeTimeData['0-168']
          }],
        }, {
          name: '高空要素',
          isSelected: true,
          isToggle: false,
          sub: [{
            value: 'temp24500', isSelected: true, name: '500hPa24h变温',
            times: forseeTimeData['24-168']
          }, {
            value: 'temp24700', isSelected: true, name: '700hPa24h变温',
            times: forseeTimeData['24-168']
          }, {
            value: 'temp24850', isSelected: true, name: '850hPa24h变温',
            times: forseeTimeData['24-168']
          }, {
            value: 'temp850-500', isSelected: true, name: '850-500温度',
            times: forseeTimeData['0-168']
          }, {
            value: 'temp700-500', isSelected: true, name: '700-500温度',
            times: forseeTimeData['0-168']
          }, {
            value: 'hghtwind500', isSelected: true, name: '500hPa高度(副高)',
            times: forseeTimeData['0-168']
          }, {
            value: 'hght24500', isSelected: true, name: '500hPa高度(变高)',
            times: forseeTimeData['24-168']
          }, {
            value: '500hght-850wind-rain', isSelected: true, name: '500高度+850风+降水',
            times: forseeTimeData['6-168']
          }, {
            value: 'wind200stream200hght200', isSelected: true, name: '200hPa形式',
            times: forseeTimeData['0-168']
          }, {
            value: 'wind500hght500temp500', isSelected: true, name: '500hPa形式',
            times: forseeTimeData['0-168']
          }, {
            value: 'wind700', isSelected: true, name: '700hPa形式',
            times: forseeTimeData['0-168']
          }, {
            value: 'wind850hght500', isSelected: true, name: '850hPa风',
            times: forseeTimeData['0-168']
          }, {
            value: 'wind850', isSelected: true, name: '850hPa风_单要素',
            times: forseeTimeData['0-168']
          }, {
            value: 'wind925', isSelected: true, name: '925hPa风',
            times: forseeTimeData['0-168']
          }],
        },
        {
          name: '水汽条件',
          isSelected: true,
          isToggle: false,
          sub: [{
            value: 'rhum500', isSelected: true, name: '500hPa相对湿度',
            times: forseeTimeData['0-168']
          }, {
            value: 'rhum700', isSelected: true, name: '700hPa相对湿度',
            times: forseeTimeData['0-168']
          }, {
            value: 'rhum850', isSelected: true, name: '850hPa相对湿度',
            times: forseeTimeData['0-168']
          }, {
            value: 'tcdc', isSelected: true, name: '总云量',
            times: forseeTimeData['0-168']
          }, {
            value: 'vflux850', isSelected: true, name: '850hPa水汽通量',
            times: forseeTimeData['0-168']
          }, {
            value: 'vflux925', isSelected: true, name: '925hPa水汽通量',
            times: forseeTimeData['0-168']
          }, {
            value: '-td850', isSelected: true, name: '850hPa温度露点差',
            times: forseeTimeData['0-168']
          }]
        }, {
          name: '热动力因子',
          isSelected: true,
          isToggle: false,
          sub: [{
            value: 'wind700jet200', isSelected: true, name: '700hPa风+200hPa急流',
            times: forseeTimeData['0-168']
          }, {
            value: 'windshear', isSelected: true, name: '200-850风切变',
            times: forseeTimeData['0-168']
          }, {
            value: 'thse50-850', isSelected: true, name: '假相当位温',
            times: forseeTimeData['0-168']
          }, {
            value: 'omeg500', isSelected: true, name: '500hPa垂直速度',
            times: forseeTimeData['0-168'],
          }, {
            value: 'omeg700', isSelected: true, name: '700hPa垂直速度',
            times: forseeTimeData['0-168'],
          }, {
            value: 'omeg850', isSelected: true, name: '850hPa垂直速度',
            times: forseeTimeData['0-168'],
          }, {
            value: 'dive200', isSelected: true, name: '200hPa散度',
            times: forseeTimeData['0-168']
          }, {
            value: 'dive700', isSelected: true, name: '700hPa散度',
            times: forseeTimeData['0-168']
          }, {
            value: 'dive850', isSelected: true, name: '850hPa散度',
            times: forseeTimeData['0-168']
          }, {
            value: 'dive925', isSelected: true, name: '925hPa散度',
            times: forseeTimeData['0-168']
          }, {
            value: 'vort500', isSelected: true, name: '500hPa涡度',
            times: forseeTimeData['0-168']
          }, {
            value: '500vad-rain', isSelected: true, name: '500hPa涡度平流+降水',
            times: forseeTimeData['14-168']
          }, {
            value: 'vadv850', isSelected: true, name: '850hPa涡度平流',
            times: forseeTimeData['0-168']
          }, {
            value: 'vadv925', isSelected: true, name: '925hPa涡度平流',
            times: forseeTimeData['0-168']
          }, {
            value: 'tadv500', isSelected: true, name: '500hPa温度平流',
            times: forseeTimeData['0-168']
          }, {
            value: 'tadv850', isSelected: true, name: '850hPa温度平流',
            times: forseeTimeData['0-168']
          }, {
            value: 'tadv925', isSelected: true, name: '925hPa温度平流',
            times: forseeTimeData['0-168']
          },],
        }, {
          name: '雷达和能见度',
          isSelected: true,
          isToggle: false,
          sub: [{
            value: 'cref', isSelected: true, name: '组合雷达反射率',
            times: forseeTimeData['0-168']
          }, {
            value: 'dbzr', isSelected: true, name: '3km高度雷达反射率',
            times: forseeTimeData['0-168']
          }, {
            value: 'visi', isSelected: true, name: '能见度',
            times: forseeTimeData['0-168']
          }]
        }
      ],
      GuangDong: [{
        name: '地面要素',  
        isSelected: false,
        isToggle: false,
        sub: [
          {
            value: 'mslp', isSelected: false, name: '海平面气压',
            times: forseeTimeData['0-168']
          }, {
            value: 'mslp24', isSelected: false, name: '海平面24h变压',
            times: forseeTimeData['24-168']
          }, {
            value: 't2mm', isSelected: false, name: '2m气温',
            times: forseeTimeData['0-168']
          }, {
            value: 't2mm24', isSelected: false, name: '2m气温24h变温',
            times: forseeTimeData['24-168']
          }, {
            value: 'wind10m', isSelected: false, name: '10m风',
            times: forseeTimeData['0-168']
          }, {
            value: 'rain3', isSelected: false, name: '3h降水',
            times: forseeTimeData['3-168']
          }, {
            value: 'rain6', isSelected: false, name: '6h降水',
            times: forseeTimeData['6-168']
          }, {
            value: 'rain24', isSelected: false, name: '24h降水',
            times: forseeTimeData['24-168']
          }, {
            value: 'rain48', isSelected: false, name: '48h降水',
            times: forseeTimeData['48-168']
          }, {
            value: 'rain72', isSelected: false, name: '72h降水',
            times: forseeTimeData['72-168']
          }, {
            value: 'rain24stablization', isSelected: false, name: '24h累计降水稳定度',
            times: forseeTimeData['0']
          }, {
            value: 't-td-surf', isSelected: false, name: '地面温度露点差',
            times: forseeTimeData['0-168']
          }
        ],
      }, {
        name: '不稳定层节',
        isSelected: false,
        isToggle: false,
        sub: [{
          value: 'kiki', isSelected: false, name: 'K指数',
          times: forseeTimeData['0-168']
        }, {
          value: 'si', isSelected: false, name: 'SI',
          times: forseeTimeData['0-168']
        }, {
          value: 'cape', isSelected: false, name: 'CAPE',
          times: forseeTimeData['0-168']
        }],
      }],
      SingleStation: [{
        name: '时间序列',
        isSelected: false,
        isToggle: false,
        sub: [{
          value: 'surfparameters', isSelected: false, name: '温压湿雨',
          times: forseeTimeData['0']
        }, {
          value: 'tz-omeg', isSelected: false, name: '垂直速度高度时间剖面',
          times: forseeTimeData['0']
        }, {
          value: 'tz-wind-rhum', isSelected: false, name: '相对湿度垂直剖面',
          times: forseeTimeData['0']
        }, {
          value: 'tz-windzthse', isSelected: false, name: '假相当位问垂直剖面',
          times: forseeTimeData['0']
        }],
      }, {
        name: 'Tlogp',
        isSelected: false,
        sub: [{
          value: 'tlogp', isSelected: false, name: 'tlogp',
          times: forseeTimeData['0-168']
        }],
      }],
      Rainnest: [{
        name: '时间序列',
        isSelected: false,
        isToggle: false,
        sub: [{
          value: 'surfparameters', isSelected: false, name: '温压湿雨',
          times: forseeTimeData['0']
        }, {
          value: 'tzZomeg', isSelected: false, name: '垂直速度高度时间剖面',
          times: forseeTimeData['0']
        }, {
          value: 'tzZwindZrhum', isSelected: false, name: '相对湿度垂直剖面',
          times: forseeTimeData['0']
        }, {
          value: 'tzZwindZthse', isSelected: false, name: '假相当位问垂直剖面',
          times: forseeTimeData['0']
        }],
      }, {
        name: 'Tlogp',
        isSelected: false,
        sub: [{ value: 'tlogp', isSelected: false, name: 'tlogp', times: forseeTimeData['0-168'] }],
      }]
    },
    
    ec: {
      SouthChina: [
        {
          name: '地面要素',
          isSelected: true,
          isToggle: false,
          sub: [{
            value: 'mslp',
            isSelected: true,
            name: '海平面气压',
            times: forseeTimeData['0-240']
          }, {
            value: 'mslp24',
            isSelected: true,
            name: '海平面24h变压',
            times: forseeTimeData['24-240']
          }, {
            value: 't2mm',
            isSelected: true,
            name: '2m气温',
            times: forseeTimeData['0-240']
          }, {
            value: 't2mm24',
            isSelected: true,
            name: '2m气温24h变温',
            times: forseeTimeData['24-240']
          }, {
            value: 't2mm-max',
            isSelected: true,
            name: '2m最高气温',
            times: forseeTimeData['0-216~*12']
          }, {
            value: 't2mm-min', isSelected: true, name: '2m最低气温',  
            times: forseeTimeData['0-216~*12']
          }, {
            value: 't2mm-ave', isSelected: true, name: '2m平均气温',
            times: forseeTimeData['0-216~*12']
          }, {
            value: 'wind10mslp', isSelected: true, name: '10m阵风',
            times: forseeTimeData['0-240']
          }, {
            value: '10gust3', isSelected: true, name: '10m阵风(过去3h)',
            times: forseeTimeData['3-240']
          }, {
            value: '10gust6', isSelected: true, name: '10m阵风(过去6h)',
            times: forseeTimeData['6-240']
          }, {
            value: 'rain3', isSelected: true, name: '3h降水',
            times: forseeTimeData['3-72']
          }, {
            value: 'rain6', isSelected: true, name: '6h降水',
            times: forseeTimeData['6-240']
          }, {
            value: 'rain24', isSelected: true, name: '24h降水',
            times: forseeTimeData['24-240']
          }, {
            value: 'rain48', isSelected: true, name: '48h降水',
            times: forseeTimeData['48-240']
          }, {
            value: 'rain72', isSelected: true, name: '72h降水',
            times: forseeTimeData['72-240']
          }, {
            value: 'rain24stablization', isSelected: true, name: '24h累计降水稳定度',
            times: forseeTimeData['0']
          }, {
            value: 't-td-surf', isSelected: true, name: '地面温度露点差',
            times: forseeTimeData['0-240']
          }],
        }, {
          name: '不稳定层节',
          isSelected: true,
          isToggle: false,
          sub: [{
            value: 'si', isSelected: true, name: 'SI',
            times: forseeTimeData['0-240']
          }, {
            value: 'kiki', isSelected: true, name: 'K指数',
            times: forseeTimeData['0-240']
          }, {
            value: 'cape', isSelected: true, name: 'CAPE',
            times: forseeTimeData['0-240']
          }],
        }, {
          name: '高空要素',
          isSelected: true,
          isToggle: false,
          sub: [{
            value: 'temp24500', isSelected: true, name: '500hPa24h变温',
            times: forseeTimeData['24-240']
          },/* {
            value: 'temp24700', isSelected: true, name: '700hPa24h变温',
            times: forseeTimeData['24-240']
          }, */ {
            value: 'temp24850', isSelected: true, name: '850hPa24h变温',
            times: forseeTimeData['24-240']
          }, {
            value: 'temp850-500', isSelected: true, name: '850-500温度',
            times: forseeTimeData['0-240']
          }, {  
            value: 'temp700-500', isSelected: true, name: '700-500温度',
            times: forseeTimeData['0-240']
          }, {
            value: 'hghtwind500', isSelected: true, name: '500hPa高度(副高)',
            times: forseeTimeData['0-240']
          }, {
            value: 'hght24500', isSelected: true, name: '500hPa高度(变高)',
            times: forseeTimeData['24-240']
          }, {
            value: '500hght-850wind-rain', isSelected: true, name: '500高度+850风+降水',
            times: forseeTimeData['3-240']
          }, {
            value: 'wind200stream200hght200', isSelected: true, name: '200hPa形式',
            times: forseeTimeData['0-240']
          }, {
            value: 'wind500hght500temp500', isSelected: true, name: '500hPa形式',
            times: forseeTimeData['0-240']
          }, {
            value: 'wind700', isSelected: true, name: '700hPa形式',
            times: forseeTimeData['0-240']
          }, {
            value: 'wind850hght500', isSelected: true, name: '850hPa风',
            times: forseeTimeData['0-240']
          }, {
            value: 'wind850', isSelected: true, name: '850hPa风_单要素',
            times: forseeTimeData['0-240']
          }, {
            value: 'wind925', isSelected: true, name: '925hPa风',
            times: forseeTimeData['0-240']
          }],
      },
      {  
        name: '水汽条件',
        isSelected: true,
        isToggle: false,
        sub: [{
          value: 'rhum500', isSelected: true, name: '500hPa相对湿度',
          times: forseeTimeData['0-240']
        }, {
          value: 'rhum700', isSelected: true, name: '700hPa相对湿度',
          times: forseeTimeData['0-240']
        }, {
          value: 'rhum850', isSelected: true, name: '850hPa相对湿度',
          times: forseeTimeData['0-240']
        }, /* {
          value: 'tcdc', isSelected: true, name: '总云量',
          times: forseeTimeData['0-240']
        }, */ {
          value: 'vflux850', isSelected: true, name: '850hPa水汽通量',
          times: forseeTimeData['0-240']
        }, {
          value: 'vflux925', isSelected: true, name: '925hPa水汽通量',
          times: forseeTimeData['0-240']
        }, {
          value: '-td850', isSelected: true, name: '850hPa温度露点差',
          times: forseeTimeData['0-240']
        }]
      }, {
        name: '热动力因子',
        isSelected: true,
        isToggle: false,
        sub: [{
          value: 'wind700jet200', isSelected: true, name: '700hPa风+200hPa急流',
          times: forseeTimeData['0-240']
        }, {
          value: 'windshear', isSelected: true, name: '200-850风切变',
          times: forseeTimeData['0-240']
        }, {
          value: 'thse50-850', isSelected: true, name: '假相当位温',
          times: forseeTimeData['0-240']
        }, {
          value: 'omeg500', isSelected: true, name: '500hPa垂直速度',
          times: forseeTimeData['0-240'],
        }, {
          value: 'omeg700', isSelected: true, name: '700hPa垂直速度',
          times: forseeTimeData['0-240'],
        }, {
          value: 'omeg850', isSelected: true, name: '850hPa垂直速度',
          times: forseeTimeData['0-240'],
        }, {
          value: 'dive200', isSelected: true, name: '200hPa散度',
          times: forseeTimeData['0-240']
        }, {
          value: 'dive700', isSelected: true, name: '700hPa散度',
          times: forseeTimeData['0-240']
        }, {
          value: 'dive850', isSelected: true, name: '850hPa散度',
          times: forseeTimeData['0-240']
        }, {
          value: 'dive925', isSelected: true, name: '925hPa散度',
          times: forseeTimeData['0-240']
        }, {
          value: 'vort500', isSelected: true, name: '500hPa涡度',
          times: forseeTimeData['0-240']
        }, {
          value: '500vad-rain', isSelected: true, name: '500hPa涡度平流+降水',
          times: forseeTimeData['3-240']
        }, {
          value: 'vadv850', isSelected: true, name: '850hPa涡度平流',
          times: forseeTimeData['0-240']
        }, {
          value: 'vadv925', isSelected: true, name: '925hPa涡度平流',
          times: forseeTimeData['0-240']
        }, {
          value: 'tadv500', isSelected: true, name: '500hPa温度平流',
          times: forseeTimeData['0-240']
        }, {
          value: 'tadv850', isSelected: true, name: '850hPa温度平流',
          times: forseeTimeData['0-240']
        }, {
          value: 'tadv925', isSelected: true, name: '925hPa温度平流',
          times: forseeTimeData['0-240']
        },],
      }/* , {
        name: '雷达和能见度',
        isSelected: false,
          isToggle: false,
        sub: [{
          value: 'cref', isSelected: false, name: '组合雷达反射率',
          times: forseeTimeData['0-240']
        }, {
          value: 'dbzr', isSelected: false, name: '3km高度雷达反射率',
          times: forseeTimeData['0-240']
        }, {
          value: 'visi', isSelected: false, name: '能见度',
          times: forseeTimeData['0-240']
        }]
      } */
    ],
    GuangDong: [{
      name: '地面要素',
      isSelected: false,
      isToggle: false,
      sub: [
        {
          value: 'mslp', isSelected: false, name: '海平面气压',
          times: forseeTimeData['0-240']
        }, {
          value: 'mslp24', isSelected: false, name: '海平面24h变压',
          times: forseeTimeData['24-240']
        }, {
          value: 't2mm', isSelected: false, name: '2m气温',
          times: forseeTimeData['0-240']
        }, {
          value: 't2mm24', isSelected: false, name: '2m气温24h变温',
          times: forseeTimeData['24-240']
        }, {
          value: 'wind10m', isSelected: false, name: '10m风',
          times: forseeTimeData['0-240']
        }, {
          value: '10gust3', isSelected: false, name: '10m阵风(过去3h)',
          times: forseeTimeData['3-240']
        }, {
          value: '10gust6', isSelected: false, name: '10m阵风(过去6h)',
          times: forseeTimeData['6-240']
        }, {
          value: 'rain3', isSelected: false, name: '3h降水',
          times: forseeTimeData['3-72']
        }, {
          value: 'rain6', isSelected: false, name: '6h降水',
          times: forseeTimeData['6-240']
        }, {
          value: 'rain24', isSelected: false, name: '24h降水',
          times: forseeTimeData['24-240']
        }, {
          value: 'rain48', isSelected: false, name: '48h降水',
          times: forseeTimeData['48-240']
        }, {
          value: 'rain72', isSelected: false, name: '72h降水',
          times: forseeTimeData['72-240']
        }, {
          value: 'rain24stablization', isSelected: false, name: '24h累计降水稳定度',
          times: forseeTimeData['0']
        }, {
          value: 't-td-surf', isSelected: false, name: '地面温度露点差',
          times: forseeTimeData['0-240']
        }
      ],
    }, {
      name: '不稳定层节',
      isSelected: false,
      isToggle: false,
      sub: [{
        value: 'kiki', isSelected: false, name: 'K指数',
        times: forseeTimeData['0-240']
      }, {
        value: 'si', isSelected: false, name: 'SI',
        times: forseeTimeData['0-240']
      }, {
        value: 'cape', isSelected: false, name: 'CAPE',
        times: forseeTimeData['0-240']
      }],
    }],
    SingleStation: [{
      name: '时间序列',
      isSelected: false,
      isToggle: false,
      sub: [{
        value: 'surfparameters', isSelected: false, name: '温压湿雨',
        times: forseeTimeData['0']
      }, {
        value: 'tz-omeg', isSelected: false, name: '垂直速度高度时间剖面',
        times: forseeTimeData['0']
      }, {
        value: 'tz-wind-rhum', isSelected: false, name: '相对湿度垂直剖面',
        times: forseeTimeData['0']
      }, {
        value: 'tz-windzthse', isSelected: false, name: '假相当位问垂直剖面',
        times: forseeTimeData['0']
      }, {
        value: 'ki-mdpi', isSelected: false, name: 'k指数和潜在下冲对流指数',
        times: forseeTimeData['0']
      }, {
        value: 'iq-swiss', isSelected: false, name: 'swiss指数和整层比湿积分',
        times: forseeTimeData['0']
      }],
    }, {
      name: 'Tlogp',
      isSelected: false,
      sub: [{
        value: 'tlogp', isSelected: false, name: 'tlogp',
        times: forseeTimeData['0-240']
      }],
    }],
    Rainnest: [{
      name: '时间序列',
      isSelected: false,
      isToggle: false,
      sub: [{
        value: 'surfparameters', isSelected: false, name: '温压湿雨',
        times: forseeTimeData['0']
      }, {
        value: 'tzZomeg', isSelected: false, name: '垂直速度高度时间剖面',
        times: forseeTimeData['0']
      }, {
        value: 'tzZwindZrhum', isSelected: false, name: '相对湿度垂直剖面',
        times: forseeTimeData['0']
      }, {
        value: 'tzZwindZthse', isSelected: false, name: '假相当位问垂直剖面',
        times: forseeTimeData['0']
      }, {
        value: 'surfparameters-tp6', isSelected: false, name: '温压湿雨(6h降水)',
        times: forseeTimeData['0']
      }],
    }, {
      name: 'Tlogp',
      isSelected: false,
      sub: [{ value: 'tlogp', isSelected: false, name: 'tlogp', times: forseeTimeData['0-240'] }],
    }]

    },
    g3: {
      'SouthChina': [
        {
          name: '地面要素',
          isSelected: true,
          isToggle: false,
          sub: [
            { isSelected: true, value: 'mslp', name: '海平面气压', times: forseeTimeData['0-24'] },
            { isSelected: true, value: 'temp2m', name: '2米温度', times: forseeTimeData['0-24'] },
            { isSelected: true, value: 'wind10m', name: '10米风', times: forseeTimeData['1-24'] },
            { isSelected: true, value: 'rain1h', name: '1小时累积降雨', times: forseeTimeData['1-24'] },
            { isSelected: true, value: 'rain3h', name: '3小时累积降雨', times: forseeTimeData['3-24'] },
            { isSelected: true, value: 'rain6h', name: '6小时累积降雨', times: forseeTimeData['6-24'] },
            { isSelected: true, value: 'dbzr', name: '雷达回波(3km)', times: forseeTimeData['1-24'] },
          ]
        }, {
          name: '高空要素', 
          isSelected: true,
          isToggle: false,
          sub: [
            { isSelected: true, value: 'wind925hght925', name: '925hPa风+高度', times: forseeTimeData['1-24'] },
            { isSelected: true, value: 'wind850hght500', name: '850hPa风+500hPa高度', times: forseeTimeData['0-24'] },
            { isSelected: true, value: 'wind700hght700', name: '700hPa形式', times: forseeTimeData['1-24'] },
            { isSelected: true, value: 'wind500hght500temp500', name: '500hPa形式', times: forseeTimeData['0-24'] },
            { isSelected: true, value: 'wind200stream200hght200', name: '200hPa形式', times: forseeTimeData['0-24'] },
            { isSelected: true, value: 'temp850-500', name: '850-500温度', times: forseeTimeData['0-24'] },
            { isSelected: true, value: 'temp700-500', name: '700-500温度', times: forseeTimeData['1-24'] },
          ]
        }, {
          name: '水汽条件',
          isSelected: true,
          isToggle: false,
          sub: [
            { isSelected: true, value: 'rhum500', name: '500hPa相对湿度+风', times: forseeTimeData['0-24'] },
            { isSelected: true, value: 'rhum850', name: '850hPa相对湿度+风', times: forseeTimeData['0-24'] },
            { isSelected: true, value: 'rhum925', name: '925hPa相对湿度+风', times: forseeTimeData['0-24'] },
            { isSelected: true, value: 'vflux850', name: '850水汽通量', times: forseeTimeData['0-24'] },
            { isSelected: true, value: 'vflux925', name: '925水汽通量', times: forseeTimeData['0-24'] },
          ]
        }, {
          name: '不稳定层结',
          isSelected: true,
          isToggle: false,
          sub: [
            { isSelected: true, value: 'kiki', name: 'k指数', times: forseeTimeData['0-24'] },
            { isSelected: true, value: 'sweat', name: 'SWAET-威胁指数', times: forseeTimeData['0-24'] },
            { isSelected: true, value: 'tti', name: 'TT指数', times: forseeTimeData['0-24'] },
            { isSelected: true, value: 'epi', name: 'EPI对流不稳定指数', times: forseeTimeData['0-24'] },
          ]
        }
      ],
      'GuangDong': [
        {
          name: '地面要素',  
          isSelected: false,
          isToggle: false,
          sub: [
            { isSelected: false, value: 'mslp', name: '海平面气压', times: forseeTimeData['1-24'] },
            { isSelected: false, value: 'temp2m', name: '2米温度', times: forseeTimeData['0-24'] },
            { isSelected: false, value: 'wind10m', name: '10米风', times: forseeTimeData['1-24'] },
            { isSelected: false, value: 'rain1h', name: '1小时累积降雨', times: forseeTimeData['1-24'] },
            { isSelected: false, value: 'rain3h', name: '3小时累积降雨', times: forseeTimeData['3-24'] },
            { isSelected: false, value: 'rain6h', name: '6小时累积降雨', times: forseeTimeData['6-24'] },
            { isSelected: false, value: 'dbzr', name: '雷达回波(3km)', times: forseeTimeData['1-24'] },
          ]
        }, {
          name: '不稳定层结',
          isSelected: false,
          isToggle: false,
          sub: [
            { isSelected: false, value: 'kiki', name: 'k指数', times: forseeTimeData['0-24'] },
            { isSelected: false, value: 'sweat', name: 'SWAET-威胁指数', times: forseeTimeData['0-24'] },
            { isSelected: false, value: 'tti', name: 'TT指数', times: forseeTimeData['0-24'] },
            { isSelected: false, value: 'epi', name: 'EPI对流不稳定指数', times: forseeTimeData['0-24'] },
          ]
        }
      ],
      SingleStation: [],
      Rainnest: []
    },
    
    fy2: [
      { name: '云顶温度', value: 'ttop', isSelected: true },
      { name: '云顶高度', value: 'ztop', isSelected: true },
      { name: '过冷层厚度', value: 'hsc', isSelected: true },
      { name: '光学厚度', value: 'optn', isSelected: true },
      { name: '有效例子半径', value: 'ref', isSelected: true },
      { name: '云顶高度', value: 'ttop', isSelected: true },
      { name: '液水路径', value: 'lwp', isSelected: true },
      { name: '黑体亮温', value: 'tbb', isSelected: true }
    ],
    g1: [
      { value: 'mslp', name: '海平面气压', isSelected: true  },
      { value: 'temp2m', name: '2米温度', isSelected: true  },
      { value: 'rh2m_wind10m', name: '2米相对湿度', isSelected: true  },
      { value: 'rain12min', name: '12分钟累计降雨', isSelected: true  },
      { value: 'wind10m', name: '10米风', isSelected: true  },
      { value: 'rain1h', name: '1小时累积降雨', isSelected: true  },
      { value: 'cref', name: '组合雷达反射率', isSelected: true  },
    ],
    cpe: [
    {
      name: '云宏现场',
      isSelected: true,
      isToggle: false,
      sub: [
        {
          name: '云带',
          isSelected: true,
          value: 'cband'
        }, {
          name: '垂直累计液态水',
          isSelected: true,
          value: 'vil'
        }, {
          name: '垂直累积过冷水',
          isSelected: true,
          value: 'visl'
        }, {
          name: '云顶温度',
          isSelected: true,
          value: 'cloudtopt'
        }, {
          name: '云顶高度',
          isSelected: true,
          value: 'cloudtoph'
        }, {
          name: '云底高度',
          isSelected: true,
          value: 'cloudboth'
        }, {
          name: '云底温度',
          isSelected: true,
          value: 'cloudbott'
        }, {
          name: '雷达反射率',
          isSelected: true,
          value: 'dbz'
        }, /* {
          name: '雷达组合反射率',
          isSelected: true,
          value: ''
        }, */ {
          name: '相对湿度',
          isSelected: true,
          value: 'rh'
        },
      ]
    }, {
      name: '云微现场',
      isSelected: true,
      isToggle: false,
      sub: [
        {
          name: '总水成物场+风场+温度',
          value: 'rainnc',
          isSelected: true
        }, {
          name: '云水混合比',
          value: 'QCLOUD',
          isSelected: true
        }, {
          name: '雨水混合比',
          value: 'QRAIN',
          isSelected: true
        }, {
          name: '冰晶混合比',
          value: 'QICE',
          isSelected: true
        }, {
          name: '雪混合比',
          value: 'QSNOW',
          isSelected: true
        }, {
          name: '霰混合比',
          value: 'QGRAUP',
          isSelected: true
        }, {
          name: '冰晶数浓度',
          value: 'QNICE',
          isSelected: true
        }, {
          name: '雨滴数浓度',
          value: 'QNRAIN',
          isSelected: true
        }, {
          name: '雪数浓度',
          value: 'QNSNOW',
          isSelected: true
        }, {
          name: '霰数浓度',
          value: 'QNGRAUPEL',
          isSelected: true
        }
      ]
    }, {
      name: '垂直结构',
      isSelected: true,
      isToggle: false,
      sub: [
        {
          name: 'Qc,Ni,T垂直剖面',
          isSelected: true,
          value: 'Qvtc'
        }, {
          name: 'Qs+Qg,Qr,H垂直剖面',
          isSelected: true,
          value: 'Qvtr'
        },
      ]
    }, {
      name: '降水场',
      isSelected: true,
      isToggle: false,
      sub: [
        {
          name: '逐小时降水',
          isSelected: true,
          value: 'rain1'
        }, {
          name: '3小时降水',
          isSelected: true,
          value: 'rain3',
          start: 3
        }, {
          name: '6小时降水',
          isSelected: true,
          value: 'rain6',
          start: 6
        }, {
          name: '12小时降水',
          isSelected: true,
          value: 'rain12',
          start: 12
        }, {
          name: '24小时降水',
          isSelected: true,
          value: 'rain24',
          start: 24
        },
      ]
    }],

    h8: [  /////
      {
        name: '红外灰度图',
        value: ' inf_bw',
        isSelected: true
      },
      {
        name: '红外彩图',
        value:'inf_col',
        isSelected: true
      },
      {
        name: '水汽灰度图',
        value: 'vap_bw',
        isSelected: true
      },
      {
        name: '可见光3通道彩图',
        value: 'vis_3ch',
        isSelected: true
      },
      {
        name: '可见光彩图',
        value: 'vis_col',
        isSelected: true
      },
      {
        name: '可见光灰度图',
        value: 'vis_bw',
        isSelected: true
      },
    ]
  }

  get modifyLiHeight() {
    switch(this.modifyInfo.key) {
      case 'h8':
        return '100px'
      case 'g1':
        return '140px'
      case 'fy2':
        return '130px'
      default:
        return '210px'
    }
  }
  
  created() {
    let endTime = moment()
    let startTime = moment().subtract(1, 'days')
    this.forecastDate = [startTime, endTime]
  }

  @Watch('forecastDate')
  onforecastDateChanged (val: any, oldVal: any) {
    for (let el of this.products) {
      el.startDate = val[0]
      el.endDate = val[1]
    }
  }

  toggleUtcTime(key) {
    this.utcSelected = key
  }
  toggleModify(el) {
    this.modifyInfo = el
    this.modifyPop = true
  }
  startHourChange(e) {
    this.modifyInfo.startHour = e
  }
  endHourChange(e) {
    this.modifyInfo.endHour = e
  }
  startMinuteChange(e) {
    this.modifyInfo.startMinute = e
  }
  endMinuteChange(e) {
    this.modifyInfo.endMinute = e
  }
  startForecastChange(e) {
    this.modifyInfo.startForecast = e
  }
  endForecastChanges(e) {
    this.modifyInfo.endForecast = e
  }

  async downloadServiceGraph() {    //批量下载业务图
    let flag = false
    for (let el of this.products) {
      if (el.productSelected) {
        flag = true
        break
      }
    }
    if (!flag) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '请至少选择一种产品'
      })
      return
    }
    let string = `starttime=${moment(this.forecastDate[0]).format('YYYY-MM-DD 00:00:00')}&endtime=${moment(this.forecastDate[1]).format('YYYY-MM-DD 00:00:00')}`
    for (let el of this.products) {
      if (!el.productSelected) continue
      let key = el.key
      let starttime = moment(el.startDate).format('YYYY-MM-DD ') + el.startHour + ':' + (el.startMinute ? el.startMinute : '00') + ':00'
      let endtime = moment(el.endDate).format('YYYY-MM-DD ') + el.endHour + ':' + (el.endMinute ? el.endMinute : '00') + ':00'
      let forecasts = ''
      if (el.forecasts) {
        forecasts = `&${key}.forecasts=`
        let s = Number(el.startForecast)
        let e = Number(el.endForecast)
        let num = el.forecastsNum
        for (let i = s; i <= e; i += num) {
          forecasts += i + ','
        }
        forecasts = forecasts.slice(0, -1)
      }
      let area = el.areasSelected ? `&${key}.area=${el.areasSelected}` : ''
      let countys = ''
      if (el.areasSelected === 'SingleStation')
        countys = `&${key}.countys=` + el.singleStationCountys.join(',')
      else if (el.areasSelected === 'Rainnest')
      countys = `&${key}.countys=` + el.rainnestCountys.join(',')
      let levs1 = el.levs1 ? `&${key}.levs1=${el.levs1.join(',')}` : ''
      let levs2 = el.levs2 ? `&${key}.levs2=${el.levs2.join(',')}` : ''
      let selProducts = []
      if (key === 'g9'|| key === 'ec'|| key === 'g3') {
        let area = el.areasSelected    
        for (let el of this.productData[key][area]) {
          for (let opt of el.sub) {
            if (opt.isSelected) selProducts.push(opt.value)
          }
        }
      } else if (key === 'g1' || key === 'fy2' || key === 'h8') {
        for (let el of this.productData[key]) {
          if (el.isSelected) selProducts.push(el.value)
        }
      } else if (key === 'cpe') {
        for (let el of this.productData[key]) {
          for (let opt of el.sub) {
            if (opt.isSelected) selProducts.push(opt.value)
          }
        }
      }
      if (!selProducts.length) {
        Vue.prototype['$message']({
          type: 'warning',
          message: '请至少选择一种产品'
        })
        return
      }
      string += `&${key}.starttime=${starttime}&${key}.endtime=${endtime}&${key}.products=${selProducts.join(',')}${forecasts}${area}${countys}${levs1}${levs2}`
    }
    console.log(`http://10.148.16.217:11160/renyin5/conn/images/all?${string}`)
    window.open(`http://10.148.16.217:11160/renyin5/conn/images/all?${string}`)

  } 
  toggleProduct(el) {
    el.productSelected = !el.productSelected
  }

  toggleOpt(subkey, key) {
    for (let item of this.productData[this.modifyInfo.key][this.modifyInfo.areasSelected]) {
      for (let subItem of item.sub) {
        if (subItem.value === subkey)
          subItem.isSelected = true
        else
          subItem.isSelected = false
      }
    }
  }
  toggleItem(item) {
    item.isToggle = !item.isToggle
  }
  selectAllSubItem(item) {
    item.isSelected = !item.isSelected
    for (let el of item.sub) {
      el.isSelected = item.isSelected
    }
  }
  toggleSubItem(subItem, item) {
    subItem.isSelected = !subItem.isSelected
    let flag = true
    for (let el of item.sub) {
      if (!el.isSelected) {
        flag = false
        break
      }
    }
    item.isSelected = flag
  }

  toggleAreaSelected(val) {
    let key = this.modifyInfo.key
    let oldVal = this.modifyInfo.areasSelected
    this.modifyInfo.areasSelected = val
    if (key === 'g9'|| key === 'ec'|| key === 'cpe'|| key === 'g3') {
      for (let el of this.productData[key][val]) {
        el.isSelected = true
        for (let opt of el.sub) {
          opt.isSelected = true
        }
      }
    }
    if (!oldVal) return
    if (key === 'g9'|| key === 'ec'|| key === 'cpe'|| key === 'g3') {
      for (let el of this.productData[key][oldVal]) {
        el.isSelected = false
        for (let opt of el.sub) {
          opt.isSelected = false
        }
      }
    }
  }

}

export const forseeTimeData = {
  '0-168': (() => {
    let arr = []
    for (let i = 0; i <= 168; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '14-168': (() => {
    let arr = []
    for (let i = 14; i <= 168; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '24-168': (() => {
    let arr = []
    for (let i = 24; i <= 168; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '0-144~*12': (() => {
    let arr = []
    for (let i = 0; i <= 144; i += 12) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '3-168': (() => {
    let arr = []
    for (let i = 3; i <= 168; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '6-168': (() => {
    let arr = []
    for (let i = 6; i <= 168; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '48-168': (() => {
    let arr = []
    for (let i = 48; i <= 168; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '0-84': (() => {
    let arr = []
    for (let i = 0; i <= 84; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '72-168': (() => {
    let arr = []
    for (let i = 72; i <= 168; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '0': ['000'],
}