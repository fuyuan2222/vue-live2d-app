<template>
  <section class="all-tasks-section">
    <h2>タスク一覧</h2>

    <div class="add-task-toggle">
        <button 
            @click="showInputForm = !showInputForm" 
            class="add-task-button"
            :class="{ 'is-open': showInputForm }">
            <i :class="['fas', showInputForm ? 'fa-minus' : 'fa-plus']"></i>
            <span v-if="!showInputForm"> 新しいタスクを追加</span>
            <span v-else> 入力フォームを閉じる</span>
        </button>
    </div>

    <div v-if="showInputForm" class="todo-input-container">
      <div class="todo-input">
        <div class="input-grid">
          <div class="form-group">
            <label for="task-name">タスク名</label>
            <input id="task-name" type="text" v-model="newTask" placeholder="例: プレゼン資料作成" />
          </div>
          <div class="form-group">
            <label for="priority">優先度</label>
            <select id="priority" v-model="newPriority">
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
          <div class="form-group">
            <label for="category">カテゴリ</label>
            <select id="category" v-model="newCategory">
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="due-date">期限</label>
            <input id="due-date" type="date" v-model="newDueDate" />
          </div>
        </div>
        <button @click="addTaskHandler">タスクを追加</button>
      </div>
    </div>

    <section class="filters">
      <input type="text" v-model="searchText" placeholder="タスクを検索..." />
      <select v-model="filterStatus">
        <option value="all">すべて</option>
        <option value="active">未完了</option>
        <option value="done">完了済み</option>
      </select>
      <select v-model="filterPriority">
        <option value="all">すべての優先度</option>
        <option value="high">高</option>
        <option value="medium">中</option>
        <option value="low">低</option>
      </select>
      <select v-model="filterCategory">
        <option value="all">すべてのカテゴリ</option>
        <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
      </select>
    </section>

    <ul class="task-list">
      <li v-for="(task, index) in filteredAllTasks" :key="index">
        <input type="checkbox" v-model="task.done" />
        
        <div class="task-info-container">
            <span 
                v-if="!task.isEditing" 
                :class="[task.done ? 'done' : '', 'task-name-span']" 
                @dblclick="editTask(task)"
                @click="showDetail(task)">
                {{ task.text }}
                <span :class="['priority-tag', task.priority]">
                    {{ task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低' }}
                </span>
            </span>
            <span class="task-category-text">({{ task.category }})</span>

            <input v-if="task.isEditing" v-model="task.text" @keyup.enter="finishEdit(task)" @blur="finishEdit(task)" />
        </div>
        
        <button @click="removeTask(index)">削除</button>
      </li>
    </ul>
    
    <TaskDetailModal 
      :task="selectedTask" 
      v-if="selectedTask" 
      @close="selectedTask = null" 
    />
  </section>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import TaskDetailModal from './TaskDetailModal.vue';

// フォームの表示状態を管理するリアクティブな変数
const showInputForm = ref(false); 

const selectedTask = ref(null);

const { categories } = inject('category-data'); 
const { tasks, addTask, removeTask, newDueDate } = inject('task-data')

const newTask = ref('')
const newPriority = ref('low')
const newCategory = ref('仕事')

const searchText = ref('')
const filterStatus = ref('all')
const filterPriority = ref('all')
const filterCategory = ref('all')

const filteredAllTasks = computed(() => {
  return tasks.value.filter(task => {
    const textMatch = !searchText.value || task.text.toLowerCase().includes(searchText.value.toLowerCase());
    const statusMatch = filterStatus.value === 'all' || 
                        (filterStatus.value === 'active' && !task.done) || 
                        (filterStatus.value === 'done' && task.done);
    const priorityMatch = filterPriority.value === 'all' || task.priority === filterPriority.value;
    const categoryMatch = filterCategory.value === 'all' || task.category === filterCategory.value;

    return textMatch && statusMatch && priorityMatch && categoryMatch;
  });
})

function addTaskHandler() {
  if (!newTask.value.trim()) return
  addTask({
    text: newTask.value,
    done: false,
    priority: newPriority.value,
    category: newCategory.value,
    dueDate: newDueDate.value,
    isEditing: false
  })
  newTask.value = ''
  showInputForm.value = false; // ✅ タスク追加後にフォームを閉じる
}

function editTask(task) { task.isEditing = true }
function finishEdit(task) { task.isEditing = false }

const showDetail = (task) => {
    selectedTask.value = task;
};
</script>

<style scoped>
.add-task-toggle {
    /* フォームの開閉ボタンとフォームの間のマージン */
    margin-bottom: 20px; 
}
.add-task-button {
    width: 100%; 
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 15px;
    font-size: 16px;
    background-color: #ff8c00;
    transition: background-color 0.3s ease;
}
.add-task-button.is-open {
    background-color: #ff5722; 
}
.add-task-button i {
    margin-right: 8px;
    transition: transform 0.3s ease;
}

.task-info-container {
    display: flex;
    align-items: center;
    flex-grow: 1;
    margin-left: 10px;
}
.task-name-span {
    cursor: pointer;
    margin-right: 5px;
    font-weight: 600;
}
.task-category-text {
    font-size: 14px;
    color: #666;
}
</style>