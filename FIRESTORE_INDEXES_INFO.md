# Firestore 索引部署說明

## ✅ 已完成的操作

1. 創建了 `firestore.indexes.json` 配置檔
2. 更新了 `firebase.json` 以包含 Firestore 配置
3. 成功部署索引到 Firebase

## 📋 已部署的索引

### 1. pointsRecords 集合
- **欄位**: `userId` (升序) + `createdAt` (降序)
- **用途**: 讓用戶可以查詢自己的積分記錄並按時間排序

### 2. matches 集合
- **欄位**: `status` (升序) + `expireAt` (升序)
- **用途**: 檢查過期的配對記錄

## ⏳ 接下來會發生什麼

Firebase 正在後台建立這些索引。你可以：

1. **查看建立進度**：
   - 前往 [Firebase Console - Firestore Indexes](https://console.firebase.google.com/project/surveyhelp-891d4/firestore/indexes)
   - 你會看到索引狀態：
     - 🟡 "Building" = 建立中
     - 🟢 "Enabled" = 已完成，可以使用

2. **建立時間**：
   - 小型資料庫（<1000筆）：幾分鐘
   - 中型資料庫（1000-10000筆）：10-30分鐘
   - 大型資料庫（>10000筆）：可能需要幾小時

3. **在索引建立期間**：
   - 應用程式仍然可以運行
   - 但相關查詢會顯示錯誤（就像你之前看到的）
   - 索引完成後，錯誤會自動消失

## 🔍 如何確認索引已完成

### 方法 1：查看 Firebase Console
訪問：https://console.firebase.google.com/project/surveyhelp-891d4/firestore/indexes

### 方法 2：重新載入應用程式
索引完成後：
- 積分記錄頁面會正常顯示
- 不再有 "The query requires an index" 錯誤
- 過期檢查功能會正常運作

## 📝 相關檔案

- `firestore.indexes.json` - 索引配置檔
- `firestore.rules` - Firestore 安全規則
- `firebase.json` - Firebase 項目配置

## 🔧 未來維護

如果你需要添加新的索引：

1. 編輯 `firestore.indexes.json`
2. 執行部署指令：
   ```bash
   firebase deploy --only firestore:indexes
   ```

或者直接點擊錯誤訊息中的連結，在 Firebase Console 手動建立。

## 💡 提示

- 索引配置已加入版本控制，團隊成員可以同步這些設定
- 定期檢查 Firebase Console 的索引使用情況
- 刪除不再使用的索引可以節省資源

