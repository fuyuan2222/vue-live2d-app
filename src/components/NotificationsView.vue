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

// 親(App.vue等)から提供されたデータと関数を受け取る
const { notifications, markAllAsRead, todos, addNotification } = inject('notification-data')

const monitorInterval = ref(null)

// 未読件数の計算
const unreadCount = computed(() => {
  return notifications.value.filter(note => !note.read).length
})

// --- アプリ内通知の監視ロジック ---

const startMonitor = () => {
  // 10秒ごとにチェック
  monitorInterval.value = setInterval(() => {
    const now = Date.now()

    // 【重要】日本時間で「今日」の日付文字列(YYYY-MM-DD)を作成
    // ※ new Date().toISOString() だと9時間ずれて判定ミスするため
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const today = `${year}-${month}-${day}`
    
    todos.value.forEach(task => {
      // 完了済みのタスクは通知しない
      if (task.isDone) return 

      // -------------------------------
      // パターンA: 時間指定のリマインダー
      // -------------------------------
      if (task.reminderTime) {
        const reminderTs = new Date(task.reminderTime).getTime()
        
        // 現在時刻を過ぎており、かつ「時間通知」がまだの場合
        // ※ task.timeNotified という新しいフラグを使います
        if (reminderTs <= now && !task.timeNotified) {
          triggerNotification(task, 'time')
        }
      }

      // -------------------------------
      // パターンB: 本日締め切りのタスク (日付一致)
      // -------------------------------
      // 期限が今日で、かつ「日付通知」がまだの場合
      // ※ task.dateNotified という新しいフラグを使います
      if (task.dueDate === today && !task.dateNotified) {
        // ここで「もし時間指定があるなら、朝の通知は出さない」などの調整も可能です
        // 今回は両方出す設定にしています
        triggerNotification(task, 'date')
      }
    })
  }, 10000) // 10秒間隔
}

const triggerNotification = (task, type) => {
  let msg = ''
  
  // タイプによってメッセージとフラグを使い分ける
  if (type === 'time') {
    msg = `⏰ ${task.text} の時間です！`
    task.timeNotified = true // 時間通知済みフラグON
  } else {
    msg = `📅 本日締切: ${task.text}`
    task.dateNotified = true // 日付通知済みフラグON
  }

  // 新しい通知オブジェクトを作成
  const newNote = {
    id: Date.now(), // 一意のID
    message: msg,
    timestamp: Date.now(),
    read: false
  }
  
  // injectした関数を使って通知リストに追加
  addNotification(newNote)
}

const stopMonitor = () => {
  if (monitorInterval.value) {
    clearInterval(monitorInterval.value)
  }
}

// マウント時に監視開始、アンマウント時に停止
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* 少し影をつけてリッチに */
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

/* 未読時のスタイル */
.unread {
  background: #fff8e1; /* 薄いオレンジ */
  border-left: 4px solid #ff9800; /* 左端にアクセントカラー */
}

.unread .message {
  font-weight: bold;
  color: #d84315;
}

.message {
  flex: 1; /* メッセージ部分を広げる */
}

.timestamp {
  font-size: 0.75em;
  color: #999;
  margin-left: 15px;
  white-space: nowrap; /* 時間で改行させない */
}
</style>