import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase.js'

// 设置服务
export const settingsService = {
  // 获取隐私权政策
  async getPrivacyPolicy() {
    try {
      const docRef = doc(db, 'settings', 'privacy')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data().content || ''
      }
      
      return this.getDefaultPrivacyPolicy()
    } catch (error) {
      console.error('获取隐私权政策失败:', error)
      return this.getDefaultPrivacyPolicy()
    }
  },

  // 获取服务条款
  async getTermsOfService() {
    try {
      const docRef = doc(db, 'settings', 'terms')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data().content || ''
      }
      
      return this.getDefaultTermsOfService()
    } catch (error) {
      console.error('获取服务条款失败:', error)
      return this.getDefaultTermsOfService()
    }
  },

  // 默认隐私权政策
  getDefaultPrivacyPolicy() {
    return `
      <h2>隱私權政策</h2>
      
      <h3>1. 資料收集</h3>
      <p>我們收集以下類型的資料：</p>
      <ul>
        <li>帳號資訊：您的 Google 帳號名稱、電子郵件地址和頭像</li>
        <li>問卷資料：您發布和填寫的問卷內容</li>
        <li>使用資料：您在平台上的互動記錄</li>
      </ul>

      <h3>2. 資料使用</h3>
      <p>我們使用收集的資料來：</p>
      <ul>
        <li>提供和改善我們的服務</li>
        <li>處理問卷互填配對</li>
        <li>計算和發放積分獎勵</li>
        <li>與您溝通重要訊息</li>
      </ul>

      <h3>3. 資料保護</h3>
      <p>我們採取適當的技術和組織措施來保護您的個人資料，防止未經授權的訪問、使用或洩露。</p>

      <h3>4. 資料分享</h3>
      <p>我們不會將您的個人資料出售給第三方。我們僅在以下情況下分享資料：</p>
      <ul>
        <li>獲得您的明確同意</li>
        <li>法律要求或保護我們的權利</li>
        <li>與服務提供商（如 Firebase）合作提供服務</li>
      </ul>

      <h3>5. 您的權利</h3>
      <p>您有權：</p>
      <ul>
        <li>查看、更新或刪除您的個人資料</li>
        <li>反對或限制某些資料處理</li>
        <li>要求資料可攜性</li>
        <li>撤回同意</li>
      </ul>

      <h3>6. 聯絡我們</h3>
      <p>如果您對本隱私權政策有任何疑問，請透過平台聯絡我們。</p>
    `
  },

  // 默认服务条款
  getDefaultTermsOfService() {
    return `
      <h2>服務條款</h2>
      
      <h3>1. 服務說明</h3>
      <p>SurveyHelp 是一個問卷互填平台，讓用戶可以發布問卷並透過互惠機制獲得填答者。</p>

      <h3>2. 用戶責任</h3>
      <p>使用本服務時，您同意：</p>
      <ul>
        <li>提供真實、準確的資訊</li>
        <li>不發布違法、侵權或不當內容</li>
        <li>尊重其他用戶的權利和隱私</li>
        <li>不濫用平台功能或進行惡意操作</li>
      </ul>

      <h3>3. 問卷規範</h3>
      <p>發布問卷時，您必須：</p>
      <ul>
        <li>確保問卷內容合法且不侵犯他人權利</li>
        <li>提供真實有效的問卷連結</li>
        <li>遵守承諾的積分獎勵</li>
        <li>在 48 小時內完成驗證流程</li>
      </ul>

      <h3>4. 積分系統</h3>
      <p>積分獲得和使用規則：</p>
      <ul>
        <li>完成問卷後需透過驗證連結確認才能獲得積分</li>
        <li>互填配對雙方都完成後可獲得額外加成</li>
        <li>積分不可轉讓或兌換現金</li>
        <li>我們保留調整積分規則的權利</li>
      </ul>

      <h3>5. 服務變更</h3>
      <p>我們保留隨時修改、暫停或終止服務的權利，恕不另行通知。</p>

      <h3>6. 免責聲明</h3>
      <p>我們不對以下情況負責：</p>
      <ul>
        <li>用戶發布的問卷內容</li>
        <li>外部問卷平台的服務中斷</li>
        <li>因不可抗力導致的服務中斷</li>
        <li>用戶間的爭議</li>
      </ul>

      <h3>7. 條款修改</h3>
      <p>我們可能會不時更新這些條款。繼續使用服務即表示您接受修改後的條款。</p>

      <h3>8. 準據法</h3>
      <p>本條款受中華民國法律管轄。任何爭議應由台灣台北地方法院管轄。</p>
    `
  },

  // 更新隐私权政策（管理员功能）
  async updatePrivacyPolicy(content) {
    try {
      const docRef = doc(db, 'settings', 'privacy')
      await setDoc(docRef, {
        content,
        updatedAt: new Date().toISOString()
      })
      
      console.log('隐私权政策已更新')
      return true
    } catch (error) {
      console.error('更新隐私权政策失败:', error)
      throw error
    }
  },

  // 更新服务条款（管理员功能）
  async updateTermsOfService(content) {
    try {
      const docRef = doc(db, 'settings', 'terms')
      await setDoc(docRef, {
        content,
        updatedAt: new Date().toISOString()
      })
      
      console.log('服务条款已更新')
      return true
    } catch (error) {
      console.error('更新服务条款失败:', error)
      throw error
    }
  }
}

