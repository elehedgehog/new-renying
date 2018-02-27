import Vue from 'vue'
import 'element-ui/lib/theme-default/index.css'
import {
  Tooltip,
  Loading,
  DatePicker,
  Message,
  MessageBox,
  pagination,
  Slider,
  Transfer,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Steps,
  Step,
} from 'element-ui'

Vue.use(Loading)
Vue.use(DatePicker)
Vue.use(Tooltip)
Vue.use(pagination)
Vue.use(Slider)
Vue.use(Transfer)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Radio)
Vue.use(RadioGroup)
Vue.use(Steps)
Vue.use(Step)
Vue.prototype['$message'] = Message
Vue.prototype['$confirm'] = MessageBox.confirm