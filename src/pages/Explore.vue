<template>
  <div class="explore-page">
    <!-- 貼齊控制區域 -->
    <div class="sticky-controls" :class="{ 'tabs-hidden': tabsHidden }">
      <!-- 標題和標籤區域 -->
      <div class="header-section" :class="{ 'hidden': tabsHidden }">
        <div class="header-left">
          <h1>探索問卷</h1>
        </div>
        <div class="header-right">
          <div class="main-tabs">
            <button 
              v-for="tab in mainTabs" 
              :key="tab.id"
              :class="['tab-btn', { active: activeMainTab === tab.id }]"
              @click="setActiveMainTab(tab.id)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- 控制區域 -->
      <div class="content-controls">
        <div class="controls-left">
          <span class="results-count">{{ filteredContent.length }} 個結果</span>
        </div>
        <div class="controls-right">
          <select v-model="selectedFieldFilter" @change="applyFilters" class="filter-select">
            <option value="">所有領域</option>
            <option v-for="field in fieldFilters" :key="field.id" :value="field.id">
              {{ field.label }}
            </option>
          </select>
          <select v-model="selectedTopicFilter" @change="applyFilters" class="filter-select">
            <option value="">所有主題</option>
            <option v-for="topic in topicFilters" :key="topic.id" :value="topic.id">
              {{ topic.label }}
            </option>
          </select>
          <select v-model="sortBy" @change="applySort" class="sort-select">
            <option value="date">最新</option>
            <option value="popularity">最受歡迎</option>
            <option value="title">標題</option>
          </select>
          <div class="view-toggle-group">
            <button 
              :class="['view-toggle-btn', { active: viewMode === 'list' }]"
              @click="setViewMode('list')"
              title="條列檢視"
            >
              ☰
            </button>
            <button 
              :class="['view-toggle-btn', { active: viewMode === 'grid' }]"
              @click="setViewMode('grid')"
              title="圖卡檢視"
            >
              ⊞
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 內容區域 -->
    <div class="content-area">
      <!-- 內容列表 -->
      <div :class="['survey-container', viewMode]">
        <SurveyCard 
          v-for="(item, index) in paginatedContent" 
          :key="item.id" 
          :survey="item"
          :index="index"
          :viewMode="viewMode"
        />
      </div>

      <!-- 顯示更多按鈕 -->
      <div class="load-more-section" v-if="hasMoreItems">
        <button class="load-more-btn" @click="loadMore">
          顯示更多
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SurveyCard from '../components/SurveyCard.vue'

// 主要標籤
const mainTabs = ref([
  { id: 'all', label: '全部' },
  { id: 'research', label: '公開發表' },
  { id: 'results', label: '結論' },
  { id: 'milestones', label: '里程碑' },
  { id: 'announcements', label: '發行通知' }
])

const activeMainTab = ref('all')

// 篩選選項
const fieldFilters = ref([
  { id: 'academic', label: '學術' },
  { id: 'business', label: '商業' },
  { id: 'social', label: '社會' },
  { id: 'education', label: '教育' },
  { id: 'health', label: '健康' },
  { id: 'technology', label: '科技' }
])

const topicFilters = ref([
  { id: 'campus', label: '校園' },
  { id: 'consumption', label: '消費行為' },
  { id: 'lifestyle', label: '生活型態' },
  { id: 'food', label: '餐飲' },
  { id: 'service', label: '服務體驗' },
  { id: 'remote-work', label: '遠端工作' },
  { id: 'efficiency', label: '效率' },
  { id: 'health', label: '心理健康' },
  { id: 'finance', label: '理財' },
  { id: 'travel', label: '旅遊' },
  { id: 'content', label: '內容付費' },
  { id: 'energy', label: '能源' },
  { id: 'education', label: '教育' },
  { id: 'transport', label: '交通' },
  { id: 'ai', label: 'AI' }
])

// 選中的篩選項
const selectedFieldFilter = ref('')
const selectedTopicFilter = ref('')

// 排序和視圖
const sortBy = ref('date')
const viewMode = ref('list')
const displayCount = ref(15) // 預設顯示15個
const loadMoreIncrement = 5 // 每次加載5個

// 滾動狀態
const tabsHidden = ref(false)
let lastScrollY = 0
let scrollTimeout = null

// 模擬問卷資料
const allContent = ref([
  {
    id: "s001",
    title: "大學生消費習慣研究",
    org: "NTU Marketing Lab",
    tags: ["校園", "消費行為", "生活型態"],
    field: "學術",
    language: "中文",
    minutes: 6,
    incentive: 10,
    filled: 18,
    target: 50,
    isNew: true,
    description: "探索大學生在不同情境下的消費決策與偏好。",
    category: "研究",
    date: "2025年10月15日"
  },
  {
    id: "s002",
    title: "外送平台滿意度與留存因素",
    org: "Biz Research Co.",
    tags: ["餐飲", "服務體驗", "NPS"],
    field: "商業",
    language: "中文",
    minutes: 7,
    incentive: 10,
    filled: 120,
    target: 300,
    isNew: false,
    description: "評估外送平台的滿意度、推薦意願與流失原因。",
    category: "產品",
    date: "2025年10月14日"
  },
  {
    id: "s003",
    title: "Remote 工作型態與生產力",
    org: "HR Analytics Group",
    tags: ["遠端工作", "效率", "工具使用"],
    field: "商業",
    language: "English",
    minutes: 8,
    incentive: 12,
    filled: 64,
    target: 120,
    isNew: true,
    description: "探討混合辦公對個人與團隊生產力的影響。",
    category: "研究",
    date: "2025年10月13日"
  },
  {
    id: "s004",
    title: "城市綠地使用與心理健康",
    org: "NTPU Soc Lab",
    tags: ["公共空間", "心理健康", "城市規劃"],
    field: "學術",
    language: "中文",
    minutes: 9,
    incentive: 10,
    filled: 27,
    target: 80,
    isNew: false,
    description: "研究市民接觸綠地的頻率與情緒穩定的關聯。",
    category: "研究",
    date: "2025年10月12日"
  },
  {
    id: "s005",
    title: "Z 世代金融 App 使用偏好",
    org: "FinTech Insight",
    tags: ["理財", "APP體驗", "通知策略"],
    field: "商業",
    language: "中文",
    minutes: 5,
    incentive: 10,
    filled: 95,
    target: 150,
    isNew: true,
    description: "了解年輕族群對金融 App 的核心需求與痛點。",
    category: "產品",
    date: "2025年10月11日"
  },
  {
    id: "s006",
    title: "夜市觀光動線與消費額",
    org: "Tourism Board",
    tags: ["旅遊", "在地文化", "動線設計"],
    field: "社會",
    language: "中文",
    minutes: 6,
    incentive: 8,
    filled: 40,
    target: 100,
    isNew: false,
    description: "調查夜市遊客的行進路線與攤位消費情況。",
    category: "研究",
    date: "2025年10月10日"
  },
  {
    id: "s007",
    title: "Podcast 收聽習慣與付費意願",
    org: "AudioLab",
    tags: ["內容付費", "創作者經濟", "收聽時段"],
    field: "商業",
    language: "中文",
    minutes: 7,
    incentive: 10,
    filled: 33,
    target: 120,
    isNew: false,
    description: "分析不同主題 Podcast 的收聽動機與留存。",
    category: "產品",
    date: "2025年10月9日"
  },
  {
    id: "s008",
    title: "家用能源節電行為調查",
    org: "Green Home Alliance",
    tags: ["能源", "節能家電", "碳足跡"],
    field: "社會",
    language: "中文",
    minutes: 10,
    incentive: 12,
    filled: 52,
    target: 200,
    isNew: true,
    description: "了解家庭節電措施與購買節能設備的意願。",
    category: "研究",
    date: "2025年10月8日"
  },
  {
    id: "s009",
    title: "跨境電商購物體驗地圖",
    org: "Global eCom Lab",
    tags: ["物流", "關稅", "退貨體驗"],
    field: "商業",
    language: "English",
    minutes: 8,
    incentive: 10,
    filled: 140,
    target: 250,
    isNew: false,
    description: "繪製跨境購物從下單到收貨的痛點路徑。",
    category: "產品",
    date: "2025年10月7日"
  },
  {
    id: "s010",
    title: "高中生成長型思維量表（短版）",
    org: "EduMind Lab",
    tags: ["教育", "心態", "量表驗證"],
    field: "學術",
    language: "中文",
    minutes: 4,
    incentive: 8,
    filled: 21,
    target: 60,
    isNew: true,
    description: "簡短量表用於蒐集成長型思維分佈與差異。",
    category: "研究",
    date: "2025年10月6日"
  },
  {
    id: "s011",
    title: "共乘服務安全感與信任度",
    org: "Urban Mobility Lab",
    tags: ["交通", "信任", "評價機制"],
    field: "社會",
    language: "中文",
    minutes: 6,
    incentive: 10,
    filled: 88,
    target: 180,
    isNew: false,
    description: "衡量乘客對共乘平台安全與匿名性的看法。",
    category: "研究",
    date: "2025年10月5日"
  },
  {
    id: "s012",
    title: "咖啡偏好：產地、烘焙與風味輪",
    org: "Coffee Research Taiwan",
    tags: ["咖啡", "風味", "習慣"],
    field: "商業",
    language: "中文",
    minutes: 5,
    incentive: 10,
    filled: 73,
    target: 120,
    isNew: false,
    description: "蒐集消費者的風味偏好與日常飲用情境。",
    category: "產品",
    date: "2025年10月4日"
  },
  {
    id: "s013",
    title: "健康 App 打卡對運動持續性的影響",
    org: "HealthTech Lab",
    tags: ["運動", "打卡", "推播策略"],
    field: "學術",
    language: "English",
    minutes: 9,
    incentive: 12,
    filled: 34,
    target: 90,
    isNew: true,
    description: "探討數位介入（提醒/挑戰）是否提升持續運動。",
    category: "研究",
    date: "2025年10月3日"
  },
  {
    id: "s014",
    title: "短影音對購物決策的影響力",
    org: "Creator Economy Lab",
    tags: ["短影音", "轉換率", "直播電商"],
    field: "商業",
    language: "中文",
    minutes: 7,
    incentive: 10,
    filled: 210,
    target: 400,
    isNew: false,
    description: "分析短影音與直播對購物決策的觸發點。",
    category: "產品",
    date: "2025年10月2日"
  },
  {
    id: "s015",
    title: "寵物友善空間與飼主需求",
    org: "Pet Society",
    tags: ["寵物", "公共空間", "服務設計"],
    field: "社會",
    language: "中文",
    minutes: 6,
    incentive: 10,
    filled: 58,
    target: 100,
    isNew: true,
    description: "了解飼主對餐廳、商場等寵物友善設施的期待。",
    category: "研究",
    date: "2025年10月1日"
  },
  {
    id: "s016",
    title: "ESG 認知與品牌偏好",
    org: "GreenGo Insight",
    tags: ["ESG", "品牌", "永續"],
    field: "商業",
    language: "中文",
    minutes: 8,
    incentive: 12,
    filled: 132,
    target: 220,
    isNew: false,
    description: "評估 ESG 訴求對不同年齡層選牌的影響。",
    category: "產品",
    date: "2025年9月30日"
  },
  {
    id: "s017",
    title: "校園心理諮商使用障礙",
    org: "Campus Care Lab",
    tags: ["心理健康", "求助行為", "污名化"],
    field: "學術",
    language: "中文",
    minutes: 10,
    incentive: 12,
    filled: 19,
    target: 70,
    isNew: true,
    description: "瞭解學生使用諮商服務的阻礙與促進因素。",
    category: "研究",
    date: "2025年9月29日"
  },
  {
    id: "s018",
    title: "共享廚房創業可行性調查",
    org: "Food Startup Hub",
    tags: ["雲廚房", "創業", "成本結構"],
    field: "商業",
    language: "English",
    minutes: 7,
    incentive: 10,
    filled: 46,
    target: 150,
    isNew: false,
    description: "蒐集餐飲創業者對共享廚房的需求與痛點。",
    category: "產品",
    date: "2025年9月28日"
  },
  {
    id: "s019",
    title: "公共單車再平衡策略意見",
    org: "City Mobility Office",
    tags: ["單車", "站點密度", "再配置"],
    field: "社會",
    language: "中文",
    minutes: 6,
    incentive: 8,
    filled: 82,
    target: 180,
    isNew: false,
    description: "收集市民對單車站點配置與再平衡的建議。",
    category: "研究",
    date: "2025年9月27日"
  },
  {
    id: "s020",
    title: "AI 助理在日常工作的採用度",
    org: "Productivity Research",
    tags: ["AI", "辦公", "使用率"],
    field: "商業",
    language: "中文",
    minutes: 5,
    incentive: 10,
    filled: 177,
    target: 300,
    isNew: true,
    description: "了解不同職能對 AI 助理的使用場景與阻力。",
    category: "產品",
    date: "2025年9月26日"
  }
])

// 篩選後的內容
const filteredContent = computed(() => {
  let content = allContent.value

  // 主要標籤篩選
  if (activeMainTab.value !== 'all') {
    content = content.filter(item => {
      switch (activeMainTab.value) {
        case 'research':
          return item.category === '公開發表'
        case 'results':
          return item.category === '結論'
        case 'milestones':
          return item.category === '里程碑'
        case 'announcements':
          return item.category === '發行通知'
        default:
          return true
      }
    })
  }

  // 領域篩選
  if (selectedFieldFilter.value) {
    const fieldMapping = {
      'academic': '學術',
      'business': '商業', 
      'social': '社會',
      'education': '教育',
      'health': '健康',
      'technology': '科技'
    }
    content = content.filter(item => 
      fieldMapping[selectedFieldFilter.value] === item.field
    )
  }

  // 主題篩選
  if (selectedTopicFilter.value) {
    const topicMapping = {
      'campus': '校園',
      'consumption': '消費行為',
      'lifestyle': '生活型態',
      'food': '餐飲',
      'service': '服務體驗',
      'remote-work': '遠端工作',
      'efficiency': '效率',
      'health': '心理健康',
      'finance': '理財',
      'travel': '旅遊',
      'content': '內容付費',
      'energy': '能源',
      'education': '教育',
      'transport': '交通',
      'ai': 'AI'
    }
    content = content.filter(item => 
      item.tags && item.tags.some(tag => 
        topicMapping[selectedTopicFilter.value] === tag || 
        tag.includes(topicMapping[selectedTopicFilter.value])
      )
    )
  }

  return content
})

// 顯示內容（基於 displayCount）
const paginatedContent = computed(() => {
  return filteredContent.value.slice(0, displayCount.value)
})

// 是否還有更多項目
const hasMoreItems = computed(() => {
  return filteredContent.value.length > displayCount.value
})

// 方法
const setActiveMainTab = (tabId) => {
  activeMainTab.value = tabId
  displayCount.value = 15 // 重置顯示數量
}

const applyFilters = () => {
  displayCount.value = 15 // 重置顯示數量
}

const clearFilters = () => {
  selectedFieldFilter.value = ''
  selectedTopicFilter.value = ''
  displayCount.value = 15 // 重置顯示數量
}

const applySort = () => {
  // 排序邏輯可以在這裡實現
  displayCount.value = 15 // 重置顯示數量
}

const loadMore = () => {
  displayCount.value += loadMoreIncrement
}

const setViewMode = (mode) => {
  viewMode.value = mode
}

// 滾動處理
const handleScroll = () => {
  const currentScrollY = window.scrollY
  const scrollDifference = Math.abs(currentScrollY - lastScrollY)
  
  // 使用 requestAnimationFrame 來節流滾動事件
  if (scrollTimeout) {
    cancelAnimationFrame(scrollTimeout)
  }
  
  scrollTimeout = requestAnimationFrame(() => {
    // 只有滾動距離超過 20px 時才觸發狀態改變，減少閾值以提高響應性
    if (scrollDifference > 20) {
      const shouldHide = currentScrollY > lastScrollY && currentScrollY > 80
      const shouldShow = currentScrollY < lastScrollY || currentScrollY <= 80
      
      // 只在狀態真正需要改變時才更新
      if (shouldHide && !tabsHidden.value) {
        tabsHidden.value = true
        lastScrollY = currentScrollY
      } else if (shouldShow && tabsHidden.value) {
        tabsHidden.value = false
        lastScrollY = currentScrollY
      } else if (scrollDifference > 50) {
        // 對於大幅滾動，更新 lastScrollY 以避免累積誤差
        lastScrollY = currentScrollY
      }
    }
  })
}

// 生命週期
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (scrollTimeout) {
    cancelAnimationFrame(scrollTimeout)
  }
})
</script>

<style scoped>
.explore-page {
  max-width: 1400px;
  margin: 0 auto;
}

/* 貼齊控制區域 */
.sticky-controls {
  position: sticky;
  top: 64px;
  background: #fafafa;
  border-bottom: 1px solid var(--border);
  z-index: 50;
  padding: 24px 0;
  margin-bottom: 32px;
  transition: padding 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: padding;
}

.sticky-controls.tabs-hidden {
  padding: 16px 0;
}

/* 標題和標籤區域 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  overflow: hidden;
  transition: max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              margin-bottom 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: max-height, margin-bottom, opacity;
  max-height: 200px; /* 設定一個足夠的最大高度 */
}

.header-section.hidden {
  max-height: 0;
  margin-bottom: 0;
  opacity: 0;
  pointer-events: none;
}

.header-left h1 {
  font-size: 48px;
  font-weight: 700;
  margin: 0;
  color: var(--text);
}

.header-right {
  display: flex;
  align-items: center;
}

/* 主要標籤 */
.main-tabs {
  display: flex;
  gap: 0;
}

.tab-btn {
  padding: 12px 20px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--text);
}

.tab-btn.active {
  color: var(--text);
  border-bottom-color: var(--text);
}

/* 控制區域 */
.content-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: margin-bottom 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.sticky-controls.tabs-hidden .content-controls {
  margin-bottom: 0;
}

.controls-left {
  color: var(--muted);
  font-size: 14px;
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-select,
.sort-select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: var(--text);
  min-width: 120px;
}

.view-toggle-group {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}

.view-toggle-btn {
  padding: 8px 12px;
  background: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--muted);
  transition: all 0.2s;
  border-right: 1px solid var(--border);
}

.view-toggle-btn:last-child {
  border-right: none;
}

.view-toggle-btn:hover {
  background: var(--hover);
  color: var(--text);
}

.view-toggle-btn.active {
  background: var(--text);
  color: white;
}

/* 內容區域 */
.content-area {
  min-height: 600px;
}

/* 內容容器 */
.survey-container.list {
  display: flex;
  flex-direction: column;
}

.survey-container.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

/* 顯示更多按鈕 */
.load-more-section {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.load-more-btn {
  padding: 12px 32px;
  background: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: var(--hover);
  border-color: var(--text);
}

/* 響應式設計 */
@media (max-width: 1024px) {
  .survey-container.grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    max-height: 300px; /* 手機版需要更大的高度來容納垂直佈局 */
  }
  
  .main-tabs {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    width: 100%;
  }
  
  .main-tabs::-webkit-scrollbar {
    display: none;
  }
  
  .tab-btn {
    white-space: nowrap;
    padding: 12px 16px;
  }
  
  .content-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .controls-right {
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
  }
  
  .survey-container.grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .sticky-controls {
    padding: 16px 0;
  }
  
  .header-left h1 {
    font-size: 36px;
  }
}
</style>