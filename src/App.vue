<template>
  <div class="home">
    <Navigation
      class="side-nav"
      :active-tab="activeTab"
      :unread-count="unreadCount"
      @change-tab="activeTab = $event"
    />

    <main class="main-content">
      <header v-if="activeTab !== 'tasks'">
      </header>

      <TodayTasksView v-if="activeTab === 'tasks'" />
      <AllTasksView v-else-if="activeTab === 'all-tasks'" />
      <CharacterView
        v-else-if="activeTab === 'character'"
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
import { ref, watch, onMounted, provide, computed } from 'vue'
import TodayTasksView from './components/TodayTasksView.vue'
import AllTasksView from './components/AllTasksView.vue'
import CharacterView from './components/CharacterView.vue'
import CategoriesView from './components/CategoriesView.vue'
import NotificationsView from './components/NotificationsView.vue'
import Navigation from './components/common/Navigation.vue'

// --------------------
// データ
// --------------------
const tasks = ref([])
const categories = ref(['仕事', '勉強', '趣味', '未分類'])
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
// 起動セリフ制御 ★ここが新規
// --------------------
const showStartupLine = ref(false)
const startupLineText = ref('')

// 性格別 起動セリフ
const STARTUP_LINES = {
  元気系: [
    'おはよー！今日も一緒にがんばろ！',
    'よーし！今日もタスク片付けよっ！'
  ],
  クール系: [
    '……今日の予定、確認しよう。',
    '無理せず、淡々といこう。'
  ],
  おっとり系: [
    'おはよう〜。ゆっくり進めよっか。',
    '今日もマイペースでいこうね。'
  ]
}

const pickStartupLine = () => {
  const lines = STARTUP_LINES[characterPersonality.value] || ['今日もよろしくね。']
  return lines[Math.floor(Math.random() * lines.length)]
}

// --------------------
// メソッド
// --------------------
const addTask = (task) => {
  tasks.value.push({
    ...task,
    id: Date.now(),
    notified: false,
    dueDateNotified: false,
    overdueNotified: false
  })
}

const removeTask = (index) => {
  const taskIdToRemove = tasks.value[index].id
  tasks.value.splice(index, 1)
  notifications.value = notifications.value.filter(n => n.taskId !== taskIdToRemove)
}

const addCategory = (categoryName) => {
  if (categoryName.trim() && !categories.value.includes(categoryName.trim())) {
    categories.value.push(categoryName.trim())
  }
}

const removeCategory = (categoryToRemove) => {
  if (!confirm(`カテゴリ「${categoryToRemove}」を削除しますか？`)) return
  categories.value = categories.value.filter(c => c !== categoryToRemove)
  tasks.value.forEach(task => {
    if (task.category === categoryToRemove) task.category = '未分類'
  })
}

const addNotification = (message, taskId = null) => {
  notifications.value.unshift({
    id: Date.now(),
    message,
    read: false,
    timestamp: new Date(),
    taskId
  })
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

// --------------------
// 起動 & 日付変更判定 ★ここ重要
// --------------------
onMounted(() => {
  const today = new Date().toISOString().slice(0, 10)
  const lastLaunchDate = localStorage.getItem('lastLaunchDate')

  if (lastLaunchDate !== today) {
    startupLineText.value = pickStartupLine()
    showStartupLine.value = true
    localStorage.setItem('lastLaunchDate', today)
  }

  // データ読み込み
  const savedTasks = localStorage.getItem('tasks')
  if (savedTasks) {
    tasks.value = JSON.parse(savedTasks)
    tasks.value.forEach(t => {
      if (t.reminderTime) t.reminderTime = new Date(t.reminderTime)
    })
  }

  const savedCategories = localStorage.getItem('categories')
  if (savedCategories) categories.value = JSON.parse(savedCategories)

  const savedNotifications = localStorage.getItem('notifications')
  if (savedNotifications) {
    notifications.value = JSON.parse(savedNotifications)
    notifications.value.forEach(n => n.timestamp = new Date(n.timestamp))
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
})

// --------------------
// watch
// --------------------
watch(tasks, (val) => {
  localStorage.setItem('tasks', JSON.stringify(val))
}, { deep: true })

watch(
  [characterPersonality, characterFrontHairstyle, characterBackHairstyle, characterEyes, characterOutfit, characterAccessory],
  () => {
    localStorage.setItem('character', JSON.stringify({
      personality: characterPersonality.value,
      frontHairstyle: characterFrontHairstyle.value,
      backHairstyle: characterBackHairstyle.value,
      eyes: characterEyes.value,
      outfit: characterOutfit.value,
      accessory: characterAccessory.value
    }))
  }
)

// --------------------
// computed
// --------------------
const unreadCount = computed(() =>
  notifications.value.filter(n => !n.read).length
)

// --------------------
// provide
// --------------------
provide('task-data', { tasks, addTask, removeTask })
provide('category-data', { categories, addCategory, removeCategory })
provide('notification-data', { notifications, addNotification, markAllAsRead })
provide('character-data', {
  characterPersonality,
  characterFrontHairstyle,
  characterBackHairstyle,
  characterEyes,
  characterOutfit,
  characterAccessory
})
</script>
