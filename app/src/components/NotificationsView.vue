<template>
  <section class="notifications-list">
    <h2>通知 ({{ unreadCount }})</h2>
    <div v-if="notifications.length === 0" class="no-notes">
      通知はありません。
    </div>
    <ul v-else>
      <li v-for="note in notifications" :key="note.id" :class="{ 'unread': !note.read }">
        {{ note.message }}
        <span class="timestamp">{{ new Date(note.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) }}</span>
      </li>
    </ul>
    <button @click="markAllAsRead" v-if="unreadCount > 0">すべて既読にする</button>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'

// Todoリストのデータと通知ロジックをinjectで受け取る
// 【重要】Todoデータには .reminderTime (日時オブジェクト) が含まれている前提
const { notifications, markAllAsRead, todos, addNotification } = inject('notification-data')

// タイマーIDを保持するためのリアクティブ変数
const monitorInterval = ref(null)

const unreadCount = computed(() => {
  return notifications.value.filter(note => !note.read).length
})

// --- アプリ内通知の監視ロジック ---

const startMonitor = () => {
  // 1分 (60000ms) ごとにタスクの期限をチェック
  monitorInterval.value = setInterval(() => {
    const now = Date.now()
    
    todos.value.forEach(task => {
      // 1. リマインダー時刻が設定されているか
      // 2. タスクが完了していないか
      // 3. 通知済みではないか (タスクオブジェクトに isNotified フラグが必要だが、ここでは簡略化)
      if (task.reminderTime && !task.isDone) {
        const reminderTs = new Date(task.reminderTime).getTime()
        
        // 🚨 チェック: リマインダー時刻が現在時刻を過ぎているか
        if (reminderTs <= now) {
          
          // 【注意】ここでは簡略化のため、通知が一度トリガーされたら
          // そのタスクの reminderTime を null にすることで再トリガーを防ぎます。
          // 実際は task.isNotified = true; のようなフラグ管理が推奨されます。
          if (!task.notified) {
             triggerNotification(task)
             // 通知済みフラグをセット (injected data sourceで実装が必要)
             // 例: task.notified = true; 
          }
        }
      }
    })
  }, 60000) // 1分 (60秒)
}

const triggerNotification = (task) => {
  const newNote = {
    id: Date.now(),
    message: `【リマインダー】 ${task.text} の時間です！`,
    timestamp: Date.now(),
    read: false
  }
  
  // notifications配列にメッセージを追加
  notifications.value.push(newNote) 
  
  // 通知が一度だけ表示されるように、このタスクを「通知済み」としてマークする
  // 理想的には、todosデータソース側の関数を呼び出すべき
  task.notified = true // 簡略化のための直接変更
}


const stopMonitor = () => {
  if (monitorInterval.value) {
    clearInterval(monitorInterval.value)
  }
}

// コンポーネントがマウントされたときに監視を開始
onMounted(() => {
  startMonitor()
})

// コンポーネントが破棄されるときに監視を停止
onUnmounted(() => {
  stopMonitor()
})

</script>

<style scoped>
.notifications-list {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
}
.no-notes {
  text-align: center;
  color: #999;
  padding: 20px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 4px;
  background: #f9f9f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.unread {
  background: #fff3e0; /* 目立つ色で未読を強調 */
  font-weight: bold;
  border-left: 5px solid #ff9800;
}
.timestamp {
  font-size: 0.8em;
  color: #666;
  margin-left: 10px;
}
</style>