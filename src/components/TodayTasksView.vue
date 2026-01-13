<template>
  <div class="split-container" :class="currentFocus">
    
    <div class="task-pane pane" @click="setFocus('tasks')">
      <h2 class="pane-title">📝 本日のタスク</h2>
      
      <div class="task-scroll-area">
        <div v-if="filteredTodayTasks.length === 0" class="no-tasks">
          タスクなし
        </div>
        <ul class="task-list">
          <li v-for="(task, index) in filteredTodayTasks" :key="index">
            <input type="checkbox" v-model="task.done" @click.stop class="custom-checkbox" />
            <span class="task-text" :class="[task.done ? 'done' : '', task.priority]">
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

    <div class="char-pane pane" @click="setFocus('char')">
      <Live2DView 
        :emotion="getEmotion"
        :personality="characterPersonality"
        :front-hairstyle="characterFrontHairstyle"
        :back-hairstyle="characterBackHairstyle"
        :eyes="characterEyes"
        class="live2d-model"
      />
      
      <div class="bubble" v-if="currentFocus !== 'tasks'">
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
// ★ここ修正：性格以外に、髪型や目のデータも受け取る
const { 
  characterPersonality,
  characterFrontHairstyle,
  characterBackHairstyle,
  characterEyes
} = inject('character-data')

/* state */
const showCompleteEffect = ref(false)

// // ★ここ修正：消えていた変数を復活させました！これがないと動きません！
// const currentFocus = ref('neutral') 
// const setFocus = (target) => {
//   currentFocus.value = target
// }

/* 今日のタスク */
const filteredTodayTasks = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return tasks.value ? tasks.value.filter(t => t.dueDate === today) : []
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
  tasks.value ? tasks.value.filter(t => !t.done).length : 0
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
  if (!tasks.value) return 'idle'
  if (showCompleteEffect.value) return 'celebrate'
  if (tasks.value.length === 0) return 'idle'
  if (leftCount.value === 0) return 'celebrate'
  if (leftCount.value < tasks.value.length) return 'smile'
  return 'idle'
})

/* 全完了演出 */
watch(
  () => tasks.value ? tasks.value.map(t => t.done) : [],
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

<style scoped>
/* 全体コンテナ */
.split-container {
  display: flex;
  width: 100%;
  height: 100dvh; /* スマホのアドレスバー対策 */
  position: relative;
  overflow: hidden; /* はみ出しはここでカット */
  background-color: #ffffff;
}

/* 共通パネル設定 */
.pane {
  flex: 1; /* 基本は1:1 */
  position: relative;
  transition: all 0.5s cubic-bezier(0.2, 0, 0, 1);
  display: flex;
  flex-direction: column;
}

/* === 左：タスクパネル === */
.task-pane {
  background: #ffffff;
  padding-top: 60px; /* タイトル位置調整 */
}

/* === 右：キャラパネル === */
.char-pane {
  background: #ffffff;
  /* 中身（Live2Dと吹き出し）の位置基準にする */
  display: flex;
  justify-content: center;
  align-items: flex-end; /* 下揃え */
}

/* 動作ごとのスタイル変化 */

/* [Neutral] 半々 */
.split-container.neutral .char-pane {
  /* ここに背景画像を指定すると半々の時だけ表示されます */
  background: linear-gradient(180deg, #FFE0B2 0%, #FFFFFF 100%);
}

/* [Tasks] タスク主役 */
.split-container.tasks .task-pane { flex: 8; }
.split-container.tasks .char-pane {
  flex: 2;
  background: #FFCC80; /* 縮んだ時の色 */
  cursor: pointer;
}

/* [Char] キャラ主役 */
.split-container.char .char-pane {
  flex: 8;
  background: linear-gradient(180deg, #FFE0B2 0%, #FFFFFF 100%);
}
.split-container.char .task-pane {
  flex: 2;
  background: #f5f5f5;
  cursor: pointer;
}

/* === Live2D === */
.live2d-model {
  position: absolute;
  bottom: 0;
  /* 親(.char-pane)の真ん中に配置 */
  left: 50%;
  transform: translateX(-50%) scale(1.15);
  
  width: 100%; /* 親の幅に合わせる */
  height: 100%;
  
  transition: transform 0.5s, opacity 0.3s;
  pointer-events: none;
  z-index: 10;
}

/* 状態ごとのキャラ調整 */
.split-container.char .live2d-model {
  transform: translateX(-50%) scale(1.4) translateY(10%); /* 大きく */
}
.split-container.tasks .live2d-model {
  transform: translateX(-50%) scale(0.6); /* 小さく */
  opacity: 0.6;
}

/* === 吹き出し === */
.bubble {
  position: absolute; /* 親(char-pane)に対して絶対配置 */
  top: 70%;
  right: 10%; /* 右端からの距離 */
  width: 200px;
  background: #ffffff;
  padding: 15px 20px;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  
  font-size: 0.9rem;
  font-weight: bold;
  color: #333;
  z-index: 20;
  
  /* ふわふわアニメーション */
  animation: float 3s ease-in-out infinite;
}
/* 吹き出しのしっぽ */
.bubble::after {
  content: '';
  position: absolute;
  top: -10px;
  right: 30px;
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: transparent transparent #fff transparent;
}

/* === タスクリストまわり === */
.pane-title {
  position: absolute;
  top: 20px;
  left: 20px;
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.task-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 100px; /* 下部余白 */
}
/* スクロールバー消し */
.task-scroll-area::-webkit-scrollbar { display: none; }

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.task-list li {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8f9fa;
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 12px;
  border-left: 5px solid #FFB74D;
}
.task-text { flex: 1; color: #333; }
.done { text-decoration: line-through; color: #bbb; }
.del-btn { border: none; background: transparent; font-size: 1.2rem; color: #999; }

/* 縮んだ時にタスクの中身を消す */
.split-container.char .task-scroll-area,
.split-container.char .pane-title {
  opacity: 0;
  pointer-events: none;
}

/* OPENラベル */
.inactive-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
  font-weight: 900;
  color: #ccc;
  letter-spacing: 4px;
  white-space: nowrap;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style>