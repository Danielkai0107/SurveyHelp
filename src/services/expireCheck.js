import { matchesService } from './matches.js'
import { pointsService } from './points.js'
import { auth } from '../firebase.js'

// 過期檢查服務
export const expireCheckService = {
  // 檢查間隔（5分鐘）
  checkInterval: 5 * 60 * 1000,
  
  // 定時器ID
  timerId: null,
  
  // 啟動自動檢查
  startAutoCheck() {
    // 如果已經有定時器，先清除
    if (this.timerId) {
      this.stopAutoCheck()
    }
    
    console.log('✅ 啟動過期檢查服務，每 5 分鐘檢查一次')
    
    // 立即執行一次檢查
    this.checkExpiredMatches()
    
    // 設置定時器
    this.timerId = setInterval(() => {
      this.checkExpiredMatches()
    }, this.checkInterval)
  },
  
  // 停止自動檢查
  stopAutoCheck() {
    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
      console.log('⏹️ 停止過期檢查服務')
    }
  },
  
  // 檢查過期配對
  async checkExpiredMatches() {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        console.log('用戶未登入，跳過過期檢查')
        return
      }
      
      console.log('🔍 開始檢查過期配對...')
      
      // 獲取用戶的所有配對
      const matches = await matchesService.getUserMatches(currentUser.uid)
      
      const now = new Date()
      let expiredCount = 0
      let penaltyCount = 0
      
      // 檢查每個配對
      for (const match of matches) {
        // 只檢查開啟狀態的配對
        if (match.status !== 'open') continue
        
        const expireDate = match.expireAt?.toDate ? match.expireAt.toDate() : new Date(match.expireAt)
        
        // 如果已過期
        if (now > expireDate) {
          expiredCount++
          
          // 檢查用戶是否完成
          const isDone = match.role === 'requester' ? match.requesterDone : match.counterpartDone
          
          // 如果未完成，扣除積分
          if (!isDone) {
            penaltyCount++
            
            // 獲取問卷資訊
            let surveyTitle = '未知問卷'
            try {
              const { surveyService } = await import('./firebase.js')
              const surveyId = match.role === 'requester' ? match.ownerSurveyId : match.selectedMySurveyId
              if (surveyId) {
                const survey = await surveyService.getSurveyWithLabels(surveyId, { returnNullOnError: true })
                if (survey) {
                  surveyTitle = survey.title
                }
              }
            } catch (error) {
              console.error('獲取問卷資訊失敗:', error)
            }
            
            // 扣除 5 積分
            try {
              await pointsService.addPointsRecord(
                currentUser.uid,
                -5,
                'penalty',
                `未在期限內完成問卷：${surveyTitle}`,
                match.id
              )
              
              console.log(`⚠️ 扣除積分：配對 ${match.id} 已過期且未完成`)
            } catch (error) {
              console.error('扣除積分失敗:', error)
            }
          }
        }
      }
      
      if (expiredCount > 0) {
        console.log(`✅ 過期檢查完成：發現 ${expiredCount} 個過期配對，扣除 ${penaltyCount} 個未完成配對的積分`)
        
        // 觸發積分更新事件
        window.dispatchEvent(new CustomEvent('points-updated'))
      } else {
        console.log('✅ 過期檢查完成：無過期配對')
      }
      
      // 調用 matches 服務的過期處理（更新配對狀態和 responses）
      await matchesService.expireMatches()
      
    } catch (error) {
      console.error('❌ 檢查過期配對失敗:', error)
    }
  }
}

