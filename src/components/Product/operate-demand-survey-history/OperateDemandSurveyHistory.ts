import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './OperateDemandSurveyHistory.html?style=./OperateDemandSurveyHistory.scss'
import OperateHistory from '../../commons/operation-history/OperateHistory'

@WithRender
@Component
export default class OperateDemandSurveyHistory extends Vue {
  @Getter('systemStore/articleViewHolder_global') articleViewHolder_global
  @Action('systemStore/changeArticleViewHolder_global') changeArticleViewHolder_global

  minify: boolean = false

  word='01'
  OperateHistory=OperateHistory
}
