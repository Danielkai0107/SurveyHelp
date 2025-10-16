# 設計系統 - 表單元件

## 輸入框和選單樣式

根據新的UI設計，所有輸入框和下拉選單都採用統一的圓角風格。

### 基本輸入框
```html
<input class="input" placeholder="請輸入內容" />
```

### 下拉選單
```html
<select class="input">
  <option>選項 1</option>
  <option>選項 2</option>
</select>
```

### 文字區域
```html
<textarea class="input" placeholder="請輸入多行文字"></textarea>
```

### 表單群組
```html
<div class="form-group">
  <label class="label required">標籤名稱</label>
  <input class="input" placeholder="請輸入" />
  <div class="help-text">這是幫助文字</div>
</div>
```

### 表單行（並排）
```html
<div class="form-row">
  <div class="form-group">
    <label class="label">左側欄位</label>
    <input class="input" />
  </div>
  <div class="form-group">
    <label class="label">右側欄位</label>
    <select class="input">
      <option>選項</option>
    </select>
  </div>
</div>
```

### 錯誤狀態
```html
<div class="form-group">
  <label class="label required">必填欄位</label>
  <input class="input error" />
  <div class="error-message">這是錯誤訊息</div>
</div>
```

### 尺寸變體
```html
<!-- 小尺寸 -->
<input class="input input-sm" placeholder="小尺寸輸入框" />

<!-- 標準尺寸 -->
<input class="input" placeholder="標準尺寸輸入框" />

<!-- 大尺寸 -->
<input class="input input-lg" placeholder="大尺寸輸入框" />
```

## 設計特色

- **圓角邊框**: 24px 圓角，營造現代感
- **一致的內距**: 16px 上下，20px 左右
- **柔和的邊框**: 使用 #e5e7eb 作為預設邊框色
- **互動回饋**: hover 和 focus 狀態有微妙的顏色變化
- **自訂下拉箭頭**: 使用 SVG 圖示取代預設樣式
- **響應式設計**: 在手機版自動調整為單欄布局

## 顏色系統

- 預設邊框: `#e5e7eb`
- hover/focus 邊框: `#d1d5db`
- 錯誤邊框: `#ef4444`
- 佔位符文字: `#9ca3af`
- 錯誤背景: `#fef2f2`
