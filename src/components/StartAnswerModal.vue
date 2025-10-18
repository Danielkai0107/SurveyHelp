<template>
  <div v-if="visible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- 固定 Header -->
      <div class="modal-header">
        <h3 class="modal-title">選擇要對方回填的我的問卷</h3>
        <button @click="closeModal" class="close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- 可滾動 Body -->
      <div class="modal-body">
        <!-- 積分說明 -->
        <div class="points-info">
          <div class="points-item">
            <span class="points-label">此次填答可獲得：</span>
            <span class="points-value">+{{ targetSurvey.incentive || 3 }} 積分</span>
          </div>
          <div v-if="selectedSurvey" class="points-item">
            <span class="points-label">互惠完成可再獲得：</span>
            <span class="points-value bonus">+2 積分</span>
          </div>
        </div>

        <!-- 載入狀態 -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-text">載入我的問卷中...</div>
        </div>

        <!-- 我的問卷列表 -->
        <div v-else-if="mySurveys.length > 0" class="surveys-list">
          <div class="list-header">
            <h4>選擇我的問卷（可選）：</h4>
            <p class="list-subtitle">對方完成後可獲得 +3 積分</p>
          </div>
          
          <div class="survey-cards">
            <!-- 不選擇任何問卷的選項 -->
            <div 
              :class="['survey-card', 'no-selection', { active: !selectedSurvey }]"
              @click="selectedSurvey = null"
            >
              <div class="card-content">
                <h5 class="card-title">不選擇互填問卷</h5>
                <p class="card-subtitle">僅獲得填答積分</p>
                <div class="card-points">+{{ targetSurvey.incentive || 3 }} 積分</div>
              </div>
            </div>

            <!-- 我的問卷選項 -->
            <div 
              v-for="survey in mySurveys" 
              :key="survey.id"
              :class="['survey-card', { active: selectedSurvey?.id === survey.id }]"
              @click="selectedSurvey = survey"
            >
              <div class="card-content">
                <h5 class="card-title">{{ survey.title }}</h5>
                <div class="card-meta">
                  <span class="card-field">{{ survey.fieldLabel || survey.field }}</span>
                  <span class="card-progress">{{ survey.filled || 0 }}/{{ survey.targetCount || survey.target }}</span>
                </div>
                <div class="card-details">
                  <span class="card-time">{{ survey.minutes }}分鐘</span>
                  <span class="card-incentive">對方完成可得 +{{ survey.incentive || 3 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 沒有問卷的狀態 -->
        <div v-else class="no-surveys">
          <div class="no-surveys-icon">📋</div>
          <h4 class="no-surveys-title">您還沒有發布的問卷</h4>
          <p class="no-surveys-text">完成此次填答可獲得 +{{ targetSurvey.incentive || 3 }} 積分</p>
        </div>
      </div>

      <!-- 固定 Footer -->
      <div class="modal-footer">
        <div class="total-points">
          <span class="total-label">預計可獲得：</span>
          <span class="total-value">
            +{{ (targetSurvey.incentive || 3) + (selectedSurvey ? 2 : 0) }} 積分
          </span>
        </div>
        
        <div class="modal-actions">
          <BaseButton variant="secondary" @click="closeModal">
            取消
          </BaseButton>
          <BaseButton 
            variant="primary" 
            @click="confirmStart"
            :disabled="isStarting"
          >
            {{ isStarting ? '準備中...' : '確認並開始' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import BaseButton from './BaseButton.vue'
import { surveyService } from '../services/firebase.js'
import { useAuth } from '../composables/useAuth.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  targetSurvey: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'confirm'])

const { user } = useAuth()
const mySurveys = ref([])
const selectedSurvey = ref(null)
const isLoading = ref(false)
const isStarting = ref(false)

// 載入我的問卷
const loadMySurveys = async () => {
  if (!user.value) return
  
  try {
    isLoading.value = true
    const surveys = await surveyService.getUserSurveys(user.value.uid)
    
    // 載入詳細資訊（包含標籤轉換）
    const enrichedSurveys = await Promise.all(
      surveys.map(async (survey) => {
        try {
          return await surveyService.getSurveyWithLabels(survey.id)
        } catch (error) {
          console.error('載入問卷詳情失敗:', error)
          return survey
        }
      })
    )
    
    // 過濾掉當前要填答的問卷（避免自己填自己的）
    mySurveys.value = enrichedSurveys.filter(survey => survey.id !== props.targetSurvey.id)
    
    console.log('載入我的問卷:', mySurveys.value.length, '個')
  } catch (error) {
    console.error('載入我的問卷失敗:', error)
  } finally {
    isLoading.value = false
  }
}

// 關閉彈窗
const closeModal = () => {
  selectedSurvey.value = null
  emit('close')
}

// 確認開始
const confirmStart = () => {
  isStarting.value = true
  emit('confirm', {
    selectedSurvey: selectedSurvey.value,
    expectedPoints: (props.targetSurvey.incentive || 3) + (selectedSurvey.value ? 2 : 0)
  })
}

// 監聽彈窗顯示狀態
watch(() => props.visible, (visible) => {
  if (visible) {
    loadMySurveys()
    selectedSurvey.value = null
    isStarting.value = false
  }
})

// 初始載入
onMounted(() => {
  if (props.visible) {
    loadMySurveys()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f5f5f5;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e5e5e5;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.points-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.points-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.points-item:last-child {
  margin-bottom: 0;
}

.points-label {
  font-size: 14px;
  color: var(--text);
}

.points-value {
  font-size: 14px;
  font-weight: 600;
  color: #22c55e;
}

.points-value.bonus {
  color: #f59e0b;
}

.loading-state {
  text-align: center;
  padding: 40px 0;
}

.loading-text {
  font-size: 14px;
  color: var(--muted);
}

.surveys-list {
  margin-bottom: 24px;
}

.list-header {
  margin-bottom: 16px;
}

.list-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 4px 0;
}

.list-subtitle {
  font-size: 12px;
  color: var(--muted);
  margin: 0;
}

.survey-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.survey-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.survey-card:hover {
  border-color: var(--text);
}

.survey-card.active {
  background: #f8f9fa;
  border: 2px solid var(--text);

}

.survey-card.no-selection {
  background: #fafafa;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
  line-height: 1.3;
}

.card-subtitle {
  font-size: 12px;
  color: var(--muted);
  margin: 0;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-field {
  font-size: 11px;
  background: #e5e7eb;
  padding: 2px 8px;
  border-radius: 12px;
  color: var(--text);
}

.card-progress {
  font-size: 11px;
  color: var(--muted);
}

.card-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-time {
  font-size: 11px;
  color: var(--muted);
}

.card-incentive {
  font-size: 11px;
  color: #22c55e;
  font-weight: 500;
}

.card-points {
  font-size: 14px;
  font-weight: 600;
  color: #22c55e;
  text-align: center;
  margin-top: 8px;
}

.no-surveys {
  text-align: center;
  padding: 40px 0;
}

.no-surveys-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-surveys-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 8px 0;
}

.no-surveys-text {
  font-size: 14px;
  color: var(--muted);
  margin: 0;
}

.modal-footer {
  padding: 20px 24px 24px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.total-points {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f0fff4;
  border-radius: 8px;
  border: 1px solid #9ae6b4;
}

.total-label {
  font-size: 14px;
  color: #22543d;
  font-weight: 500;
}

.total-value {
  font-size: 16px;
  font-weight: 700;
  color: #22c55e;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 16px;
  }
  
  .modal-content {
    max-height: 90vh;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-title {
    font-size: 18px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 16px 20px 20px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 12px;
  }
  
  .modal-content {
    border-radius: 16px;
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .modal-title {
    font-size: 16px;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .modal-footer {
    padding: 12px 16px 16px;
  }
  
  .points-info {
    padding: 12px;
  }
  
  .survey-card {
    padding: 12px;
  }
}
</style>
