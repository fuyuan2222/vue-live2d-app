<template>
  <div class="split-container" :class="currentFocus">
    
    <div class="task-pane pane" @click="setFocus('tasks')">
      <div class="pane-content">
        <h2 class="pane-title">📝 本日のタスク</h2>
        
        <div class="inactive-label" v-if="currentFocus === 'char'">
          <span>TAP TO OPEN</span>
        </div>

        <div class="task-scroll-area">
          <div v-if="filteredTodayTasks.length === 0" class="no-tasks">
            タスクなし
          </div>
          <ul class="task-list">
            <li v-for="(task, index) in filteredTodayTasks" :key="index">
              <input type="checkbox" v-model="task.done" @click.stop />
              <span :class="[task.done ? 'done' : '', task.priority]">
                {{ task.text }}
              </span>
              <button @click.stop="removeTask(index)" class="del-btn">×</button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="char-pane pane" @click="setFocus('char')">
      <div class="pane-content">
        <Live2DView 
          :emotion="getEmotion"
          class="live2d-model"
        />
        
        <div class="bubble" v-if="currentFocus !== 'tasks'">
          {{ characterMessage }}
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import Live2DView from './Live2DView.vue'

const { tasks, removeTask } = inject('task-data')

// ★修正点1: 初期状態を 'neutral' (半々) に設定
const currentFocus = ref('neutral')

// ★修正点2: トグル機能（同じものを押したら元に戻す）を追加
const setFocus = (target) => {
  if (currentFocus.value === target) {
    // すでに開いている方をタップしたら、ニュートラルに戻す
    currentFocus.value = 'neutral'
  } else {
    // 違う方をタップしたら、そっちを開く
    currentFocus.value = target
  }
}

const filteredTodayTasks = computed(() => {
  const today = new Date().toISOString().substr(0, 10)
  return tasks.value.filter(task => task.dueDate === today)
})

const getEmotion = computed(() => {
  const completed = tasks.value.filter(t => t.done).length
  if (tasks.value.length === 0) return 'idle'
  if (completed === tasks.value.length) return 'celebrate'
  if (completed > 0) return 'smile'
  return 'idle'
})

const characterMessage = computed(() => {
  const left = tasks.value.filter(t => !t.done).length
  if (left === 0) return '全部終わったね！えらい！🎉'
  if (left < 3) return 'あとちょっと！'
  return '一緒にがんばろう！✨'
})
</script>
<style scoped>
/* コンテナ：余白ゼロで画面いっぱいに */
.split-container {
  display: flex;
  width: 100%;
  /* ナビゲーションバーの高さを引いた分だけ確保（調整してください） */
  height: 100%; 
  position: relative;
  /* gapとpaddingを削除して隙間をなくす */
  gap: 0; 
  padding: 0;
  overflow: hidden;
}

/* === 共通パネル設定 === */
.pane {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  /* 角丸をなくしてソリッドに */
  border-radius: 0;
  border: none; /* 枠線も消す */
  
  /* アニメーション */
  transition: all 0.5s cubic-bezier(0.2, 0, 0, 1); /* キビキビ動く */
  
  /* デフォルト(neutral) */
  flex: 1;
  opacity: 1;
  transform: scale(1);
  z-index: 1;
}

.pane-content {
  width: 100%;
  height: 100%;
  position: relative;
}

/* === 状態ごとのスタイル === */

/* --- 左：タスクパネル --- */
.task-pane {
  background: #ffffff; /* 完全な白 */
  display: flex;
  flex-direction: column;
  /* 境界線だけ引いておく */
  border-right: 1px solid rgba(0,0,0,0.1);
}

/* タスク主役：画面の9割を占める */
.split-container.tasks .task-pane {
  flex: 9; 
  z-index: 10;
}

/* タスク脇役：端っこに少しだけ残る */
.split-container.char .task-pane {
  flex: 1; 
  opacity: 0.8;
  /* 暗くして「今は触れないよ」感を出す */
  background: #f0f0f0; 
  filter: brightness(0.9);
}

/* --- 右：キャラパネル --- */
.char-pane {
  /* 背景を画面いっぱいに */
  background: linear-gradient(180deg, #e0f7fa 0%, #ffffff 100%);
}

/* キャラ主役 */
.split-container.char .char-pane {
  flex: 9;
  z-index: 10;
}

/* キャラ脇役 */
.split-container.tasks .char-pane {
  flex: 1;
  opacity: 0.8;
  filter: brightness(0.9) blur(2px); /* ぼかして奥っぽく */
}


/* === 中身のパーツ調整 === */

.pane-title {
  margin: 20px;
  font-size: 1.4rem; /* 文字も大きく */
  font-weight: bold;
  color: #333;
  white-space: nowrap;
}

.task-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 80px 20px; /* 下の方はナビゲーションと被らないように余白多め */
  scrollbar-width: none; /* スクロールバーも隠してスッキリさせる */
}
.task-scroll-area::-webkit-scrollbar {
  display: none;
}

/* 縮んだ時に中身を消す */
.split-container.char .task-scroll-area,
.split-container.char .pane-title {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.1s; /* 素早く消す */
}

/* 「TAP」の文字を大きくスタイリッシュに */
.inactive-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
  white-space: nowrap;
  font-weight: 900;
  color: #ccc;
  font-size: 1.2rem;
  letter-spacing: 5px;
  text-transform: uppercase;
}

/* Live2Dモデル：画面いっぱいに表示 */
.live2d-model {
  width: 100%;
  height: 100%;
  position: absolute;
  bottom: -5%; /* 足元を少し切るくらいで大きく見せる */
  left: 50%;
  transform: translateX(-50%) scale(1.1); /* ★1.1倍に拡大して迫力を出す */
  transition: transform 0.5s;
}

/* neutralの時は少し引く */
.split-container.neutral .live2d-model {
  transform: translateX(-50%) scale(0.9);
  bottom: 0;
}

/* 脇役の時はさらに引く */
.split-container.tasks .live2d-model {
  transform: translateX(-50%) scale(0.7);
  bottom: 10%;
}

.bubble {
  position: absolute;
  top: 15%; /* 位置調整 */
  right: 5%;
  max-width: 60%;
  background: #fff;
  padding: 15px 20px;
  border-radius: 30px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  font-size: 1rem;
  color: #333;
  font-weight: bold;
  z-index: 20;
}

/* リストアイテム */
.task-list { list-style: none; padding: 0; margin: 0; }
.task-list li {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f9f9f9;
  margin-bottom: 12px;
  padding: 15px; /* タップしやすいように大きく */
  border-radius: 12px;
  font-size: 1rem;
}
.done { text-decoration: line-through; color: #bbb; }
.del-btn { 
  margin-left: auto; 
  width: 30px; 
  height: 30px; 
  border-radius: 50%; 
  background: #eee; 
  color: #888; 
  border:none; 
  display:flex; align-items:center; justify-content:center;
}
</style>