<template>
  <div class="view-container">
    
    <div class="split-background">
      <div class="task-area">
        <h2 class="pane-title">📝 本日のタスク</h2>
        <div class="task-scroll-area">
          <div v-if="filteredTodayTasks.length === 0" class="no-tasks">タスクなし</div>
          <ul class="notebook-list">
            <li v-for="(task, index) in filteredTodayTasks" :key="index" class="notebook-item">
              <label class="checkbox-wrapper">
                <input type="checkbox" v-model="task.done" class="hidden-checkbox" />
                <span class="custom-checkmark"></span>
              </label>
              
              <span 
                class="task-text" 
                :class="[
                  { 'is-done': task.done },
                  `marker-${task.priority || 'medium'}`
                ]"
                @click="openDetail(task)"
              >
                {{ task.text }}
              </span>
              
              <button @click.stop="removeTask(index)" class="delete-icon-btn">×</button>
            </li>
          </ul>
        </div>
      </div>

      <div class="char-background"></div>
    </div>

    <div class="character-layer">
      <Live2DView 
        :emotion="getEmotion"
        :personality="characterPersonality"
        :front-hairstyle="characterFrontHairstyle"
        :back-hairstyle="characterBackHairstyle"
        :eyes="characterEyes"
        class="live2d-model"
      />
      
      <div class="bubble">
        {{ displayMessage }}
      </div>
    </div>

    <TaskDetailModal 
      v-if="selectedTask" 
      :task="selectedTask" 
      @close="selectedTask = null" 
    />

  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue'
import Live2DView from './Live2DView.vue'
import TaskDetailModal from './TaskDetailModal.vue'

const { tasks, removeTask } = inject('task-data')
const { 
  characterPersonality,
  characterFrontHairstyle,
  characterBackHairstyle,
  characterEyes
} = inject('character-data')

const showCompleteEffect = ref(false)
const showResumeEffect = ref(false) // チェックを外した時の反応用は残します
const selectedTask = ref(null)

// ★削除: 起動時の強制フラグ isStartingUp を削除しました

const filteredTodayTasks = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return tasks.value ? tasks.value.filter(t => t.dueDate === today) : []
})

const personalityKey = computed(() => {
  if (characterPersonality.value === '元気系') return 'genki'
  if (characterPersonality.value === 'クール系') return 'cool'
  return 'heal'
})

const normalMessageMap = {
  genki: { many: '全力でいこー！🔥', few: 'あとちょっと！💪', done: '完了！お疲れ！🎉' },
  cool: { many: '計画通りに。', few: 'もう少しだね。', done: '完了。お疲れ。' },
  heal: { many: '無理しないでね…？', few: 'あと少し…☕', done: 'お疲れさま…✨' }
}

const leftCount = computed(() => filteredTodayTasks.value.filter(t => !t.done).length)

const displayMessage = computed(() => {
  const key = personalityKey.value
  const msg = normalMessageMap[key]
  if (leftCount.value === 0 && filteredTodayTasks.value.length > 0) return msg.done
  if (leftCount.value < 3 && leftCount.value > 0) return msg.few
  return msg.many
})

// ★ モーション決定ロジック
const getEmotion = computed(() => {
  // 1. タスク全完了 (Celebrate)
  if (showCompleteEffect.value || (filteredTodayTasks.value.length > 0 && leftCount.value === 0)) {
    return 'celebrate'
  }

  // 2. タスク再開時 (Cheer)
  // チェックを外した時だけ応援します（起動時はここに入らない）
  if (showResumeEffect.value) {
    return 'cheer'
  }

  // 3. 通常時 (Idle)
  // 起動時はここになります
  return 'idle'
})

const openDetail = (task) => {
  selectedTask.value = task
}

watch(() => filteredTodayTasks.value.map(t => t.done), (newVal, oldVal) => {
  if (!oldVal) return

  // ケースA: 全て完了になった時 -> Celebrate
  if (newVal.length > 0 && newVal.every(v => v) && oldVal.some(v => !v)) {
    showCompleteEffect.value = true
    setTimeout(() => { showCompleteEffect.value = false }, 2500)
  }

  // ケースB: 完了状態から、未完了に戻った時 -> Cheer
  if (newVal.length > 0 && oldVal.every(v => v) && newVal.some(v => !v)) {
    showResumeEffect.value = true
    setTimeout(() => { showResumeEffect.value = false }, 2500)
  }
}, { deep: true })

// ★削除: onMounted での強制Cheer処理も削除しました
</script>

<style scoped>
/* スタイルは変更なし */
.view-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.split-background {
  display: flex;
  width: 100%;
  height: 100%;
}

.task-area {
  flex: 1; 
  background: #fff;
  padding: 60px 0 0 0;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.char-background {
  flex: 1; 
  background: linear-gradient(180deg, #FFE0B2 0%, #FFFFFF 100%);
}

.character-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none; 
}

.live2d-model {
  position: absolute;
  bottom: 0;
  left: 75%; 
  transform: translateX(-54%) scale(1.1);
  width: auto;
  height: 100%;
}

.bubble {
  position: absolute;
  top: 60%;
  right: 5%;
  width: 150px;
  background: #fff;
  padding: 12px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  font-size: 0.85rem;
  font-weight: bold;
  animation: float 3s infinite;
  z-index: 20;
}

.pane-title { position: absolute; top: 20px; left: 20px; font-size: 1.3rem; font-weight: bold; }
.task-scroll-area { padding-top: 10px; flex: 1; overflow-y: auto; padding: 0; }
.notebook-list { list-style: none; padding: 0; margin: 0; }

.notebook-item { 
  display: flex; 
  align-items: flex-start; 
  padding: 15px 20px; 
  margin-top: 10px; 
  border-bottom: 1px solid #f5f5f5; 
  gap: 15px; 
  pointer-events: auto; 
}

.checkbox-wrapper { display: flex; align-items: center; cursor: pointer; flex-shrink: 0; margin-top: 2px; }
.hidden-checkbox { display: none; }
.custom-checkmark { width: 20px; height: 20px; border: 2px solid #ddd; border-radius: 4px; position: relative; transition: all 0.2s; }
.hidden-checkbox:checked + .custom-checkmark { background-color: #ff8c00; border-color: #ff8c00; }
.hidden-checkbox:checked + .custom-checkmark::after { content: '✓'; position: absolute; color: white; font-size: 14px; font-weight: bold; top: 50%; left: 50%; transform: translate(-50%, -50%) ; }

.task-text { 
  flex: 1; 
  font-size: 1rem; 
  line-height: 1.5; 
  color: #333; 
  word-break: break-all; 
  white-space: pre-wrap; 
  transition: all 0.3s;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
}

.marker-high { background: linear-gradient(transparent 60%, #ffcccc 60%); }
.marker-medium { background: linear-gradient(transparent 60%, #fff4b3 60%); }
.marker-low { background: linear-gradient(transparent 60%, #ccf0ff 60%); }

.is-done { 
  text-decoration: line-through; 
  color: #bbb; 
  background: none; 
}

.delete-icon-btn { background: none; border: none; color: #ddd; font-size: 1.5rem; cursor: pointer; flex-shrink: 0; line-height: 1; padding: 0 5px; pointer-events: auto; }
.delete-icon-btn:hover { color: #ff5252; }
.no-tasks { padding: 40px; text-align: center; color: #bbb; }

@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
</style>