import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase.js';

// 選項管理服務
export const optionsService = {
  // 快取選項資料
  _cache: new Map(),
  _cacheExpiry: new Map(),
  CACHE_DURATION: 5 * 60 * 1000, // 5分鐘快取

  // 獲取所有選項類型
  async getAllOptions() {
    try {
      const optionsRef = collection(db, 'options');
      const snapshot = await getDocs(optionsRef);
      
      const allOptions = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        allOptions[data.type] = data.items || [];
      });
      
      // 更新快取
      this._cache.set('allOptions', allOptions);
      this._cacheExpiry.set('allOptions', Date.now() + this.CACHE_DURATION);
      
      return allOptions;
    } catch (error) {
      console.error('獲取選項失敗:', error);
      throw error;
    }
  },

  // 獲取特定類型的選項
  async getOptionsByType(type) {
    try {
      // 檢查快取
      const cacheKey = `options_${type}`;
      if (this._cache.has(cacheKey) && this._cacheExpiry.get(cacheKey) > Date.now()) {
        return this._cache.get(cacheKey);
      }

      const docRef = doc(db, 'options', type);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const items = data.items || [];
        
        // 更新快取
        this._cache.set(cacheKey, items);
        this._cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);
        
        return items;
      } else {
        return [];
      }
    } catch (error) {
      console.error(`獲取 ${type} 選項失敗:`, error);
      throw error;
    }
  },

  // 更新選項
  async updateOptions(type, items) {
    try {
      const docRef = doc(db, 'options', type);
      await setDoc(docRef, {
        type,
        items: items.map((item, index) => ({
          ...item,
          order: item.order || index + 1
        })),
        updatedAt: serverTimestamp()
      });

      // 清除快取
      this._cache.delete(`options_${type}`);
      this._cache.delete('allOptions');
      
      return true;
    } catch (error) {
      console.error(`更新 ${type} 選項失敗:`, error);
      throw error;
    }
  },

  // 根據 ID 獲取標籤
  getLabelById(options, id) {
    if (!options || !Array.isArray(options)) return id;
    const option = options.find(opt => opt.id === id);
    return option ? option.label : id;
  },

  // 根據標籤獲取 ID
  getIdByLabel(options, label) {
    if (!options || !Array.isArray(options)) return label;
    const option = options.find(opt => opt.label === label);
    return option ? option.id : label;
  },

  // 批量轉換 ID 到標籤
  convertIdsToLabels(options, ids) {
    if (!Array.isArray(ids)) return [];
    return ids.map(id => this.getLabelById(options, id));
  },

  // 批量轉換標籤到 ID
  convertLabelsToIds(options, labels) {
    if (!Array.isArray(labels)) return [];
    return labels.map(label => this.getIdByLabel(options, label));
  },

  // 清除快取
  clearCache() {
    this._cache.clear();
    this._cacheExpiry.clear();
  }
};

// 預設選項資料
export const defaultOptions = {
  fields: [
    { id: 'academic', label: '學術', order: 1 },
    { id: 'business', label: '商業', order: 2 },
    { id: 'social', label: '社會', order: 3 },
    { id: 'education', label: '教育', order: 4 },
    { id: 'health', label: '健康', order: 5 },
    { id: 'technology', label: '科技', order: 6 }
  ],
  
  topics: [
    { id: 'campus', label: '校園', order: 1 },
    { id: 'consumption', label: '消費行為', order: 2 },
    { id: 'lifestyle', label: '生活型態', order: 3 },
    { id: 'food', label: '餐飲', order: 4 },
    { id: 'service', label: '服務體驗', order: 5 },
    { id: 'remote-work', label: '遠端工作', order: 6 },
    { id: 'efficiency', label: '效率', order: 7 },
    { id: 'mental-health', label: '心理健康', order: 8 },
    { id: 'finance', label: '理財', order: 9 },
    { id: 'travel', label: '旅遊', order: 10 },
    { id: 'content', label: '內容付費', order: 11 },
    { id: 'energy', label: '能源', order: 12 },
    { id: 'transport', label: '交通', order: 13 },
    { id: 'ai', label: 'AI', order: 14 }
  ],
  
  purposes: [
    { id: 'research', label: '研究', order: 1 },
    { id: 'operation', label: '營運', order: 2 },
    { id: 'market-research', label: '市場調查', order: 3 },
    { id: 'product-development', label: '產品開發', order: 4 },
    { id: 'academic-research', label: '學術研究', order: 5 }
  ],
  
  languages: [
    { id: 'zh', label: '中文', order: 1 },
    { id: 'en', label: 'English', order: 2 },
    { id: 'ja', label: '日本語', order: 3 },
    { id: 'ko', label: '한국어', order: 4 }
  ],
  
  organizationTypes: [
    { id: 'individual', label: '個人', order: 1 },
    { id: 'school', label: '學校', order: 2 },
    { id: 'company', label: '企業', order: 3 }
  ],
  
  targetAges: [
    { id: '18-25', label: '18-25歲', order: 1 },
    { id: '26-35', label: '26-35歲', order: 2 },
    { id: '36-45', label: '36-45歲', order: 3 },
    { id: '46-55', label: '46-55歲', order: 4 },
    { id: '56+', label: '56歲以上', order: 5 }
  ],
  
  targetGroups: [
    { id: 'student', label: '學生', order: 1 },
    { id: 'office-worker', label: '上班族', order: 2 },
    { id: 'housewife', label: '家庭主婦', order: 3 },
    { id: 'retired', label: '退休人士', order: 4 },
    { id: 'freelancer', label: '自由工作者', order: 5 }
  ],
  
  targetGenders: [
    { id: 'male', label: '男性', order: 1 },
    { id: 'female', label: '女性', order: 2 },
    { id: 'other', label: '其他', order: 3 }
  ],
  
  // 用戶年齡區間
  ageRanges: [
    { id: 'under-18', label: '未滿18歲', order: 1 },
    { id: '18-25', label: '18-25歲', order: 2 },
    { id: '26-35', label: '26-35歲', order: 3 },
    { id: '36-45', label: '36-45歲', order: 4 },
    { id: '46-55', label: '46-55歲', order: 5 },
    { id: '56+', label: '56歲以上', order: 6 }
  ],
  
  // 用戶性別
  genders: [
    { id: 'male', label: '男性', order: 1 },
    { id: 'female', label: '女性', order: 2 },
    { id: 'non-binary', label: '非二元性別', order: 3 },
    { id: 'prefer-not-say', label: '不願透露', order: 4 }
  ],
  
  // 用戶所在地區
  regions: [
    { id: 'north', label: '北部地區', order: 1 },
    { id: 'central', label: '中部地區', order: 2 },
    { id: 'south', label: '南部地區', order: 3 },
    { id: 'east', label: '東部地區', order: 4 },
    { id: 'island', label: '離島', order: 5 },
    { id: 'overseas', label: '海外', order: 6 }
  ]
};
