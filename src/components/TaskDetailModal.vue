<template>
  <div class="modal-overlay" @click.self="closeWithoutSave">
    <div class="modal-content">
      <header class="modal-header">
        <h3>タスク詳細</h3>
        <button class="close-btn" @click="closeWithoutSave">×</button>
      </header>

      <div class="modal-body">
        <div class="form-group">
          <label>タスク内容</label>
          <input 
            v-model="editingTask.text" 
            type="text" 
            class="input-text"
            placeholder="タスクを入力..."
          >
        </div>

        <div class="form-group">
          <label>優先度</label>
          <div class="priority-selector">
            <button 
              v-for="p in ['high', 'medium', 'low']" 
              :key="p"
              type="button"
              :class="['p-btn', p, { active: editingTask.priority === p }]"
              @click="editingTask.priority = p"
            >
              {{ p === 'high' ? '高' : p === 'medium' ? '中' : '低' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>締切日</label>
          <input 
            v-model="editingTask.dueDate" 
            type="date" 
            class="input-date"
          >
        </div>

        <div class="form-group">
          <label>時間指定リマインダー</label>
          <div class="reminder-input-group">
            <input 
              v-model="newReminderTime" 
              type="datetime-local" 
              class="input-date"
            >
            <button type="button" @click="addReminder" class="add-btn">追加</button>
          </div>
          
          <ul class="reminder-list">
            <li v-for="(time, index) in editingTask.reminderTimes" :key="index" class="reminder-item">
              <span>⏰ {{ formatTime(time) }}</span>
              <button @click="removeReminder(index)" class="remove-btn">削除</button>
            </li>
          </ul>
        </div>
      </div>

      <footer class="modal-footer">
        <div class="footer-actions">
          <a 
            v-if="canExport"
            :href="googleCalendarLink" 
            target="_blank" 
            rel="noopener noreferrer"
            class="calendar-btn google-btn"
          >
            📅 Googleカレンダー
          </a>

          <button class="save-btn" @click="saveAndClose">決定</button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue'

const props = defineProps({
  task: { type: Object, required: true }
})

const emit = defineEmits(['close'])
const { updateTask } = inject('task-data')

const editingTask = ref(JSON.parse(JSON.stringify(props.task)))

if (!editingTask.value.reminderTimes) {
  editingTask.value.reminderTimes = []
}

const newReminderTime = ref('')

const addReminder = () => {
  if (newReminderTime.value) {
    if (!editingTask.value.reminderTimes.includes(newReminderTime.value)) {
      editingTask.value.reminderTimes.push(newReminderTime.value)
      editingTask.value.reminderTimes.sort()
    }
    newReminderTime.value = ''
  }
}

const removeReminder = (index) => {
  editingTask.value.reminderTimes.splice(index, 1)
}

const formatTime = (isoString) => {
  const d = new Date(isoString)
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const saveAndClose = () => {
  updateTask(editingTask.value)
  emit('close')
}

const closeWithoutSave = () => {
  emit('close')
}

// カレンダー登録可能か判定（テキストと日付が必須）
const canExport = computed(() => {
  return editingTask.value.text && editingTask.value.dueDate
})

// Googleカレンダー用リンク生成
const googleCalendarLink = computed(() => {
  if (!canExport.value) return null
  const title = encodeURIComponent(editingTask.value.text)
  const details = encodeURIComponent(`優先度: ${editingTask.value.priority || 'medium'}\n(Todoアプリから登録)`)
  const dateStr = editingTask.value.dueDate.replace(/-/g, '')
  // 終日イベントとして登録
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${dateStr}&details=${details}`
})
</script>

<style scoped>
/* 基本スタイル */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { 
  background: white; width: 90%; max-width: 400px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
  overflow: hidden; display: flex; flex-direction: column; 
  max-height: 85vh; /* 少し余裕を持たせる */
  margin-bottom: 20px; 
}
.modal-header { padding: 15px 20px; background: #f8f9fa; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.1rem; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 20px; overflow-y: auto; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-weight: bold; margin-bottom: 8px; font-size: 0.9rem; color: #555; }
.input-text, .input-date { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; box-sizing: border-box; }
.priority-selector { display: flex; gap: 10px; }
.p-btn { flex: 1; padding: 10px; border: 1px solid #eee; background: #f9f9f9; border-radius: 6px; cursor: pointer; }
.p-btn.active { font-weight: bold; border: 2px solid #555; }
.p-btn.high.active { background: #ffcccc; border-color: #ff9999; }
.p-btn.medium.active { background: #fff4b3; border-color: #ffcc00; }
.p-btn.low.active { background: #ccf0ff; border-color: #66ccff; }
.reminder-input-group { display: flex; gap: 8px; margin-bottom: 10px; }
.add-btn { padding: 0 15px; background: #4CAF50; color: white; border: none; border-radius: 6px; cursor: pointer; white-space: nowrap; }
.reminder-list { list-style: none; padding: 0; margin: 0; }
.reminder-item { display: flex; justify-content: space-between; align-items: center; background: #f0f0f0; padding: 8px 12px; border-radius: 4px; margin-bottom: 5px; font-size: 0.9rem; }
.remove-btn { background: #ff5252; color: white; border: none; border-radius: 4px; padding: 2px 8px; font-size: 0.8rem; cursor: pointer; }

/* フッター調整 (スマホ対応) */
.modal-footer {
  padding: 15px 20px; 
  /* iPhoneホームバー対策 */
  padding-bottom: max(20px, env(safe-area-inset-bottom)); 
  border-top: 1px solid #eee; 
  background: #fff;
}

.footer-actions {
  display: flex;
  flex-direction: column; /* スマホは縦積み */
  gap: 12px;
}

/* ボタン共通設定 */
.calendar-btn, .save-btn {
  display: flex; 
  align-items: center; 
  justify-content: center;
  padding: 14px; 
  border-radius: 8px; 
  text-decoration: none;
  font-size: 1rem; 
  font-weight: bold; 
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
}

.calendar-btn {
  border: 1px solid #ddd; background: #fff; color: #555;
}
.google-btn:hover { background: #e8f0fe; color: #1967d2; border-color: #d2e3fc; }

.save-btn {
  background: #333; color: white; border: none;
}

/* 画面が広いとき(PCなど)は横並び */
@media (min-width: 400px) {
  .footer-actions {
    flex-direction: row;
    gap: 15px;
  }
}
</style>