import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './OperateWarningAirReportHistory.html?style=./OperateWarningAirReportHistory.scss'
import * as moment from 'moment'
import * as CONFIG from '../../../config/productId'
import axios from 'axios'
import OperateHistory from '../../commons/operation-history/OperateHistory'

@WithRender
@Component
export default class OperateWarningAirReportHistory extends Vue {
  @Getter('systemStore/articleViewHolder_global') articleViewHolder_global
  @Action('systemStore/changeArticleViewHolder_global') changeArticleViewHolder_global

  minify: boolean = false

  word='31'
  OperateHistory=OperateHistory
}
