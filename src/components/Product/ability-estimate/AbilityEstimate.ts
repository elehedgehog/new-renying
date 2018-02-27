import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './AbilityEstimate.html?style=./AbilityEstimate.scss'
import * as CONFIG from '../../../config/productId'
import { examinationClient } from '../../../util/clientHelper'

@WithRender
@Component
export default class AbilityEstimate extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  @Getter('systemStore/userInfo_global')  userInfo_global
  productId: string = CONFIG.abilityEstimate
  questionList: any = []
  listNumber: number = 0      // 题型个数
  pageSize: number = 6
  currentPage: number = 1       // 当前页数
  questionType: any = {
    '0': { text: '填空题', value: '', number: ''}, 
    '1': { text: '判断题', value: '', number: ''}, 
    '2': { text: '单选题', value: '', number: ''}, 
    '3': { text: '多选题', value: '', number: ''},
    '4': { text: '简答题', value: '', number: ''},
  }
  questionTypeSelected: string = ''
  questionSelectedList : any = {    //选中的题目列表
    0: {}, 1: {}, 2: {}, 3: {}, 4:{}
  }
  downloadSelectedList: any = []      // 生成试卷题目列表
  // allScores: number = 0
  uploadExamPoppup: boolean = false
  createExamPoppup: boolean = false
  selectQue: string = '0'      //选择题型

  selectOptions = ['A', 'B', 'C', 'D'];   // 多选题选项
  // checkedOpt: string = null               //选中的选项
  checkedOpt: any  = []
  selectOpt: string = ''                   //单选
  judge: string = ''                    //判断选项
  answerA: string = ''                //ABCD选项内容
  answerB: string = ''
  answerC: string = ''
  answerD: string = ''
  textarea: string = ''
  num: number = 1           //填空框个数
  answers: any = [{ val: '' }]
  textareaAnswer: string = ''         //多选答案

  btnPoppup: boolean = false           //提交试卷按钮切换
  downloadPoppup: boolean = false         //下载试题弹窗
  examName: string = ''      //试卷名称
  numList: string[] = ['一', '二', '三', '四', '五']
  downloadUrl: string = ''
  downloadAnswerUrl: string = ''
  mounted() {
    this.getQuestion()
  }
  @Watch('questionTypeSelected')
  onquestionTypeSelectedChanged (val: any, oldVal: any) {
    this.currentChange(1)
  }
  async getQuestion() {   //获取试题
    let data = await examinationClient.getQuestion(this.currentPage, this.pageSize, this.questionTypeSelected)
    if(!data){
      Vue.prototype['$message']({
        type: 'error',
        message: '获取试题失败'
      })
      return
    }
    for(let item of data.list) {
      let bool = this.questionSelectedList[item.questionType][item.id] ? true : false
      this.$set(item, 'questionSelected', bool)   //给item对象添加questionSelected属性 用于判断选中状态
    }
    this.questionList = data.list
    this.listNumber = data.total
  }
  currentChange(e){
    this.currentPage = e
    this.getQuestion()
  }

  // toggleQuestion(item) {     //选择题目
  //   item.questionSelected = !item.questionSelected
  //   if(item.questionSelected)
  //     this.questionSelectedList[item.questionType][item.id] = item
  //   else
  //     delete this.questionSelectedList[item.questionType][item.id]
  //   this.calculateScores()
  // }

  //computed
  get allScores() {
    let score = 0
    for (let i in this.questionType) {       //总分计算
      let item = this.questionType[i]
      if (!item.value || !item.number) continue
      score += Number(item.value)* Number(item.number)
    }
    return score
  }


  async creatExams() {     //生成试卷
      this.createExamPoppup = !this.createExamPoppup
  }
  async creatExam() {     //生成试卷接口
    if(this.allScores === 0){
      Vue.prototype['$message']({
        type: 'warning',
        message: '请选择试题'
      })
      return
    }
    let list = []
    for(let item in this.questionSelectedList){
      for(let el in this.questionSelectedList[item]){
        list.push(this.questionSelectedList[item][el].id + '')
      }
    }
    let param: any = {
      userId:  this.userInfo_global.id + '',
      examName: this.examName,
      // score_tk: this.questionType[0].value,
      // score_pd: this.questionType[1].value,
      // score_sc: this.questionType[2].value,
      // score_mc: this.questionType[3].value,
      // score_jd: this.questionType[4].value,
      // count_tk: this.questionType[0].number,
      // count_pd: this.questionType[1].number,
      // count_sc: this.questionType[2].number,
      // count_mc: this.questionType[3].number,
      // count_jd: this.questionType[4].number,
      // list
    }
    if (this.questionType[0].value && this.questionType[0].number) {
      param.score_tk = this.questionType[0].value
      param.count_tk = this.questionType[0].number
    }
    if (this.questionType[1].value && this.questionType[1].number) {
      param.score_pd = this.questionType[1].value
      param.count_pd = this.questionType[1].number
    }
    if (this.questionType[2].value && this.questionType[2].number) {
      param.score_sc = this.questionType[2].value
      param.count_sc = this.questionType[2].number
    }
    if (this.questionType[3].value && this.questionType[3].number) {
      param.score_mc = this.questionType[3].value
      param.count_mc = this.questionType[3].number
    }
    if (this.questionType[4].value && this.questionType[4].number) {
      param.score_jd = this.questionType[4].value
      param.count_jd = this.questionType[4].number
    }
    let data = await examinationClient.creatExam(param)
    if(!data){
      Vue.prototype['$message']({
        type: 'warning',
        message: '生成试卷失败'
      })
      return
    } else {
      this.downloadUrl = 'http://10.148.16.217:11160/renyin5/exam' + data.examUrl
      this.downloadAnswerUrl = 'http://10.148.16.217:11160/renyin5/exam' + data.answerUrl
      this.downloadSelectedList = []
      for (let i in this.questionSelectedList) {
        let opt = this.questionSelectedList[i]
        if (Object.keys(opt).length) this.downloadSelectedList.push(i)
      }
      // this.downloadPoppup = true
    }
    
  }

  uploadExam() {    //上传试题按钮
    this.uploadExamPoppup = !this.uploadExamPoppup
  }

  clearQuestion() {        //清空试题填写框
    this.examName = ''
    this.textarea= ''
    this.judge = ''
    this.answerA = ''
    this.answerB = ''
    this.answerC = ''
    this.answerD = ''
    this.selectOpt = ''
    this.checkedOpt = []
    this.textareaAnswer = ''
  }
  async uploadQuestion() {    //上传试题
    if(!this.textarea){
      Vue.prototype['$message']({
        type: 'warning',
        message: '题目不得为空'
      })
      return
    }
    let textarea = this.textarea
    let questionKey
    if (this.selectQue === '0') {
      let arr = []
      for (let el of this.answers) {
        arr.push(el.val)
      }
      questionKey = arr.join('$')
    } else if (this.selectQue === '1') {
      questionKey = this.judge
    } else if (this.selectQue === '2') {
      questionKey = this.selectOpt
    } else if (this.selectQue === '3') {
      questionKey = this.checkedOpt.join('$')
    } else if (this.selectQue === '4') {
      questionKey = this.textareaAnswer
    }
    let param = `list[0].subject=1&list[0].questionType=${this.selectQue}&list[0].questionContent=${textarea}&list[0].questionScore=0&list[0].questionKey=${questionKey}&list[0].inOrder=true`
    let data = await examinationClient.uploadQuestion(param)
    if(!data){
      Vue.prototype['$message']({
        type: 'error',
        message: '上传失败'
      })
    } else {
      Vue.prototype['$message']({
        type: 'success',
        message: '上传成功'
      })
      this.clearQuestion()
    }
  }
  addAnswerBorder(){        //添加填空框
    this.answers.push({ val: '' })
  }
  deleteAnswerBorder(index){    //删除填空框
    this.answers.splice(index,1)
  }
  clearScore() {    // 清空输入分数 并关闭分数窗口
    this.examName = ''
    for (let i in this.questionType) {
      this.questionType[i].value = ''
      this.questionType[i].number = ''
    }
    this.createExamPoppup = false
  }

  confirmScore(){                //分数框填写确认键
    if(!this.examName) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '试卷名不得为空'
      })
      return
    }
    let flag = false
    for (let i in this.questionType) {       //总分计算
      let item = this.questionType[i]
      if (item.value && item.number) {
        flag = true
        break
      }
    }
    if (!flag) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '请至少选择一种考试题型并填写题目数量与题目分数'
      })
      return
    }
    this.createExamPoppup = false
    this.btnPoppup = true
    this.creatExam()
    this.clearScore()

    window.open(this.downloadUrl)  //下载
    window.open(this.downloadAnswerUrl)
  }

  // downloadExam() {             //下载试卷按钮
  //   this.downloadPoppup = true

  // }
  dowloadQuestionBtn() {  //下载按钮
    window.open(this.downloadUrl)
    window.open(this.downloadAnswerUrl)
  }
  //取消按钮
  cancelBtn(){
    this.btnPoppup = false
    this.examName = ''
    for (let i in this.questionType) {
      this.questionType[i].value = ''
    }

  }
  closeDownloadPoppup() {
    // this.allScores = 0
    this.downloadPoppup=false
    this.cancelBtn()
  }
}