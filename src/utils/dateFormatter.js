// 日期格式化工具函數

export function formatDate(date) {
  if (!date) return '未設定';
  
  // 如果是 Firestore Timestamp
  if (date && typeof date.toDate === 'function') {
    date = date.toDate();
  }
  
  // 如果是字符串，嘗試解析
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  // 如果不是有效日期
  if (!(date instanceof Date) || isNaN(date)) {
    return '未設定';
  }
  
  // 格式化為 YYYY年MM月DD日
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${year}年${month}月${day}日`;
}

export function formatDateTime(date) {
  if (!date) return '未設定';
  
  // 如果是 Firestore Timestamp
  if (date && typeof date.toDate === 'function') {
    date = date.toDate();
  }
  
  // 如果是字符串，嘗試解析
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  // 如果不是有效日期
  if (!(date instanceof Date) || isNaN(date)) {
    return '未設定';
  }
  
  // 格式化為 YYYY年MM月DD日 HH:mm
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

export function formatRelativeTime(date) {
  if (!date) return '未知時間';
  
  // 如果是 Firestore Timestamp
  if (date && typeof date.toDate === 'function') {
    date = date.toDate();
  }
  
  // 如果是字符串，嘗試解析
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  // 如果不是有效日期
  if (!(date instanceof Date) || isNaN(date)) {
    return '未知時間';
  }
  
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 7) {
    return formatDate(date);
  } else if (diffDays > 0) {
    return `${diffDays}天前`;
  } else if (diffHours > 0) {
    return `${diffHours}小時前`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}分鐘前`;
  } else {
    return '剛剛';
  }
}
