<template>
  <nav class="navigation">
    <h1 v-if="isPc" class="nav-title">ToDo☑</h1>
    
    <button @click="$emit('change-tab', 'tasks')" :class="{ 'active': activeTab === 'tasks' }">
      <svg class="custom-icon" width="28" height="28" viewBox="0 0 28 28" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.66666 22.1667V11.6667C4.66666 11.2972 4.74949 10.9472 4.91516 10.6167C5.08082 10.2861 5.3091 10.0139 5.59999 9.8L12.6 4.55C13.0083 4.23889 13.475 4.08333 14 4.08333C14.525 4.08333 14.9917 4.23889 15.4 4.55L22.4 9.8C22.6917 10.0139 22.9203 10.2861 23.086 10.6167C23.2517 10.9472 23.3341 11.2972 23.3333 11.6667V22.1667C23.3333 22.8083 23.1047 23.3578 22.6473 23.8152C22.19 24.2725 21.6409 24.5008 21 24.5H17.5C17.1694 24.5 16.8925 24.388 16.6693 24.164C16.4461 23.94 16.3341 23.6631 16.3333 23.3333V17.5C16.3333 17.1694 16.2213 16.8926 15.9973 16.6693C15.7733 16.4461 15.4964 16.3341 15.1667 16.3333H12.8333C12.5028 16.3333 12.2259 16.4453 12.0027 16.6693C11.7794 16.8933 11.6674 17.1702 11.6667 17.5V23.3333C11.6667 23.6639 11.5547 23.9412 11.3307 24.1652C11.1067 24.3892 10.8298 24.5008 10.5 24.5H6.99999C6.35832 24.5 5.80921 24.2717 5.35266 23.8152C4.8961 23.3586 4.66743 22.8091 4.66666 22.1667Z" fill="currentColor"/>
      </svg>
      <span class="nav-text">ホーム</span>
    </button>
    
    <button @click="$emit('change-tab', 'all-tasks')" :class="{ 'active': activeTab === 'all-tasks' }">
      <svg class="custom-icon" width="27" height="27" viewBox="0 0 27 27" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.8363 8.33625L16.4025 2.9025C15.9862 2.48625 15.4125 2.25 14.8162 2.25H6.75C5.5125 2.25 4.51125 3.2625 4.51125 4.5L4.5 22.5C4.5 23.7375 5.50125 24.75 6.73875 24.75H20.25C21.4875 24.75 22.5 23.7375 22.5 22.5V9.93375C22.5 9.3375 22.2638 8.76375 21.8363 8.33625ZM11.5087 19.4513L9.12375 17.0662C9.0196 16.9621 8.93698 16.8384 8.88061 16.7024C8.82424 16.5663 8.79523 16.4204 8.79523 16.2731C8.79523 16.1258 8.82424 15.98 8.88061 15.8439C8.93698 15.7078 9.0196 15.5842 9.12375 15.48C9.2279 15.3758 9.35155 15.2932 9.48764 15.2369C9.62372 15.1805 9.76958 15.1515 9.91687 15.1515C10.0642 15.1515 10.21 15.1805 10.3461 15.2369C10.4822 15.2932 10.6058 15.3758 10.71 15.48L12.2963 17.0662L16.2788 13.0837C16.3829 12.9796 16.5066 12.897 16.6426 12.8406C16.7787 12.7842 16.9246 12.7552 17.0719 12.7552C17.2192 12.7552 17.365 12.7842 17.5011 12.8406C17.6372 12.897 17.7608 12.9796 17.865 13.0837C17.9692 13.1879 18.0518 13.3116 18.1081 13.4476C18.1645 13.5837 18.1935 13.7296 18.1935 13.8769C18.1935 14.0242 18.1645 14.17 18.1081 14.3061C18.0518 14.4422 17.9692 14.5658 17.865 14.67L13.095 19.44C12.6675 19.89 11.9475 19.89 11.5087 19.4513ZM15.75 10.125C15.1313 10.125 14.625 9.61875 14.625 9V3.9375L20.8125 10.125H15.75Z" fill="currentColor"/>
      </svg>
      <span class="nav-text">タスク一覧</span>
    </button>
    
    <button @click="$emit('change-tab', 'character')" :class="{ 'active': activeTab === 'character' }">
      <svg class="custom-icon" width="16" height="32" viewBox="0 0 16 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 17C14.2091 17 16 18.7909 16 21V28C16 30.2091 14.2091 32 12 32H4C1.79086 32 1.12747e-07 30.2091 0 28V21C0 18.7909 1.79086 17 4 17H12ZM8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0Z" fill="currentColor"/>
      </svg>
      <span class="nav-text">キャラクター</span>
    </button>
    
    <button @click="$emit('change-tab', 'categories')" :class="{ 'active': activeTab === 'categories' }">
      <svg class="custom-icon" width="25" height="25" viewBox="0 0 25 25" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.3639 1.31027C18.2026 0.471436 19.3402 0.000117221 20.5265 2.18625e-08C21.7128 -0.000117177 22.8505 0.470976 23.6894 1.30965C24.5283 2.14831 24.9996 3.28586 24.9998 4.47203C24.9999 5.65821 24.5288 6.79585 23.69 7.63468L22.575 8.75083L16.2502 2.42517L17.3639 1.31027ZM14.9252 3.75129L2.4254 16.2489C1.91733 16.7564 1.56031 17.3951 1.39417 18.0937L0.025444 23.8457C-0.0116158 24.0015 -0.00814118 24.1642 0.0355367 24.3182C0.0792145 24.4723 0.161639 24.6126 0.27495 24.7258C0.38826 24.839 0.528678 24.9212 0.682812 24.9647C0.836945 25.0083 0.999655 25.0115 1.15542 24.9743L6.90657 23.6044C7.60569 23.4385 8.2449 23.0815 8.75279 22.5733L15.3152 16.0102C14.9938 15.2141 14.9138 14.3412 15.085 13.5C15.2562 12.6589 15.6712 11.8867 16.2781 11.2796C16.8851 10.6725 17.6573 10.2575 18.4985 10.0861C19.3397 9.91466 20.2127 9.99452 21.0088 10.3157L21.2501 10.0757L14.9252 3.75129ZM22.5 14.3741C22.5 15.2028 22.1708 15.9976 21.5848 16.5836C20.9987 17.1696 20.2039 17.4988 19.3751 17.4988C18.5463 17.4988 17.7515 17.1696 17.1654 16.5836C16.5794 15.9976 16.2502 15.2028 16.2502 14.3741C16.2502 13.5453 16.5794 12.7505 17.1654 12.1645C17.7515 11.5786 18.5463 11.2493 19.3751 11.2493C20.2039 11.2493 20.9987 11.5786 21.5848 12.1645C22.1708 12.7505 22.5 13.5453 22.5 14.3741ZM25 21.0922C25 23.037 23.3925 24.9981 19.3751 24.9981C15.3577 24.9981 13.7502 23.0445 13.7502 21.0922V20.9634C13.7502 19.7386 14.7427 18.7486 15.9664 18.7486H22.7838C24.0088 18.7486 25 19.7398 25 20.9634V21.0922Z" fill="currentColor"/>
      </svg>
      <span class="nav-text">カテゴリ</span>
    </button>
    
    <button @click="$emit('change-tab', 'notifications')" :class="{ 'active': activeTab === 'notifications' }">
      <div class="icon-wrapper">
        <svg :class="['custom-icon', { 'shake-bell': unreadCount > 0 }]" width="26" height="26" viewBox="0 0 26 26" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.19999 10.4C5.19928 8.77937 5.70339 7.19875 6.64228 5.87779C7.58116 4.55682 8.9082 3.56111 10.439 3.029C10.3797 2.6576 10.4017 2.27777 10.5035 1.9157C10.6052 1.55363 10.7843 1.21795 11.0284 0.931813C11.2725 0.645679 11.5758 0.415906 11.9173 0.258346C12.2588 0.100786 12.6304 0.0191917 13.0065 0.0191917C13.3826 0.0191917 13.7542 0.100786 14.0957 0.258346C14.4372 0.415906 14.7405 0.645679 14.9846 0.931813C15.2286 1.21795 15.4077 1.55363 15.5095 1.9157C15.6113 2.27777 15.6333 2.6576 15.574 3.029C17.1023 3.56329 18.4266 4.55994 19.363 5.88072C20.2994 7.2015 20.8016 8.78094 20.8 10.4V18.2L24.7 20.8V22.1H1.29999V20.8L5.19999 18.2V10.4ZM15.6 23.4C15.6 24.0896 15.3261 24.7509 14.8385 25.2385C14.3509 25.7261 13.6896 26 13 26C12.3104 26 11.6491 25.7261 11.1615 25.2385C10.6739 24.7509 10.4 24.0896 10.4 23.4H15.6Z" fill="currentColor"/>
        </svg>
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </div>
      <span class="nav-text">通知</span>
    </button>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  activeTab: {
    type: String,
    required: true
  },
  unreadCount: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['change-tab'])
const isPc = ref(window.innerWidth >= 768)
const handleResize = () => {
  isPc.value = window.innerWidth >= 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.navigation {
  flex-shrink: 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  background-color: #ff8c00;
  padding: 10px 0;
  border-top: 1px solid #e67e00;
  box-shadow: 0 -2px 5px rgba(0,0,0,0.15);
  z-index: 1000;
}
.navigation button,
.navigation .external-link-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
  padding: 5px 10px;
  color: #fff;
  transition: color 0.3s, background-color 0.3s;
  font-size: 14px;
  font-weight: 600;
  position: relative;
  text-decoration: none;
}

.navigation button .nav-text,
.navigation .external-link-button .nav-text {
  display: none;
}


.navigation .custom-icon {
  width: 24px;
  height: 24px;
  color: #fff;
  fill: currentColor;
  margin-bottom: 0;
  transition: fill 0.3s, color 0.3s;
}

.navigation button.active {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 0;
}
.navigation button:hover,
.navigation .external-link-button:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.navigation .badge {
  background-color: #ff3b30;
  color: white;
  border-radius: 10px;
  padding: 2px 5px;
  font-size: 0.7rem;
  font-weight: bold;
  line-height: 1;
  min-width: 16px;
  text-align: center;
  
  position: absolute;
  top: -5px;
  right: -8px;
  border: 2px solid #ff8c00; 
  z-index: 10;
}

@keyframes bell-shake {
  0% { transform: rotate(0); }
  15% { transform: rotate(15deg); }
  30% { transform: rotate(-15deg); }
  45% { transform: rotate(10deg); }
  60% { transform: rotate(-10deg); }
  75% { transform: rotate(5deg); }
  85% { transform: rotate(-5deg); }
  100% { transform: rotate(0); }
}

.shake-bell {
  animation: bell-shake 2s infinite; 
  transform-origin: top center;
}

@media (min-width: 768px) {
  .navigation {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    flex-shrink: 0;
    width: 250px;
    background-color: #ff8c00;
    padding: 30px 15px;
    box-shadow: 2px 0 5px rgba(0,0,0,0.15);
    max-width: none;
    margin: 0;
  }
  .nav-title { 
    color: #fff;
    font-size: 36px;
    margin-bottom: 30px; 
    text-align: center;
    width: 100%;
  }
  .navigation button,
  .navigation .external-link-button {
    width: 100%;
    justify-content: flex-start;
    padding: 18px 12px;
    margin-bottom: 8px;
    color: #fff;
    border-radius: 0;
    transition: background-color 0.3s ease;
    flex-direction: row;
    font-size: 18px;
  }
  .navigation button:hover,
  .navigation .external-link-button:hover {
    background-color: rgba(255, 255, 255, 0.25);
  }
  .navigation button.active {
    background-color: rgba(0, 0, 0, 0.15);
    color: #fff;
  }
  .navigation .custom-icon {
    width: 32px;
    height: 32px;
    margin-right: 15px;
    fill: currentColor;
  }
  .navigation button .nav-text {
    display: initial;
    font-size: 18px;
  }
  .navigation .badge {
    top: -5px;
    right: -5px;
  }
}
</style>