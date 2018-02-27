import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './ProductEntry.html?style=./ProductEntry.scss'
import * as CONFIG from '../../config/productId'

import OperateDemandAnalysisPublish from '../Product/operate-demand-analysis-publish/OperateDemandAnalysisPublish'
import OperateDemandAnalysisHistory from '../Product/operate-demand-analysis-history/OperateDemandAnalysisHistory'
import OperateDemandSurveyPublish from '../Product/operate-demand-survey-publish/OperateDemandSurveyPublish'
import OperateDemandSurveyHistory from '../Product/operate-demand-survey-history/OperateDemandSurveyHistory'
import OperateAirPlanPublish from '../Product/operate-air-plan-publish/OperateAirPlanPublish'
import OperateAirPlanHistory from '../Product/operate-air-plan-history/OperateAirPlanHistory'
import OperateEffectEvaluatingPublish from '../Product/operate-effect-evaluating-publish/OperateEffectEvaluatingPublish'
import OperateEffectEvaluatingHistory from '../Product/operate-effect-evaluating-history/OperateEffectEvaluatingHistory'
import OperateGroundPlanPublish from '../Product/operate-groud-plan-publish/OperateGroundPlanPublish'
import OperateGroundPlanHistory from '../Product/operate-groud-plan-history/OperateGroundPlanHistory'
import OperatePlanPublish from '../Product/operate-plan-publish/OperatePlanPublish'
import OperatePlanHistory from '../Product/operate-plan-history/OperatePlanHistory'
import OperatePotentialPublish from '../Product/operate-potential-publish/OperatePotentialPublish'
import OperatePotentialHistory from '../Product/operate-potential-histoty/OperatePotentialHistory'
import OperateWarningAirReportPublish from '../Product/operate-Warning-air-report-publish/OperateWarningAirReportPublish'
import OperateWarningAirReportHistory from '../Product/operate-Warning-air-report-history/OperateWarningAirReportHistory'
import OperateWarningGroundReportPublish from '../Product/operate-Warning-ground-report-publish/OperateWarningGroundReportPublish'
import OperateWarningGroundReportHistory from '../Product/operate-Warning-ground-report-history/OperateWarningGroundReportHistory'

import RepoMonitor from '../Product/repo-monitor/RepoMonitor'
import SunstrokeIndex from '../Product/sunstroke-index/SunstrokeIndex'
import HumanComfort from '../Product/human-comfort/HumanComfort'
import AirDetect from '../Product/air-detect/AirDetect'
import EnvironmentPublic from '../Product/environment-public/EnvironmentPublic'
import EnvironmentForecast from '../Product/environment-forecast/EnvironmentForecast'
import WindRadar from '../Product/wind-radar/WindRadar'
import localCloud from '../Product/local-cloud/LocalCloud'
import shortForecast from '../Product/short-forecast/ShortForecast'
import cityShortForecast from '../Product/city-short-forecast/CityShortForecast'
import MicradiationPopup from '../Product/micradiation-popup/MicradiationPopup'
import ActualproductPopup from '../Product/actualproduct-popup/ActualproductPopup'
import EcwmfInter from '../Product/ecwmf-inter/EcwmfInter'
import SunflowerInfrared from '../Product/sunflower-infrared/SunflowerInfrared'
import reservoirLevel from '../Product/reservoir-level/ReservoirLevel'
import riverLevel from '../Product/river-level/RiverLevel'
import forestFire from '../Product/forest-fire/ForestFire'
import PhoneLive from '../Product/phone-live/PhoneLive'
import dryCondition from '../Product/dry-condition/DryCondition' 
import grapes1km from '../Product/grapes-1km/Grapes1km'
import grapes3km from '../Product/grapes-3km/Grapes3km'
import weatherForecast from '../Product/weather-forecast/WeatherForecast'
import agricultureAnalysis from '../Product/agricultrue-analysis/AgricultureAnalysis'
import SatelliteProduct from '../Product/satellite-product/SatelliteProduct'
import GrapesMode from '../Product/grapes-mode/GrapesMode'
import SatelliteCloud from '../Product/satelite-cloud/SateliteCloud'
import PersonalManagement from '../Product/personal-management/PersonalManagement'
import ShortRadar from '../Product/short-radar/ShortRadar'
import SatelliteInverseCloud from '../Product/satellite-product/SatelliteProduct'
import midLongForecast from '../Product/mid-long-forecast/MidLongForecast'
import AirplaneCommand from '../Product/airplane-command/AirplaneCommand'
import typh from '../Product/typh/Typh'
import MessageDispatch from '../Product/message-dispatch/MessageDispatch'
import JobManagement from '../Product/job-management/JobManagement'
import MountainFlood from '../Product/MountainFlood/MountainFlood'
import AbilityEstimate from '../Product/ability-estimate/AbilityEstimate'
import DisasterManage from '../Product/disaster-manage/DisasterManage'
import DisasterManageImg from '../Product/disaster-manage-img/DisasterManageImg'
import AmmunitionInternet from '../Product/ammunition-internet/AmmunitionInternet'
import ConditionAudit from '../Product/condition-audit/ConditionAudit'
import FileManagement from '../Product/file-management/FileManagement'
import AirspaceMonitoring from '../Product/airspace-monitoring/AirspaceMonitoring'
import AircraftCommand from '../Product/aircraft-command/AircraftCommand'
import GroundControl from '../Product/ground-control/GroundControl'
import PhoneLiveMonitor from '../Product/phoneLive-monitor/PhoneLiveMonitor'
import GroundMsgCollection from '../Product/groundMsg-collection/GroundMsgCollection'
import AirQuality from '../Product/air-quality/AirQuality'
import OrderDispatch from '../Product/order-dispatch/OrderDispatch'
import GroundTarget from '../Product/ground-target/GroundTarget'
import HistoryReturn from '../Product/history-return/HistoryReturn'
import EcmwfRain from '../Product/ecmwf-rain/EcmwfRain'
import GridRainfall from '../Product/grid-rainfall/GridRainfall'
@WithRender
@Component
export default class ProductEntry extends Vue {
  @Getter('systemStore/articleViewHolder_global') articleViewHolder_global
  @Getter('systemStore/productViewHolder_global') productViewHolder_global
  @Getter('systemStore/isDisasterManageImg_global') isDisasterManageImg_global

  humanComfortView = null
  mountainFloodView = null
  environmentForecastView = null
  airDetectView = null
  articleView = null
  windRadarView = null
  localCloudView = null
  shortForecastView = null
  micradiationView = null
  actualproductView = null
  ecwmfInterView = null
  sunflowerView = null
  reservoirLevelView = null
  riverLevelView = null
  forestFireView = null
  dryConditionView = null
  grapes1kmView = null
  grapes3kmView = null
  weatherForecastView = null
  agricultureAnalysisView = null
  satelliteProductView = null
  grapesModeView = null
  satelliteCloudView = null
  personalManagementView = null
  shortRadarView = null
  satelliteInverseCloudView = null
  midLongForecastView = null
  airplaneCommandView = null
  cityShortForecastView = null
  typhView = null
  messageDispatchView = null
  jobManagementView = null
  abilityEstimateView = null
  environmentPublicView = null
  sunstrokeIndexView = null
  disasterManageView = null
  disasterImgView = null
  ammunitionInternetView = null
  phoneLiveView = null
  repoMonitorView = null
  
  conditionAuditView = null           
  fileManagementView = null
  airspaceMonitoringView = null
  aircraftCommandView = null
  groundControlView = null
  phoneLiveMonitorView = null
  groundMsgCollectionView = null
  airQualityView = null
  orderDispatchView = null
  groundTargetView = null
  historyReturnView = null
  ecmwfRainView = null
  gridRainfallView = null
  operateDemandAnalysisPublishView = null
  operateDemandAnalysisHistoryView = null
  operateDemandSurveyPublishView = null
  operateDemandSurveyHistoryView = null
  operateAirPlanPublishView = null
  operateAirPlanHistoryView = null
  operateEffectEvaluatingPublishView = null
  operateEffectEvaluatingHistoryView = null
  operateGroundPlanPublishView = null
  operateGroundPlanHistoryView = null
  operatePlanPublishView = null
  operatePlanHistoryView = null
  operatePotentialPublishView = null
  operatePotentialHistoryView = null
  operateWarningAirReportPublishView = null
  operateWarningAirReportHistoryView = null
  operateWarningGroundReportPublishView = null
  operateWarningGroundReportHistoryView = null

  @Watch('articleViewHolder_global')
  onarticleViewHolder_globalChanged(val: any, oldVal: any): void {
    this.operateDemandAnalysisPublishView = val.id === CONFIG.operateDemandAnalysis ?
      (val.type === 'create' ? OperateDemandAnalysisPublish : null) : null
    this.operateDemandAnalysisHistoryView = val.id === CONFIG.operateDemandAnalysis ?
      (val.type === 'history' ? OperateDemandAnalysisHistory : null) : null

    this.operateDemandSurveyPublishView = val.id === CONFIG.operateDemandSurvey ?
      (val.type === 'create' ? OperateDemandSurveyPublish : null) : null
    this.operateDemandSurveyHistoryView = val.id === CONFIG.operateDemandSurvey ?
      (val.type === 'history' ? OperateDemandSurveyHistory : null) : null

    this.operateAirPlanPublishView = val.id === CONFIG.operateAirPlan ?
      (val.type === 'create' ? OperateAirPlanPublish : null) : null
    this.operateAirPlanHistoryView = val.id === CONFIG.operateAirPlan ?
      (val.type === 'history' ? OperateAirPlanHistory : null) : null
    this.operateEffectEvaluatingPublishView = val.id === CONFIG.operateEffectEvaluating ?
      (val.type === 'create' ? OperateEffectEvaluatingPublish : null) : null
    this.operateEffectEvaluatingHistoryView = val.id === CONFIG.operateEffectEvaluating ?
      (val.type === 'history' ? OperateEffectEvaluatingHistory : null) : null
    this.operateGroundPlanPublishView = val.id === CONFIG.operateGroundPlan ?
      (val.type === 'create' ? OperateGroundPlanPublish : null) : null
    this.operateGroundPlanHistoryView = val.id === CONFIG.operateGroundPlan ?
      (val.type === 'history' ? OperateGroundPlanHistory : null) : null
    this.operatePlanPublishView = val.id === CONFIG.operatePlan ?
      (val.type === 'create' ? OperatePlanPublish : null) : null
    this.operatePlanHistoryView = val.id === CONFIG.operatePlan ?
      (val.type === 'history' ? OperatePlanHistory : null) : null
    this.operatePotentialPublishView = val.id === CONFIG.operatePotential ?
      (val.type === 'create' ? OperatePotentialPublish : null) : null
    this.operatePotentialHistoryView = val.id === CONFIG.operatePotential ?
      (val.type === 'history' ? OperatePotentialHistory : null) : null
    this.operateWarningAirReportPublishView = val.id === CONFIG.operateWarningAirReport ?
      (val.type === 'create' ? OperateWarningAirReportPublish : null) : null
    this.operateWarningAirReportHistoryView = val.id === CONFIG.operateWarningAirReport ?
      (val.type === 'history' ? OperateWarningAirReportHistory : null) : null
    this.operateWarningGroundReportPublishView = val.id === CONFIG.operateWarningGroundReport ?
      (val.type === 'create' ? OperateWarningGroundReportPublish : null) : null
    this.operateWarningGroundReportHistoryView = val.id === CONFIG.operateWarningGroundReport ?
      (val.type === 'history' ? OperateWarningGroundReportHistory : null) : null
  }

  @Watch('productViewHolder_global')
  onproductViewHolder_globalChanged(val: any, oldVal: any): void {
    this.localCloudView = val[CONFIG.localCloud] ? localCloud : null
    this.shortForecastView = val[CONFIG.shortForecast] ? shortForecast : null
    this.micradiationView = val[CONFIG.micradiation] ? MicradiationPopup : null
    this.actualproductView = val[CONFIG.actualproduct] ? ActualproductPopup : null
    this.ecwmfInterView = val[CONFIG.ecwmfInter] ? EcwmfInter : null
    this.sunflowerView = val[CONFIG.sunflower] ? SunflowerInfrared : null
    this.reservoirLevelView = val[CONFIG.reservoirLevel] ? reservoirLevel : null
    this.riverLevelView = val[CONFIG.riverLevel] ? riverLevel : null
    this.forestFireView = val[CONFIG.forestFire] ? forestFire : null
    this.dryConditionView = val[CONFIG.dryCondition] ? dryCondition : null
    this.grapes1kmView = val[CONFIG.grapes1km] ? grapes1km : null
    this.windRadarView = val[CONFIG.windRadar] ? WindRadar : null
    this.grapes3kmView = val[CONFIG.grapes3km] ? grapes3km : null
    this.weatherForecastView = val[CONFIG.weatherForecast] ? weatherForecast : null
    this.agricultureAnalysisView = val[CONFIG.agricultureAnalysis] ? agricultureAnalysis : null
    this.grapesModeView = val[CONFIG.grapesMode] ? GrapesMode : null
    this.satelliteCloudView = val[CONFIG.satelliteCloud] ? SatelliteCloud : null
    this.personalManagementView = val[CONFIG.personalManagement] ? PersonalManagement : null
    this.shortRadarView = val[CONFIG.shortRadar] ? ShortRadar : null
    this.satelliteInverseCloudView = val[CONFIG.satelliteProduct] ? SatelliteInverseCloud : null
    this.midLongForecastView = val[CONFIG.midLongForecast] ? midLongForecast : null
    this.airplaneCommandView = val[CONFIG.airplaneCommand] ? AirplaneCommand : null
    this.cityShortForecastView = val[CONFIG.cityShortForecast] ? cityShortForecast : null
    this.typhView = val[CONFIG.typh] ? typh : null
    this.messageDispatchView = val[CONFIG.messageDispatch] ? MessageDispatch : null
    this.airDetectView = val[CONFIG.airDetect] ? AirDetect : null
    this.jobManagementView = val[CONFIG.jobManagement] ? JobManagement : null
    this.mountainFloodView = val[CONFIG.mountainFlood] ? MountainFlood : null
    this.abilityEstimateView = val[CONFIG.abilityEstimate] ? AbilityEstimate : null
    this.environmentPublicView = val[CONFIG.environmentPublic] ? EnvironmentPublic : null
    this.environmentForecastView = val[CONFIG.environmentForecast] ? EnvironmentForecast : null
    this.humanComfortView = val[CONFIG.HumanComfort] ? HumanComfort : null
    this.sunstrokeIndexView = val[CONFIG.SunstrokeIndex] ? SunstrokeIndex : null
    this.disasterManageView = val[CONFIG.disasterManage] ? DisasterManage : null
    this.ammunitionInternetView = val[CONFIG.ammunitionInternet] ? AmmunitionInternet : null
    this.phoneLiveView = val[CONFIG.phoneLivePanel] ? PhoneLive : null
    this.conditionAuditView = val[CONFIG.conditionAudit] ? ConditionAudit : null
    this.fileManagementView = val[CONFIG.fileManagement] ? FileManagement : null
    this.airspaceMonitoringView = val[CONFIG.airspaceMonitoring] ? AirspaceMonitoring : null
    this.aircraftCommandView = val[CONFIG.aircraftCommand] ? AircraftCommand : null
    this.groundControlView = val[CONFIG.groundControl] ? GroundControl : null
    this.phoneLiveMonitorView = val[CONFIG.phoneLiveMonitor] ? PhoneLiveMonitor : null
    this.groundMsgCollectionView = val[CONFIG.groundMsgCollection] ? GroundMsgCollection : null
    this.repoMonitorView = val[CONFIG.repoMonitor] ? RepoMonitor : null
    this.airQualityView = val[CONFIG.airQuality] ? AirQuality : null
    this.orderDispatchView = val[CONFIG.orderDispatch] ? OrderDispatch : null
    this.groundTargetView = val[CONFIG.groundTarget] ? GroundTarget : null
    this.historyReturnView = val[CONFIG.historyReturn] ? HistoryReturn : null
    // this.ecmwfRainView = val[CONFIG.EcmwfRain] ? EcmwfRain : null
    this.ecmwfRainView = val[CONFIG.ecmwfRain] ? EcmwfRain : null
    this.gridRainfallView = val[CONFIG.gridRainfall] ? GridRainfall : null
  }
  @Watch('isDisasterManageImg_global')
  onisDisasterManageImg_globalChanged(val: any, oldVal: any) {
    this.disasterImgView = this.disasterImgView ? null : DisasterManageImg
  }
}