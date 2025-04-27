import './assets/main.css'
import './assets/css/variables.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import App from './App.vue'

// FontAwesome setup
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'

// Custom directives
import { vDoubleTap } from './components/habits/doubleTap'

library.add(fas)

const app = createApp(App)

// Register components
app.component('font-awesome-icon', FontAwesomeIcon)

// Register directives
app.directive('double-tap', vDoubleTap)

app.use(createPinia())
app.use(ElementPlus)
app.use(router)

app.mount('#app')
