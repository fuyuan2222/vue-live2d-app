<template>
  <div class="home">
    <Navigation class="side-nav" :active-tab="activeTab" :unread-count="unreadCount" @change-tab="activeTab = $event" />

    <main class="main-content">
      <header v-if="activeTab !== 'tasks'">
      </header>

      <TodayTasksView v-if="activeTab === 'tasks'" />
      <AllTasksView v-else-if="activeTab === 'all-tasks'" />
      <CharacterView v-else-if="activeTab === 'character'" />
      <CategoriesView v-else-if="activeTab === 'categories'" />
      <NotificationsView v-else-if="activeTab === 'notifications'" />
    </main>

    <Navigation class="bottom-nav" :active-tab="activeTab" :unread-count="unreadCount" @change-tab="activeTab = $event" />
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

// --- データと状態 ---
const tasks = ref([])
const categories = ref(['仕事', '勉強', '趣味', '未分類'])
const notifications = ref([])

// --- キャラクター設定  ---
const characterPersonality = ref('元気系')
const characterFrontHairstyle = ref('ぱっつん') 

// ★ここ修正：「ロング」はもう存在しないので「サイドテール」に変更
const characterBackHairstyle = ref('サイドテール')    

const characterEyes = ref('丸目')             
const characterOutfit = ref('元気カジュアル系')
const characterAccessory = ref('なし')

const newDueDate = ref(new Date().toISOString().substr(0, 10))
const activeTab = ref('tasks')


// --- メソッド ---

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
    notifications.value = notifications.value.filter(note => note.taskId !== taskIdToRemove)
}

const addCategory = (categoryName) => {
    if (categoryName.trim() && !categories.value.includes(categoryName.trim())) {
        categories.value.push(categoryName.trim())
    }
}

const removeCategory = (categoryToRemove) => {
    if (!confirm(`カテゴリ「${categoryToRemove}」と、それに属するすべてのタスクを「未分類」に変更します。よろしいですか？`)) {
        return
    }
    categories.value = categories.value.filter(c => c !== categoryToRemove)
    tasks.value.forEach(task => {
        if (task.category === categoryToRemove) {
            task.category = '未分類'
        }
    })
}

const addNotification = (message, taskId = null) => { 
    const newNotification = {
        id: Date.now(),
        message: message,
        read: false,
        timestamp: new Date(),
        taskId: taskId
    }
    notifications.value.unshift(newNotification)
}

const markAllAsRead = () => {
    notifications.value.forEach(note => note.read = true)
}

const monitorReminders = () => {
    const now = Date.now()
    const today = new Date().toISOString().substr(0, 10)

    tasks.value.forEach(task => {
        if (task.done) return

        // --- A. リマインダー時刻チェック ---
        if (task.reminderTime && task.reminderTime instanceof Date) {
            const reminderTs = task.reminderTime.getTime()
            if (reminderTs <= now && !task.notified) {
                const notificationMessage = `タスク "${task.text}" のリマインド時刻になりました。`
                addNotification(notificationMessage, task.id)
                task.notified = true 
            }
        }
        
        // --- B. 期限日チェック ---
        if (task.dueDate) {
            if (task.dueDate === today && !task.dueDateNotified) {
                const notificationMessage = `タスク "${task.text}" の期限は本日です。`
                addNotification(notificationMessage, task.id)
                task.dueDateNotified = true 
            }
            if (task.dueDate < today && !task.overdueNotified) {
                const notificationMessage = `🚨 タスク "${task.text}" は期日を過ぎています！早めに完了させましょう。`
                addNotification(notificationMessage, task.id)
                task.overdueNotified = true 
            }
        }
    })
}

// --- ローカルストレージ ---
onMounted(() => {
    const savedTasks = localStorage.getItem('tasks')
    const savedCategories = localStorage.getItem('categories')
    const savedNotifications = localStorage.getItem('notifications')
    const savedCharacter = localStorage.getItem('character')

    if (savedTasks) {
        tasks.value = JSON.parse(savedTasks)
        tasks.value.forEach(task => {
             if (task.reminderTime) {
                 task.reminderTime = new Date(task.reminderTime)
             }
             if (typeof task.notified === 'undefined') task.notified = false;
             if (typeof task.dueDateNotified === 'undefined') task.dueDateNotified = false;
             if (typeof task.overdueNotified === 'undefined') task.overdueNotified = false;
             if (typeof task.id === 'undefined') task.id = Date.now() + Math.random();
        })
    }
    if (savedCategories) categories.value = JSON.parse(savedCategories)
    if (savedNotifications) {
        notifications.value = JSON.parse(savedNotifications)
        notifications.value.forEach(note => {
            note.timestamp = new Date(note.timestamp)
        })
    }
    
    // キャラクターデータの読み込み（互換性対応）
    if (savedCharacter) {
        const charData = JSON.parse(savedCharacter)
        characterPersonality.value = charData.personality || '元気系'
        characterOutfit.value = charData.outfit || '元気カジュアル系'
        characterAccessory.value = charData.accessory || 'なし'
        
        // ★ここ修正：
        // 旧データ(hairstyle)がある場合の移行処理も、新しい名前に合わせる
        // もし古いデータで「ロング」が保存されていても、「一つ結び」か「サイドテール」になるようにする
        let backHair = charData.backHairstyle || charData.hairstyle || 'サイドテール';
        if (backHair === 'ロング') backHair = '一つ結び'; // 古いデータ対策
        characterBackHairstyle.value = backHair;

        characterFrontHairstyle.value = charData.frontHairstyle || 'ぱっつん'
        characterEyes.value = charData.eyes || '丸目'
    }
    
    setInterval(monitorReminders, 60000)
})

// タスク保存の監視
watch(tasks, (val) => {
    const serializableTasks = val.map(task => ({
        ...task,
        reminderTime: task.reminderTime instanceof Date ? task.reminderTime.toISOString() : task.reminderTime
    }))
    localStorage.setItem('tasks', JSON.stringify(serializableTasks))
}, { deep: true })

// キャラクター設定保存の監視 (追加)
watch(
  [characterPersonality, characterFrontHairstyle, characterBackHairstyle, characterEyes, characterOutfit, characterAccessory],
  () => {
    const charData = {
      personality: characterPersonality.value,
      frontHairstyle: characterFrontHairstyle.value,
      backHairstyle: characterBackHairstyle.value,
      eyes: characterEyes.value,
      outfit: characterOutfit.value,
      accessory: characterAccessory.value
    }
    localStorage.setItem('character', JSON.stringify(charData))
  }
)

// --- computed ---
const unreadCount = computed(() => {
    return notifications.value.filter(note => !note.read).length
})

// --- provide/injectでデータを共有 (修正: 新しい変数を渡す) ---
provide('task-data', { tasks, addTask, removeTask, newDueDate })
provide('category-data', { categories, addCategory, removeCategory })
provide('notification-data', { notifications, addNotification, markAllAsRead, todos: tasks })

// ここを修正: 新しいパーツ変数をprovideする
provide('character-data', { 
  characterPersonality, 
  characterFrontHairstyle, 
  characterBackHairstyle, 
  characterEyes,
  characterOutfit, 
  characterAccessory 
})
</script>