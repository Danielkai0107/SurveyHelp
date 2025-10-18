# Firebase Firestore 規則設置指南

## 🚨 重要：必須設置 Firestore 規則才能正確讀取積分數據

### 問題現象
- ✅ 總積分顯示正常
- ❌ 積分統計顯示 0（累計獲得、本月獲得等）
- ❌ 積分記錄列表是空的

### 原因
Firebase Firestore 預設不允許讀取 `pointsRecords` 集合，需要手動設置規則。

---

## 📝 設置步驟

### 方法 1：使用 Firebase Console（推薦）

1. **前往 Firebase Console**
   - 打開 [Firebase Console](https://console.firebase.google.com/)
   - 選擇你的專案 `surveyhelp`

2. **進入 Firestore Database**
   - 左側菜單 → `Firestore Database`
   - 點擊頂部的 `規則 (Rules)` 標籤

3. **複製規則內容**
   - 複製 `firestore.rules` 文件的內容
   - 或直接複製以下規則：

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // 用戶集合
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    // 積分記錄集合（關鍵！）
    match /pointsRecords/{recordId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update, delete: if false;  // 積分記錄永久保存
    }
    
    // 問卷集合
    match /surveys/{surveyId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.createdBy;
    }
    
    // 回應記錄集合
    match /responses/{responseId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.respondentUidOrAnon ||
                      request.auth.uid == resource.data.respondentUid);
      allow create, update: if request.auth != null;
      allow delete: if false;
    }
    
    // 配對記錄集合
    match /matches/{matchId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.requesterUid ||
                      request.auth.uid == resource.data.counterpartUid);
      allow create, update: if request.auth != null;
      allow delete: if false;
    }
    
    // 選項集合
    match /options/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

4. **發布規則**
   - 點擊 `發布 (Publish)` 按鈕
   - 等待規則生效（通常幾秒鐘）

### 方法 2：使用 Firebase CLI

```bash
# 1. 確保已安裝 Firebase CLI
npm install -g firebase-tools

# 2. 登入 Firebase
firebase login

# 3. 部署規則
firebase deploy --only firestore:rules
```

---

## 🧪 驗證設置是否成功

### 1. 打開網頁 Console（F12）

### 2. 檢查積分記錄
```javascript
window.checkPointsRecords()
```

**成功的輸出：**
```
🔍 開始檢查積分記錄...
當前用戶ID: xxxxx

📊 檢查用戶總積分：
用戶檔案: { uid: "xxxxx", totalPoints: 44, ... }
總積分: 44

📝 檢查積分記錄：
找到 9 筆記錄
┌─────┬────────┬───────────────┬──────────────────────┐
│ ID  │ 積分   │ 類型          │ 描述                 │
├─────┼────────┼───────────────┼──────────────────────┤
│ ... │   10   │ survey_complete│ 完成問卷：...        │
└─────┴────────┴───────────────┴──────────────────────┘
```

**失敗的輸出：**
```
❌ 載入積分記錄失敗: FirebaseError: Missing or insufficient permissions
🚫 Firebase 權限錯誤：請檢查 Firestore 規則
```

### 3. 如果沒有積分記錄，添加測試數據
```javascript
window.addTestPoints()
```

### 4. 修復積分數據（如有需要）
```javascript
window.fixPointsData()
```

---

## 🎯 預期效果

設置完成後，Profile 頁面應該顯示：

### 總積分卡片
```
┌─────────────────────────┐
│  [👤] 用戶名稱    44  │
│                  總積分  │
└─────────────────────────┘
```

### 積分統計
```
┌──────────┬──────────┬──────────┐
│    49    │    10    │    5     │
│  累計獲得 │  本月獲得 │ 積分來源  │
└──────────┴──────────┴──────────┘
```

### 積分記錄列表
```
📝 完成問卷
   完成問卷：消費者行為調查     +10
   2 小時前

🤝 互惠加成
   互填配對完成加成：產品調查    +2
   3 小時前

⏰ 逾期扣分
   未在期限內完成問卷          -5
   1 天前
```

---

## 🔧 故障排除

### 問題 1：仍然顯示權限錯誤
**解決方案：**
1. 確認規則已發布並生效
2. 清除瀏覽器緩存並重新登入
3. 檢查 Console 中的錯誤訊息

### 問題 2：規則發布後仍然沒有數據
**解決方案：**
1. 執行 `window.checkPointsRecords()` 檢查資料庫
2. 如果沒有記錄，執行 `window.addTestPoints()` 添加測試數據
3. 完成一次完整的問卷驗證流程

### 問題 3：統計數據不一致
**解決方案：**
```javascript
window.fixPointsData()
```
這會自動修復積分不一致的問題

---

## 📚 相關文檔

- [Firebase Firestore 安全規則文檔](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase CLI 文檔](https://firebase.google.com/docs/cli)

---

## ✅ 檢查清單

- [ ] Firestore 規則已部署
- [ ] 規則包含 `pointsRecords` 集合的讀取權限
- [ ] 在 Console 執行 `window.checkPointsRecords()` 成功
- [ ] Profile 頁面顯示正確的統計數據
- [ ] 積分記錄列表顯示完整

