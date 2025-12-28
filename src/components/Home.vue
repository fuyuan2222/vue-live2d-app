<template>
  <div class="home">
    <header>
      

      <p>{{ characterMessage }}</p>
      
      <nav class="header-nav">
        <button @click="activeTab = 'tasks'" :class="{ 'active': activeTab === 'tasks' }">
          <i class="fas fa-home"></i>
          <span>ホーム</span>
        </button>
        <button @click="activeTab = 'all-tasks'" :class="{ 'active': activeTab === 'all-tasks' }">
          <i class="fas fa-list-ul"></i>
          <span>タスク一覧</span>
        </button>
        <button @click="activeTab = 'character'" :class="{ 'active': activeTab === 'character' }">
          <i class="fas fa-user-circle"></i>
          <span>キャラクター</span>
        </button>
        <button @click="activeTab = 'categories'" :class="{ 'active': activeTab === 'categories' }">
          <i class="fas fa-tags"></i>
          <span>カテゴリ</span>
        </button>
        <button @click="activeTab = 'notifications'" :class="{ 'active': activeTab === 'notifications' }">
          <i class="fas fa-bell"></i>
          <span>通知</span>
          <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
        </button>
      </nav>
    </header>

    <main class="tab-content">
      <section v-if="activeTab === 'tasks'" class="today-tasks-section">
        <h2>本日のタスク</h2>
        
        

        <div v-if="filteredTodayTasks.length === 0" class="no-tasks">
          本日のタスクはありません！
        </div>
        <ul class="task-list today-list">
          <li v-for="(task, index) in filteredTodayTasks" :key="index">
            <input type="checkbox" v-model="task.done" />
            <span :class="[task.done ? 'done' : '', task.priority]">
              {{ task.text }} ({{ task.category }})
            </span>
            <button @click="removeTask(index)">削除</button>
          </li>
        </ul>
      </section>

      <section v-if="activeTab === 'all-tasks'" class="all-tasks-section">
        <h2>タスク一覧</h2>
        
        <section class="todo-input">
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
          <button @click="addTask">タスクを追加</button>
        </section>

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
            <span v-if="!task.isEditing" :class="[task.done ? 'done' : '', task.priority]" @dblclick="editTask(task)">
              {{ task.text }} ({{ task.category }})
            </span>
            <input v-if="task.isEditing" v-model="task.text" @keyup.enter="finishEdit(task)" @blur="finishEdit(task)" />
            <button @click="removeTask(index)">削除</button>
          </li>
        </ul>
      </section>

      <section v-if="activeTab === 'character'" class="character-customization">
        <h2>キャラクター設定</h2>
        <div class="customization-options">
          <div class="option-group">
            <h3>性格</h3>
            <select v-model="characterPersonality">
              <option value="元気系">元気系</option>
              <option value="癒し系">癒し系</option>
              <option value="クール系">クール系</option>
              <option value="ツンデレ系">ツンデレ系</option>
              <option value="オタク共感系">オタク共感系</option>
            </select>
          </div>
          <div class="option-group">
            <h3>髪型</h3>
            <select v-model="characterHairstyle">
              <option value="ロング">ロング</option>
              <option value="ボブ">ボブ</option>
              <option value="ショート">ショート</option>
              <option value="ツイン">ツイン</option>
            </select>
          </div>
          <div class="option-group">
            <h3>服装</h3>
            <select v-model="characterOutfit">
              <option value="元気カジュアル系">元気カジュアル系</option>
              <option value="かわいめスポーティ系">かわいめスポーティ系</option>
              <option value="ナチュラル親しみ系">ナチュラル親しみ系</option>
            </select>
          </div>
          <div class="option-group">
            <h3>小物</h3>
            <select v-model="characterAccessory">
              <option value="なし">なし</option>
              <option value="メガネ">メガネ</option>
              <option value="イヤホン">イヤホン</option>
            </select>
          </div>
        </div>
      </section>

      <section v-if="activeTab === 'categories'" class="category-management">
        <h2>カテゴリ管理</h2>
        <div class="category-input">
          <input type="text" v-model="newCategoryName" placeholder="新しいカテゴリ名" />
          <button @click="addCategory">追加</button>
        </div>
        <ul class="category-list">
          <li v-for="category in categories" :key="category">
            {{ category }}
            <button @click="removeCategory(category)">削除</button>
          </li>
        </ul>
      </section>

      <section v-if="activeTab === 'notifications'" class="notifications-list">
        <h2>通知 ({{ unreadCount }})</h2>
        <div v-if="notifications.length === 0" class="no-notes">
          通知はありません。
        </div>
        <ul v-else>
          <li v-for="note in notifications" :key="note.id" :class="{ 'unread': !note.read }">
            {{ note.message }}
            <span class="timestamp">{{ new Date(note.timestamp).toLocaleTimeString() }}</span>
          </li>
        </ul>
        <button @click="markAllAsRead" v-if="unreadCount > 0">すべて既読にする</button>
      </section>
    </main>

    <nav class="bottom-nav">
      <button @click="activeTab = 'tasks'" :class="{ 'active': activeTab === 'tasks' }">
        <i class="fas fa-home"></i>
        <span>ホーム</span>
      </button>
      <button @click="activeTab = 'all-tasks'" :class="{ 'active': activeTab === 'all-tasks' }">
        <i class="fas fa-list-ul"></i>
        <span>タスク一覧</span>
      </button>
      <button @click="activeTab = 'character'" :class="{ 'active': activeTab === 'character' }">
        <i class="fas fa-user-circle"></i>
        <span>キャラクター</span>
      </button>
      <button @click="activeTab = 'categories'" :class="{ 'active': activeTab === 'categories' }">
        <i class="fas fa-tags"></i>
        <span>カテゴリ</span>
      </button>
      <button @click="activeTab = 'notifications'" :class="{ 'active': activeTab === 'notifications' }">
        <i class="fas fa-bell"></i>
        <span>通知</span>
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import '../assets/home.css'
import { ref, computed, watch, onMounted } from 'vue'
import Live2DView from './Live2DView.vue'

// --- タスクデータ ---
const newTask = ref('')
const newPriority = ref('low')
const newCategory = ref('仕事')
const newDueDate = ref(new Date().toISOString().substr(0,10))
const tasks = ref([])

// --- カテゴリデータ ---
const categories = ref(['仕事', '勉強', '趣味', '未分類'])
const newCategoryName = ref('')

// --- 通知データ ---
const notifications = ref([])

// --- キャラクターデータ ---
const characterPersonality = ref('元気系')
const characterHairstyle = ref('ロング')
const characterOutfit = ref('元気カジュアル系')
const characterAccessory = ref('なし')

// --- UIの状態管理 ---
const activeTab = ref('tasks') // 初期表示を「本日のタスク」に設定

// --- フィルターと検索データ ---
const filterStatus = ref('all')
const filterPriority = ref('all')
const filterCategory = ref('all')
const searchText = ref('')

// --- 通知UIの状態とロジック ---
const unreadCount = computed(() => {
  return notifications.value.filter(note => !note.read).length
})

function addNotification(message) {
  const newNotification = {
    id: Date.now(),
    message: message,
    read: false,
    timestamp: new Date()
  }
  notifications.value.unshift(newNotification)
}

function markAllAsRead() {
  notifications.value.forEach(note => note.read = true)
}

// --- タスクのフィルター ---
const filteredTodayTasks = computed(() => {
  const today = new Date().toISOString().substr(0,10);
  return tasks.value.filter(task => task.dueDate === today);
})

const filteredAllTasks = computed(() => {
  return tasks.value.filter(task => {
    if (searchText.value && !task.text.toLowerCase().includes(searchText.value.toLowerCase())) {
      return false
    }
    if (filterStatus.value !== 'all') {
      if (filterStatus.value === 'active' && task.done) return false
      if (filterStatus.value === 'done' && !task.done) return false
    }
    if (filterPriority.value !== 'all' && task.priority !== filterPriority.value) {
      return false
    }
    if (filterCategory.value !== 'all' && task.category !== filterCategory.value) {
      return false
    }
    return true
  })
})

// --- ローカルストレージ ---
onMounted(() => {
  const savedTasks = localStorage.getItem('tasks')
  const savedCategories = localStorage.getItem('categories')
  const savedNotifications = localStorage.getItem('notifications')
  const savedCharacter = localStorage.getItem('character')

  if (savedTasks) tasks.value = JSON.parse(savedTasks)
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
  
  setInterval(checkDueDates, 30000)
})

watch(tasks, (val) => {
  localStorage.setItem('tasks', JSON.stringify(val))
}, { deep: true })

watch(categories, (val) => {
  localStorage.setItem('categories', JSON.stringify(val))
}, { deep: true })

watch(notifications, (val) => {
  localStorage.setItem('notifications', JSON.stringify(val))
}, { deep: true })

watch([characterPersonality, characterHairstyle, characterOutfit, characterAccessory], (val) => {
  const characterData = {
    personality: val[0],
    hairstyle: val[1],
    outfit: val[2],
    accessory: val[3]
  }
  localStorage.setItem('character', JSON.stringify(characterData))
}, { deep: true })

// --- タスク操作 ---
function addTask() {
  if(!newTask.value.trim()) return
  tasks.value.push({
    text: newTask.value,
    done: false,
    priority: newPriority.value,
    category: newCategory.value,
    dueDate: newDueDate.value,
    isEditing: false
  })
  newTask.value = ''
}

function removeTask(index) {
  tasks.value.splice(index,1)
}

// --- カテゴリ操作 ---
function addCategory() {
  if (newCategoryName.value.trim() && !categories.value.includes(newCategoryName.value.trim())) {
    categories.value.push(newCategoryName.value.trim())
    newCategoryName.value = ''
  }
}

function removeCategory(categoryToRemove) {
  if (!confirm(`カテゴリ「${categoryToRemove}」と、それに属するすべてのタスクを「未分類」に変更します。よろしいですか？`)) {
    return
  }
  
  categories.value = categories.value.filter(c => c !== categoryToRemove)
  tasks.value.forEach(task => {
    if (task.category === categoryToRemove) {
      task.category = '未分類'
    }
  })
  if (newCategory.value === categoryToRemove) {
    newCategory.value = '未分類'
  }
}

// --- 編集 ---
function editTask(task) { task.isEditing = true }
function finishEdit(task) { task.isEditing = false }

// --- 期限チェック ---
function checkDueDates() {
  const now = new Date()
  const today = now.toISOString().substr(0, 10)
  
  const existingNotifications = notifications.value.map(n => n.message)

  tasks.value.forEach(task => {
    const notificationMessage = `タスク "${task.text}" の期限は本日です。`
    if (!task.done && task.dueDate === today && !existingNotifications.includes(notificationMessage)) {
      addNotification(notificationMessage)
    }
  })
}

// --- キャラクター表情 ---
const getEmotion = computed(() => {
  const completed = tasks.value.filter(t => t.done).length
  if(completed === 0) return 'idle'
  if(completed < tasks.value.length) return 'smile'
  return 'celebrate'
})

// --- メッセージ ---
const characterMessage = computed(() => {
  const left = tasks.value.filter(t => !t.done).length
  if(left === 0) return '全部終わったね！えらい！🎉'
  if(left < 3) return 'あとちょっと！がんばろう💪'
  return '一緒にがんばろう！✨'
})
</script>