<template>
  <section class="all-tasks-section">
    <div class="fixed-header">
      <div class="header-container">
        <h2>タスク一覧</h2>
        <button @click="showInputForm = true" class="add-task-button">
          <span>+</span> 新しいタスク
        </button>
      </div>

      <section class="filters">
        <div class="search-box">
          <span class="search-icon">🔎</span>
          <input type="text" v-model="searchText" placeholder="タスクを検索..." />
        </div>
        <div class="filter-row">
          <select v-model="filterStatus" class="filter-select">
            <option value="all">すべて</option>
            <option value="active">未完了</option>
            <option value="done">完了済み</option>
          </select>
          <select v-model="filterCategory" class="filter-select">
            <option value="all">全カテゴリ</option>
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          </select>
        </div>
      </section>
    </div>

    <ul class="task-list">
      <li v-for="(task, index) in filteredAllTasks" :key="task.id || index" class="task-card">
        
        <div class="check-area">
          <label class="custom-checkbox-label">
            <input type="checkbox" v-model="task.done" />
            <span class="checkmark"></span>
          </label>
        </div>

        <div class="info-area" @click="showDetail(task)">
          <div class="task-top">
            <span class="task-title" :class="{ 'text-done': task.done }">
              {{ task.text }}
            </span>
          </div>
          
          <div class="task-bottom">
            <span :class="['badge', `priority-${task.priority}`]">
              {{ getPriorityLabel(task.priority) }}
            </span>
            
            <span class="badge category-badge">
              {{ task.category }}
            </span>

            <span v-if="task.reminderTimes && task.reminderTimes.length > 0" class="reminder-indicator">
              🔔
            </span>
          </div>
        </div>

        <div class="action-area">
          <button @click.stop="removeTask(index)" class="delete-btn" title="削除">
            🗑️
          </button>
        </div>

      </li>
    </ul>

    <div v-if="showInputForm" class="modal-overlay" @click.self="showInputForm = false">
      <div class="modal-content">
        <button class="close-button" @click="showInputForm = false">&times;</button>
        <h3>新しいタスクを追加</h3>
        
        <div class="form-group">
          <label>タスク名</label>
          <input v-model="regTask.text" type="text" placeholder="例: 会議の準備" class="input-field" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>優先度</label>
            <select v-model="regTask.priority" class="input-field">
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          <div class="form-group">
            <label>カテゴリ</label>
            <select v-model="regTask.category" class="input-field">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label>期限</label>
          <input v-model="regTask.dueDate" type="date" class="input-field" />
        </div>

        <div class="form-group">
          <label>通知設定 (最大3件)</label>
          <ul class="reminder-list" v-if="regTask.reminderTimes.length > 0">
            <li v-for="(time, idx) in regTask.reminderTimes" :key="idx">
              <span>⏰ {{ new Date(time).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</span>
              <button @click="removeReminder(idx)" class="remove-reminder-btn">×</button>
            </li>
          </ul>
          <div class="reminder-input-row" v-if="regTask.reminderTimes.length < 3">
            <input v-model="newReminderInput" type="datetime-local" class="input-field" />
            <button @click="addReminder" class="add-reminder-btn" :disabled="!newReminderInput">追加</button>
          </div>
        </div>

        <button class="save-button" @click="handleRegistration">タスクを登録する</button>
      </div>
    </div>

    <TaskDetailModal :task="selectedTask" v-if="selectedTask" @close="selectedTask = null" />
  </section>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import TaskDetailModal from './TaskDetailModal.vue'

const showInputForm = ref(false)
const selectedTask = ref(null)

const { categories } = inject('category-data')
const { tasks, addTask, removeTask } = inject('task-data')

// 通知追加用の一時変数
const newReminderInput = ref('')

// 登録用データ
const regTask = ref({
  text: '',
  priority: 'medium',
  category: categories.value[0] || '仕事',
  dueDate: new Date().toISOString().slice(0, 10),
  reminderTimes: [],
  done: false
})

const getPriorityLabel = (p) => {
  if (p === 'high') return '高'
  if (p === 'medium') return '中'
  return '低'
}

// 通知を追加する処理
const addReminder = () => {
  if (newReminderInput.value && regTask.value.reminderTimes.length < 3) {
    regTask.value.reminderTimes.push(newReminderInput.value)
    regTask.value.reminderTimes.sort()
    newReminderInput.value = ''
  }
}

// 通知を削除する処理
const removeReminder = (index) => {
  regTask.value.reminderTimes.splice(index, 1)
}

const handleRegistration = () => {
  if (!regTask.value.text.trim()) return
  addTask({ 
    ...regTask.value, 
    id: Date.now(), 
    reminderTimes: [...regTask.value.reminderTimes],
    isEditing: false 
  })
  // フォームリセット
  regTask.value.text = ''
  regTask.value.reminderTimes = []
  newReminderInput.value = ''
  showInputForm.value = false
}

const searchText = ref('')
const filterStatus = ref('all')
const filterCategory = ref('all')

const filteredAllTasks = computed(() => {
  return tasks.value.filter(task => {
    const textMatch = !searchText.value || task.text.toLowerCase().includes(searchText.value.toLowerCase())
    const statusMatch = filterStatus.value === 'all' || (filterStatus.value === 'active' && !task.done) || (filterStatus.value === 'done' && task.done)
    const categoryMatch = filterCategory.value === 'all' || task.category === filterCategory.value
    return textMatch && statusMatch && categoryMatch
  })
})

const showDetail = (task) => { selectedTask.value = task }
</script>

<style scoped>
/* 全体レイアウト */
.all-tasks-section { 
  width: 100%; height: 100%; display: flex; flex-direction: column; background: #f4f6f8; /* 背景を少しグレーに */
}

/* ヘッダー周り */
.fixed-header { flex-shrink: 0; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); z-index: 10; }
.header-container { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; }
.header-container h2 { margin: 0; font-size: 1.2rem; color: #333; }

.add-task-button { 
  padding: 8px 16px; background: #333; color: #fff; border: none; border-radius: 20px; 
  font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.9rem; transition: background 0.2s;
}
.add-task-button:hover { background: #555; }

/* フィルターエリア */
/* --------------------
   フィルターエリア (検索ボックス修正版)
-------------------- */
.filters { 
  padding: 15px 20px; 
  background: #fff; 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
}

.search-box { 
  position: relative; 
  width: 100%; 
  display: flex;       /* 高さを安定させる */
  align-items: center; /* 中身を垂直中央に */
}

.search-icon { 
  position: absolute; 
  left: 12px;            /* 左端からの距離を少し広げる */
  top: 50%; 
  transform: translateY(-50%); /* 完全に垂直中央にする */
  font-size: 1.1rem;     /* サイズ調整 */
  line-height: 1;        /* 絵文字特有の上下ズレを防止 */
  pointer-events: none;  /* アイコンの上からでも入力できるようにする */
  z-index: 2;            /* 入力欄より手前に表示 */
}

.search-box input { 
  width: 100%; 
  padding: 12px 15px 12px 42px; /* 左パディングを増やしてアイコンと文字が重ならないように */
  border: 1px solid #eee; 
  border-radius: 8px; 
  background: #f9f9f9; 
  box-sizing: border-box;
  font-size: 1rem;
}
.filter-row { display: flex; gap: 10px; }
.filter-select { flex: 1; padding: 8px; border: 1px solid #eee; border-radius: 6px; background: #fff; color: #555; }

/* --- タスクリストのデザイン改善 --- */
.task-list { 
  flex: 1; overflow-y: auto; list-style: none; padding: 15px 20px; margin: 0; padding-bottom: 80px; 
}

/* タスクカード */
.task-card {
  display: flex; align-items: center;
  background: #fff;
  margin-bottom: 12px;
  padding: 12px 15px;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.03); /* 軽い影 */
  border: 1px solid transparent;
  transition: transform 0.1s, box-shadow 0.1s;
}
.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}

/* 1. チェックエリア */
.check-area { margin-right: 15px; flex-shrink: 0; }
.custom-checkbox-label { position: relative; display: inline-block; width: 22px; height: 22px; cursor: pointer; }
.custom-checkbox-label input { opacity: 0; width: 0; height: 0; }
.checkmark { position: absolute; top: 0; left: 0; height: 22px; width: 22px; background-color: #fff; border: 2px solid #ddd; border-radius: 6px; transition: all 0.2s; }
.custom-checkbox-label:hover input ~ .checkmark { border-color: #bbb; }
.custom-checkbox-label input:checked ~ .checkmark { background-color: #4CAF50; border-color: #4CAF50; }
.checkmark:after { content: ""; position: absolute; display: none; }
.custom-checkbox-label input:checked ~ .checkmark:after { display: block; left: 7px; top: 3px; width: 5px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }

/* 2. 中央情報エリア */
.info-area { flex: 1; min-width: 0; cursor: pointer; display: flex; flex-direction: column; gap: 6px; }
.task-top { display: flex; align-items: center; }
.task-title { font-size: 1rem; font-weight: bold; color: #333; line-height: 1.4; word-break: break-all; }
.text-done { color: #bbb; text-decoration: line-through; }

.task-bottom { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* バッジ共通 */
.badge { font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; font-weight: bold; display: inline-block; }

/* 優先度別の色 */
.priority-high { background: #ffebee; color: #d32f2f; border: 1px solid #ffcdd2; }
.priority-medium { background: #fff3e0; color: #ef6c00; border: 1px solid #ffe0b2; }
.priority-low { background: #e3f2fd; color: #1976d2; border: 1px solid #bbdefb; }

/* カテゴリ */
.category-badge { background: #f5f5f5; color: #666; border: 1px solid #e0e0e0; }

/* 通知アイコン */
.reminder-indicator { font-size: 0.8rem; }

/* 3. 削除ボタンエリア */
.action-area { margin-left: 10px; flex-shrink: 0; }
.delete-btn {
  background: transparent; border: none; font-size: 1.2rem; cursor: pointer; opacity: 0.3; transition: opacity 0.2s; padding: 5px;
}
.delete-btn:hover { opacity: 1; transform: scale(1.1); }

/* モーダルCSS (既存維持) */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 3000; }
.modal-content { background: #fff; padding: 25px; border-radius: 15px; width: 90%; max-width: 400px; position: relative; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
.form-group { margin-bottom: 15px; }
.form-row { display: flex; gap: 10px; }
.form-row .form-group { flex: 1; }
.input-field { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; font-size: 1rem; }
.save-button { width: 100%; padding: 15px; background: #333; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; }
.close-button { position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 28px; color: #999; cursor: pointer; }

/* 通知設定リスト */
.reminder-list { list-style: none; padding: 0; margin-bottom: 8px; }
.reminder-list li { display: flex; justify-content: space-between; align-items: center; background: #f0f4ff; padding: 8px 12px; border-radius: 6px; margin-bottom: 5px; font-size: 0.9em; }
.remove-reminder-btn { background: #ccc; color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.reminder-input-row { display: flex; gap: 8px; }
.reminder-input-row input { flex: 1; }
.add-reminder-btn { background: #4caf50; color: #fff; border: none; border-radius: 6px; padding: 0 12px; font-weight: bold; cursor: pointer; white-space: nowrap; }
.add-reminder-btn:disabled { background: #ddd; cursor: not-allowed; }
</style>