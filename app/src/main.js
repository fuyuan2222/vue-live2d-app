import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 1. Font Awesomeのコアライブラリをインポート
// import { library } from '@fortawesome/fontawesome-svg-core'

// // 2. 使いたいアイコンをインポート
// import { fas } from '@fortawesome/free-solid-svg-icons'
// import { far } from '@fortawesome/free-regular-svg-icons'
// import { fab } from '@fortawesome/free-brands-svg-icons'

// // 3. Vue Font Awesomeコンポーネントをインポート
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// // 4. インポートしたアイコンをライブラリに追加
// library.add(fas, far, fab)

// // 5. アプリケーションインスタンスを一度だけ作成
// const app = createApp(App)

// // 6. グローバルコンポーネントとして登録
// app.component('font-awesome-icon', FontAwesomeIcon)

createApp(App).mount('#app')
