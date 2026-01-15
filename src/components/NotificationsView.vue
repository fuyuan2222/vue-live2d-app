<template>
  <section class="notifications-list">
    <div class="header">
      <h2>通知 ({{ unreadCount }})</h2>
      <button 
        v-if="unreadCount > 0" 
        @click="markAllAsRead" 
        class="mark-read-btn"
      >
        すべて既読
      </button>
    </div>

    <div v-if="notifications.length === 0" class="no-notes">
      通知はありません。
    </div>

    <ul v-else>
      <li 
        v-for="note in notifications" 
        :key="note.id" 
        :class="{ 'unread': !note.read }"
      >
        <span class="message">{{ note.message }}</span>
        <span class="timestamp">
          {{ new Date(note.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) }}
        </span>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
const { notifications, markAllAsRead, todos, addNotification } = inject('notification-data')

const monitorInterval = ref(null)
const unreadCount = computed(() => {
  return notifications.value.filter(note => !note.read).length
})

const startMonitor = () => {
  monitorInterval.value = setInterval(() => {
    const now = Date.now()
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const today = `${year}-${month}-${day}`
    
    todos.value.forEach(task => {
      if (task.isDone) return 

      // -------------------------------
      // パターンA: 時間指定のリマインダー
      // -------------------------------
      if (task.reminderTime) {
        const reminderTs = new Date(task.reminderTime).getTime()
        if (reminderTs <= now && !task.timeNotified) {
          triggerNotification(task, 'time')
        }
      }

      // -------------------------------
      // パターンB: 本日締め切りのタスク (日付一致)
      // -------------------------------
      if (task.dueDate === today && !task.dateNotified) {
        triggerNotification(task, 'date')
      }
    })
  }, 10000)
}

const triggerNotification = (task, type) => {
  let msg = ''
  
  if (type === 'time') {
    msg = `⏰ ${task.text} の時間です！`
    task.timeNotified = true 
  } else {
    msg = `📅 本日締切: ${task.text}`
    task.dateNotified = true 
  }

  const newNote = {
    id: Date.now(), 
    message: msg,
    timestamp: Date.now(),
    read: false
  }
 
  addNotification(newNote)
}

const stopMonitor = () => {
  if (monitorInterval.value) {
    clearInterval(monitorInterval.value)
  }
}

onMounted(() => {
  startMonitor()
})

onUnmounted(() => {
  stopMonitor()
})
</script>

<style scoped>
.notifications-list {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin: 20px; 
  background-color: #fff; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); 
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.mark-read-btn {
  background-color: #eee;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #666;
}
.mark-read-btn:hover {
  background-color: #ddd;
}

.no-notes {
  text-align: center;
  color: #999;
  padding: 20px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  background: #f9f9f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.3s;
}


.unread {
  background: #fff8e1; 
  border-left: 4px solid #ff9800;
}

.unread .message {
  font-weight: bold;
  color: #d84315;
}

.message {
  flex: 1;
}

.timestamp {
  font-size: 0.75em;
  color: #999;
  margin-left: 15px;
  white-space: nowrap; 
}
</style>