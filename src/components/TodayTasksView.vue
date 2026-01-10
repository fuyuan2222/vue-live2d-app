<template>
  <div class="split-container" :class="currentFocus">
    <!-- 左：タスク -->
    <div class="task-pane pane" @click="setFocus('tasks')">
      <h2 class="pane-title">📝 本日のタスク</h2>

      <div class="task-scroll-area">
        <div v-if="filteredTodayTasks.length === 0" class="no-tasks">
          タスクなし
        </div>

        <ul class="task-list">
          <li v-for="(task, index) in filteredTodayTasks" :key="index">
            <input
              type="checkbox"
              v-model="task.done"
              @click.stop
              class="custom-checkbox"
            />
            <span class="task-text" :class="{ done: task.done }">
              {{ task.text }}
            </span>
            <button @click.stop="removeTask(index)" class="del-btn">×</button>
          </li>
        </ul>
      </div>

      <div class="inactive-label" v-if="currentFocus === 'char'">
        <span>OPEN</span>
      </div>
    </div>

    <!-- 右：キャラ -->
    <div class="char-pane pane" @click="setFocus('char')">
      <Live2DView :emotion="getEmotion" class="live2d-model" />

      <div
        v-if="currentFocus !== 'tasks'"
        class="bubble"
        :class="{ 'complete-effect': showCompleteEffect }"
      >
        {{ showCompleteEffect ? completeMessage : characterMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue'
import Live2DView from './Live2DView.vue'

/* inject */
const { tasks, removeTask } = inject('task-data')
const { characterPersonality } = inject('character-data')

/* state */
const currentFocus = ref('neutral')
const showCompleteEffect = ref(false)

/* focus */
const setFocus = (target) => {
  currentFocus.value = currentFocus.value === target ? 'neutral' : target
}

/* 今日のタスク */
const filteredTodayTasks = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return tasks.value.filter(t => t.dueDate === today)
})

/* 性格キー変換 */
const personalityKey = computed(() => {
  switch (characterPersonality.value) {
    case '元気系': return 'genki'
    case '癒し系': return 'heal'
    case 'クール系': return 'cool'
    default: return 'genki'
  }
})

/* 通常セリフ */
const characterMessage = computed(() => {
  const left = tasks.value.filter(t => !t.done).length
  if (left === 0) return '完了！お疲れ様🎉'
  if (left < 3) return 'あと少しだよ！'
  return '今日も頑張ろう✨'
})

/* 完了時専用セリフ */
const completeMessageMap = {
  genki: 'ぜんぶ終わったー！！最高！！🎉✨',
  cool: '全タスク完了。よくやった。',
  heal: '全部できたね…今日はゆっくりしよ☕'
}

const completeMessage = computed(() => {
  return completeMessageMap[personalityKey.value]
})

/* Live2D感情 */
const getEmotion = computed(() => {
  if (showCompleteEffect.value) return 'celebrate'

  const completed = tasks.value.filter(t => t.done).length
  if (tasks.value.length === 0) return 'idle'
  if (completed === tasks.value.length) return 'celebrate'
  if (completed > 0) return 'smile'
  return 'idle'
})

/* 全タスク完了の瞬間を検知 */
watch(
  () => tasks.value.map(t => t.done),
  (newVal, oldVal) => {
    const wasAllDone = oldVal?.length && oldVal.every(v => v)
    const isAllDone = newVal.length && newVal.every(v => v)

    if (!wasAllDone && isAllDone) {
      triggerCompleteEffect()
    }
  }
)

const triggerCompleteEffect = () => {
  showCompleteEffect.value = true
  setTimeout(() => {
    showCompleteEffect.value = false
  }, 2500)
}
</script>

<style scoped>
/* 全体 */
.split-container {
  display: flex;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: #fff;
}

/* 共通 */
.pane {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: flex 0.5s cubic-bezier(0.2, 0, 0, 1),
              background 0.3s;
}

/* タスク */
.task-pane {
  padding-top: 60px;
  background: #fff;
}

.pane-title {
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 1.2rem;
}

.task-scroll-area {
  flex: 1;
  padding: 20px 20px 100px;
  overflow-y: auto;
}

.task-scroll-area::-webkit-scrollbar {
  display: none;
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  padding: 14px;
  border-radius: 12px;
  background: #f8f9fa;
  border-left: 5px solid #FFB74D;
}

.task-text {
  flex: 1;
}

.done {
  text-decoration: line-through;
  color: #bbb;
}

.del-btn {
  border: none;
  background: none;
  font-size: 1.2rem;
  color: #999;
}

/* キャラ */
.char-pane {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  background: linear-gradient(180deg, #FFE0B2 0%, #FFFFFF 100%);
}

/* フォーカス状態 */
.split-container.tasks .task-pane { flex: 8; }
.split-container.tasks .char-pane { flex: 2; background: #FFCC80; }

.split-container.char .char-pane { flex: 8; }
.split-container.char .task-pane { flex: 2; background: #f5f5f5; }

.split-container.char .task-scroll-area,
.split-container.char .pane-title {
  opacity: 0;
  pointer-events: none;
}

/* Live2D */
.live2d-model {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scale(1.15);
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  transition: transform 0.5s, opacity 0.3s;
}

.split-container.char .live2d-model {
  transform: translateX(-50%) scale(1.4) translateY(20%);
}

.split-container.tasks .live2d-model {
  transform: translateX(-50%) scale(0.6);
  opacity: 0.6;
}

/* 吹き出し */
.bubble {
  position: absolute;
  top: 70%;
  right: 10%;
  width: 200px;
  padding: 15px 20px;
  border-radius: 20px;
  background: #fff;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  animation: float 3s ease-in-out infinite;
  z-index: 20;
}

.bubble::after {
  content: '';
  position: absolute;
  top: -10px;
  right: 30px;
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: transparent transparent #fff transparent;
}

/* 完了エフェクト */
.complete-effect {
  animation: pop 0.4s ease-out,
             glow 1.5s ease-in-out infinite;
}

/* OPEN */
.inactive-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
  font-weight: 900;
  color: #ccc;
  letter-spacing: 4px;
}

/* animations */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes pop {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes glow {
  0%,100% { box-shadow: 0 0 10px rgba(255,183,77,0.3); }
  50% { box-shadow: 0 0 25px rgba(255,152,0,0.6); }
}
</style>
