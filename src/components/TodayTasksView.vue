<template>
  <div class="app-root">
    <!-- 左：タスク -->
    <div class="task-pane">
      <h2 class="pane-title">本日のタスク</h2>

      <div class="task-scroll-area">
        <div v-if="filteredTodayTasks.length === 0" class="no-tasks">
          タスクなし
        </div>

        <ul class="task-list">
          <li v-for="(task, index) in filteredTodayTasks" :key="task.id">
            <input type="checkbox" v-model="task.done" />
            <span class="task-text" :class="{ done: task.done }">
              {{ task.text }}
            </span>
            <button class="del-btn" @click="removeTask(index)">×</button>
          </li>
        </ul>
      </div>
    </div>

    <!-- 右下固定：キャラ -->
    <div class="character-layer">
      <Live2DView
        :emotion="getEmotion"
        class="live2d-model"
      />

      <div class="bubble" :class="{ 'complete-effect': showCompleteEffect }">
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
const showCompleteEffect = ref(false)

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

/* セリフ */
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

/* 表示メッセージ */
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

/* Live2D感情 */
const getEmotion = computed(() => {
  if (showCompleteEffect.value) return 'celebrate'
  if (tasks.value.length === 0) return 'idle'
  if (leftCount.value === 0) return 'celebrate'
  if (leftCount.value < tasks.value.length) return 'smile'
  return 'idle'
})

/* 全完了演出 */
watch(
  () => tasks.value.map(t => t.done),
  (newVal, oldVal) => {
    const wasAllDone = oldVal?.length && oldVal.every(v => v)
    const isAllDone = newVal.length && newVal.every(v => v)

    if (!wasAllDone && isAllDone) {
      showCompleteEffect.value = true
      setTimeout(() => {
        showCompleteEffect.value = false
      }, 2500)
    }
  }
)
</script>
<style>
  /* 全体 */
.app-root {
  width: 100%;
  height: 100dvh;
  background: #fff;
  position: relative;
  overflow: hidden;
}

/* ===== タスク ===== */
.task-pane {
  width: 50%;
  height: 100%;
  padding-top: 60px;
}

.pane-title {
  position: absolute;
  top: 20px;
  left: 20px;
}

.task-scroll-area {
  height: 100%;
  padding: 20px 20px 120px;
  overflow-y: auto;
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
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 5px solid #FFB74D;
}

.done {
  text-decoration: line-through;
  color: #bbb;
}

.del-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

/* ===== キャラ（画面固定） ===== */
.character-layer {
  position: fixed;
  right: 0;
  bottom: 0;
  width: 50vw;
  height: 100vh;
  pointer-events: none;
  background: linear-gradient(180deg, #FFE0B2 0%, #FFFFFF 100%);
}

/* Live2D */
.live2d-model {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scale(1.6);
  width: 100%;
  height: 100%;
}

/* 吹き出し */
.bubble {
  position: absolute;
  bottom: 45%;
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