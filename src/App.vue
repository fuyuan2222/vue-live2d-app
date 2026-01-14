<template>
  <div class="home">
    <Navigation
      class="side-nav"
      :active-tab="activeTab"
      :unread-count="unreadCount"
      @change-tab="activeTab = $event"
    />

    <main class="main-content">
      <header v-if="activeTab !== 'tasks'" class="view-header"></header>

      <TodayTasksView v-if="activeTab === 'tasks'" />
      
      <AllTasksView v-else-if="activeTab === 'all-tasks'" />
      
      <CharacterView
        v-else-if="activeTab === 'character'"
        :personality="characterPersonality"
        :front-hairstyle="characterFrontHairstyle"
        :back-hairstyle="characterBackHairstyle"
        :eyes="characterEyes"
        :startup-line="startupLineText"
        :show-startup-line="showStartupLine"
        @finish-startup-line="showStartupLine = false"
      />

      <CategoriesView v-else-if="activeTab === 'categories'" />
      
      <NotificationsView v-else-if="activeTab === 'notifications'" />
    </main>

    <Navigation
      class="bottom-nav"
      :active-tab="activeTab"
      :unread-count="unreadCount"
      @change-tab="activeTab = $event"
    />
  </div>
</template>

<script setup>
import './assets/global.css'
import { ref, watch, onMounted, onUnmounted, provide, computed } from 'vue'
import TodayTasksView from './components/TodayTasksView.vue'
import AllTasksView from './components/AllTasksView.vue'
import CharacterView from './components/CharacterView.vue'
import CategoriesView from './components/CategoriesView.vue'
import NotificationsView from './components/NotificationsView.vue'
import Navigation from './components/common/Navigation.vue'

// --------------------
// 基本データ
// --------------------
const tasks = ref([])
// ★変更: 初期値から「未分類」を削除しました
const categories = ref(['仕事', '勉強', '趣味'])
const notifications = ref([])
const activeTab = ref('tasks')

// --------------------
// キャラクター設定
// --------------------
const characterPersonality = ref('元気系')
const characterFrontHairstyle = ref('ぱっつん')
const characterBackHairstyle = ref('サイドテール')
const characterEyes = ref('丸目')
const characterOutfit = ref('元気カジュアル系')
const characterAccessory = ref('なし')

// --------------------
// 起動演出
// --------------------
const showStartupLine = ref(false)
const startupLineText = ref('')

const STARTUP_LINES = {
  元気系: ['おはよー！今日も一緒にがんばろ！', 'よーし！今日もタスク片付けよっ！'],
  クール系: ['……今日の予定、確認しよう。', '無理せず、淡々といこう。'],
  癒し系: ['おはよう〜。ゆっくり進めよっか。', '今日もマイペースでいこうね。']
}

const pickStartupLine = () => {
  const lines = STARTUP_LINES[characterPersonality.value] || ['今日もよろしくね。']
  return lines[Math.floor(Math.random() * lines.length)]
}

// --------------------
// 通知チェックロジック
// --------------------
const monitorInterval = ref(null)

const startMonitor = () => {
  monitorInterval.value = setInterval(() => {
    const now = Date.now()
    const d = new Date()
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    tasks.value.forEach(task => {
      if (task.done) return 

      if (task.dueDate === today && !task.dateNotified) {
        addNotification(`📅 本日締切: ${task.text}`, task.id)
        task.dateNotified = true
      }

      if (task.reminderTimes && task.reminderTimes.length > 0) {
        if (!task.notifiedReminders) task.notifiedReminders = []

        task.reminderTimes.forEach(timeStr => {
          const reminderTs = new Date(timeStr).getTime()
          if (reminderTs <= now && !task.notifiedReminders.includes(timeStr)) {
            const timeDisplay = new Date(timeStr).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
            addNotification(`⏰ ${timeDisplay} - ${task.text} の時間です！`, task.id)
            task.notifiedReminders.push(timeStr)
          }
        })
      }
    })
  }, 10000)
}

const stopMonitor = () => {
  if (monitorInterval.value) clearInterval(monitorInterval.value)
}

// --------------------
// データ操作メソッド
// --------------------
const addTask = (task) => {
  tasks.value.push({
    ...task,
    id: Date.now(),
    done: false,
    dateNotified: false,
    reminderTimes: task.reminderTimes || [], 
    notifiedReminders: [] 
  })
}

const removeTask = (index) => {
  if (tasks.value[index]) {
    tasks.value.splice(index, 1)
  }
}

const updateTask = (updatedTask) => {
  const index = tasks.value.findIndex(t => t.id === updatedTask.id)
  if (index !== -1) {
    tasks.value[index] = { ...updatedTask }
  }
}

const addCategory = (categoryName) => {
  if (categoryName.trim() && !categories.value.includes(categoryName.trim())) {
    categories.value.push(categoryName.trim())
  }
}

const removeCategory = (categoryToRemove) => {
  if (!confirm(`カテゴリ「${categoryToRemove}」を削除しますか？`)) return
  
  categories.value = categories.value.filter(c => c !== categoryToRemove)
  
  // ★変更: カテゴリ削除時の移動先を「未分類」ではなく「リストの先頭（例：仕事）」に変更
  // リストが空になることは稀ですが、万が一の場合は空文字や'その他'などを入れます
  const fallbackCategory = categories.value[0] || 'その他'
  
  tasks.value.forEach(task => {
    if (task.category === categoryToRemove) task.category = fallbackCategory
  })
}

const addNotification = (message, taskId = null) => {
  notifications.value.unshift({
    id: Date.now(),
    message,
    read: false,
    timestamp: Date.now(),
    taskId
  })
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

// --------------------
// ライフサイクル
// --------------------
onMounted(() => {
  const today = new Date().toISOString().slice(0, 10)
  const lastLaunchDate = localStorage.getItem('lastLaunchDate')

  if (lastLaunchDate !== today) {
    startupLineText.value = pickStartupLine()
    showStartupLine.value = true
    localStorage.setItem('lastLaunchDate', today)
  }

  // データ復元
  const savedTasks = localStorage.getItem('tasks')
  if (savedTasks) tasks.value = JSON.parse(savedTasks)

  const savedCategories = localStorage.getItem('categories')
  if (savedCategories) {
    categories.value = JSON.parse(savedCategories)
  } else {
    // 初回起動時などのデフォルト設定（未分類なし）
    categories.value = ['仕事', '勉強', '趣味']
  }

  const savedNotifications = localStorage.getItem('notifications')
  if (savedNotifications) {
    notifications.value = JSON.parse(savedNotifications)
  }

  const savedCharacter = localStorage.getItem('character')
  if (savedCharacter) {
    const c = JSON.parse(savedCharacter)
    characterPersonality.value = c.personality || '元気系'
    characterFrontHairstyle.value = c.frontHairstyle || 'ぱっつん'
    characterBackHairstyle.value = c.backHairstyle || 'サイドテール'
    characterEyes.value = c.eyes || '丸目'
    characterOutfit.value = c.outfit || '元気カジュアル系'
    characterAccessory.value = c.accessory || 'なし'
  }

  startMonitor()
})

onUnmounted(() => {
  stopMonitor()
})

// --------------------
// 保存・計算
// --------------------
watch(tasks, (val) => {
  localStorage.setItem('tasks', JSON.stringify(val))
}, { deep: true })

watch(categories, (val) => {
  localStorage.setItem('categories', JSON.stringify(val))
}, { deep: true })

watch(notifications, (val) => {
  localStorage.setItem('notifications', JSON.stringify(val))
}, { deep: true })

watch([characterPersonality, characterFrontHairstyle, characterBackHairstyle, characterEyes, characterOutfit, characterAccessory], () => {
    localStorage.setItem('character', JSON.stringify({
      personality: characterPersonality.value,
      frontHairstyle: characterFrontHairstyle.value,
      backHairstyle: characterBackHairstyle.value,
      eyes: characterEyes.value,
      outfit: characterOutfit.value,
      accessory: characterAccessory.value
    }))
})

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

// --------------------
// Provide
// --------------------
provide('task-data', { tasks, addTask, removeTask, updateTask }) 
provide('category-data', { categories, addCategory, removeCategory })
provide('notification-data', { notifications, addNotification, markAllAsRead, todos: tasks })
provide('character-data', { characterPersonality, characterFrontHairstyle, characterBackHairstyle, characterEyes, characterOutfit, characterAccessory })
</script>

<style>
/* 全体レイアウト */
body, html {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #ffffff;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.home {
  display: flex;
  width: 100vw;
  height: 100dvh;
  background-color: #ffffff;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  height: calc(100% - 60px);
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden;
}

@media (min-width: 768px) {
  .main-content {
    height: 100%;
    margin-left: 0;
  }
}

.view-header {
  height: 0;
  padding: 0;
}
</style>