<template>
  <div class="home">
    <Navigation class="side-nav" :active-tab="activeTab" :unread-count="unreadCount" @change-tab="activeTab = $event" />

    <main class="main-content">
      <header v-if="activeTab !== 'tasks'">
      </header>

      <TodayTasksView :style="{ display: activeTab === 'tasks' ? 'block' : 'none' }" />
      <AllTasksView :style="{ display: activeTab === 'all-tasks' ? 'block' : 'none' }" />
      <CharacterView :style="{ display: activeTab === 'character' ? 'block' : 'none' }" />
      <CategoriesView :style="{ display: activeTab === 'categories' ? 'block' : 'none' }" />
      <NotificationsView :style="{ display: activeTab === 'notifications' ? 'block' : 'none' }" />
    </main>

    <Navigation class="bottom-nav" :active-tab="activeTab" :unread-count="unreadCount" @change-tab="activeTab = $event" />
  </div>
</template>

<script setup>
// ... (imports)
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
const characterPersonality = ref('元気系')
const characterHairstyle = ref('ロング')
const characterOutfit = ref('元気カジュアル系')
const characterAccessory = ref('なし')
const newDueDate = ref(new Date().toISOString().substr(0, 10))
const activeTab = ref('tasks')


// --- メソッド ---

// ✅ 1. addTask: ID付与と全フラグ初期化を統合
const addTask = (task) => {
    tasks.value.push({ 
        ...task, 
        id: Date.now(), // 🚨 ユニークIDを付与 (必須)
        notified: false, 
        dueDateNotified: false,
        overdueNotified: false
    })
}

// ✅ 2. removeTask: タスク削除と関連通知クリアを連携
const removeTask = (index) => {
    // 削除対象のタスクIDを取得
    const taskIdToRemove = tasks.value[index].id 
    
    // タスクを削除
    tasks.value.splice(index, 1)

    // 🚨 関連する通知をフィルタリングして削除
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

// ✅ 3. addNotification: taskIdを記録
const addNotification = (message, taskId = null) => { 
    const newNotification = {
        id: Date.now(),
        message: message,
        read: false,
        timestamp: new Date(),
        taskId: taskId // 🚨 タスクIDを通知オブジェクトに記録 (必須)
    }
    notifications.value.unshift(newNotification)
}

const markAllAsRead = () => {
    notifications.value.forEach(note => note.read = true)
}

// ✅ 4. monitorReminders: addNotification呼び出し時にtask.idを渡す
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
                addNotification(notificationMessage, task.id) // ✅ IDを渡す
                task.notified = true 
            }
        }
        
        // --- B. 期限日チェックの改善 ---
        if (task.dueDate) {
            // 期限日が今日である場合の通知
            if (task.dueDate === today && !task.dueDateNotified) {
                const notificationMessage = `タスク "${task.text}" の期限は本日です。`
                addNotification(notificationMessage, task.id) // ✅ IDを渡す
                task.dueDateNotified = true 
            }
            
            // 期日を過ぎている場合の通知
            if (task.dueDate < today && !task.overdueNotified) {
                const notificationMessage = `🚨 タスク "${task.text}" は期日を過ぎています！早めに完了させましょう。`
                addNotification(notificationMessage, task.id) // ✅ IDを渡す
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
             // 既存のタスクにフラグを追加
             if (typeof task.notified === 'undefined') task.notified = false;
             if (typeof task.dueDateNotified === 'undefined') task.dueDateNotified = false;
             if (typeof task.overdueNotified === 'undefined') task.overdueNotified = false;
             if (typeof task.id === 'undefined') task.id = Date.now() + Math.random(); // IDがないタスクに暫定IDを付与
        })
    }
    if (savedCategories) categories.value = JSON.parse(savedCategories)
    if (savedNotifications) {
        notifications.value = JSON.parse(savedNotifications)
        notifications.value.forEach(note => {
            note.timestamp = new Date(note.timestamp)
        })
    }
    if (savedCharacter) {
        const charData = JSON.parse(savedCharacter)
        characterPersonality.value = charData.personality
        characterHairstyle.value = charData.hairstyle
        characterOutfit.value = charData.outfit
        characterAccessory.value = charData.accessory
    }
    
    // 監視ロジックの開始
    setInterval(monitorReminders, 60000)
})

watch(tasks, (val) => {
    const serializableTasks = val.map(task => ({
        ...task,
        reminderTime: task.reminderTime instanceof Date ? task.reminderTime.toISOString() : task.reminderTime
    }))
    localStorage.setItem('tasks', JSON.stringify(serializableTasks))
}, { deep: true })

// --- computed (変更なし) ---
const unreadCount = computed(() => {
    return notifications.value.filter(note => !note.read).length
})

// --- provide/injectでデータを共有 (変更なし) ---
provide('task-data', { tasks, addTask, removeTask, newDueDate })
provide('category-data', { categories, addCategory, removeCategory })
provide('notification-data', { notifications, addNotification, markAllAsRead, todos: tasks })
provide('character-data', { characterPersonality, characterHairstyle, characterOutfit, characterAccessory })
</script>