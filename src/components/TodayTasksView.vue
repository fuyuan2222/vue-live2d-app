<template>
  <div class="split-container" :class="currentFocus">
    <!-- 左：タスク -->
    <div class="task-pane pane" @click="setFocus('tasks')">
      <h2 class="pane-title">本日のタスク</h2>

      <div class="task-scroll-area">
        <div v-if="filteredTodayTasks.length === 0" class="no-tasks">
          タスクなし
        </div>

        <ul class="task-list">
          <li v-for="(task, index) in filteredTodayTasks" :key="task.id">
            <input
              type="checkbox"
              v-model="task.done"
              @click.stop
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
        {{ displayMessage }}
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

/* フォーカス切替 */
const setFocus = (target) => {
  currentFocus.value = currentFocus.value === target ? 'neutral' : target
}

/* 今日のタスク */
const filteredTodayTasks = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return tasks.value.filter(t => t.dueDate === today)
})

/* 性格キー */
const personalityKey = computed(() => {
  switch (characterPersonality.value) {
    case '元気系': return 'genki'
    case '癒し系': return 'heal'
    case 'クール系': return 'cool'
    default: return 'genki'
  }
})

/* セリフ定義 */
const normalMessageMap = {
  genki: {
    many: '今日も全力でいこー！🔥',
    few: 'あとちょっと！ファイト！💪',
    done: '完了！お疲れ様！！🎉'
  },
  cool: {
    many: '計画通り進めよう。',
    few: '終わりが見えてきたな。',
    done: '完了だ。'
  },
  heal: {
    many: '無理しすぎないでね🌱',
    few: 'あと少し…一緒に頑張ろ☕',
    done: '全部できたね、お疲れさま…✨'
  }
}

const completeMessageMap = {
  genki: 'ぜんぶ終わったー！！最高！！🎉✨',
  cool: '全タスク完了。よくやった。',
  heal: '全部できたね…今日はゆっくりしよ☕'
}

/* 残タスク数 */
const leftCount = computed(() =>
  tasks.value.filter(t => !t.done).length
)

/* 表示セリフ（ここが最重要） */
const displayMessage = computed(() => {
  const key = personalityKey.value

  if (showCompleteEffect.value) {
    return completeMessageMap[key]
  }

  const msg = normalMessageMap[key]
  if (leftCount.value === 0) return msg.done
  if (leftCount.value < 3) return msg.few
  return msg.many
})

/* Live2D 感情 */
const getEmotion = computed(() => {
  if (showCompleteEffect.value) return 'celebrate'
  if (tasks.value.length === 0) return 'idle'
  if (leftCount.value === 0) return 'celebrate'
  if (leftCount.value < tasks.value.length) return 'smile'
  return 'idle'
})

/* 全タスク完了の瞬間検知 */
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
/* レイアウト */
.split-container {
  display: flex;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  background: #fff;
}

.pane {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: flex 0.5s cubic-bezier(0.2, 0, 0, 1);
}

/* タスク */
.task-pane {
  padding-top: 60px;
}

.pane-title {
  position: absolute;
  top: 20px;
  left: 10px;
}

.task-scroll-area {
  flex: 1;
  padding: 20px 20px 100px;
  overflow-y: auto;
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-list li {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  padding: 14px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 5px solid #FFB74D;
}

.done {
  text-decoration: line-through;
  color: #bbb;
}

/* キャラ */
.char-pane {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  background: linear-gradient(180deg, #FFE0B2 0%, #FFFFFF 100%);
  overflow: visible; 
}

/* フォーカス */
.split-container.tasks .task-pane { flex: 8; }
.split-container.tasks .char-pane { flex: 2; }

.split-container.char .char-pane { flex: 8; }
.split-container.char .task-pane { flex: 2; }

/* Live2D */
.live2d-model {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scale(1.2);
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 吹き出し */
.bubble {
  position: absolute;
  top: 70%;
  right: 10%;
  width: 220px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  animation: float 3s ease-in-out infinite;
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

/* 完了演出 */
.complete-effect {
  animation: pop 0.4s ease-out,
             glow 1.5s ease-in-out infinite;
}

@keyframes float {
  0%,100% { transform: translateY(0); }
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
