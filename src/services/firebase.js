import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  signInAnonymously
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import { verificationService } from './verification.js';
import { optionsService } from './options.js';

// 認證服務
export const authService = {
  // 註冊用戶
  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 更新用戶資料
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // 登入用戶
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // 登出用戶
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  // 監聽認證狀態變化
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // 獲取當前用戶
  getCurrentUser() {
    return auth.currentUser;
  },

  // 匿名登入
  async signInAnonymously() {
    try {
      const userCredential = await signInAnonymously(auth);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }
};

// 問卷服務
export const surveyService = {
  // 創建問卷（支援驗證連結）
  async createSurvey(surveyData) {
    try {
      // 生成驗證相關資料
      const verificationId = surveyData.verificationId || verificationService.generateVerificationId();
      const verificationLink = verificationService.generateVerificationLink(verificationId);
      
      const docRef = await addDoc(collection(db, 'surveys'), {
        ...surveyData,
        verificationId,
        verificationLink,
        verificationCount: 0,
        filled: 0,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid || null
      });
      
      return {
        surveyId: docRef.id,
        verificationId,
        verificationLink
      };
    } catch (error) {
      throw error;
    }
  },

  // 獲取問卷
  async getSurvey(surveyId) {
    try {
      const docRef = doc(db, 'surveys', surveyId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('問卷不存在');
      }
    } catch (error) {
      throw error;
    }
  },

  // 獲取問卷並轉換標籤顯示
  async getSurveyWithLabels(surveyId) {
    try {
      const survey = await this.getSurvey(surveyId);
      const allOptions = await optionsService.getAllOptions();
      
      return {
        ...survey,
        fieldLabel: optionsService.getLabelById(allOptions.fields, survey.field),
        purposeLabel: optionsService.getLabelById(allOptions.purposes, survey.purpose),
        languageLabel: optionsService.getLabelById(allOptions.languages, survey.language),
        organizationTypeLabel: optionsService.getLabelById(allOptions.organizationTypes, survey.organizationType),
        targetAgeLabel: optionsService.getLabelById(allOptions.targetAges, survey.targetAge),
        targetGroupLabel: optionsService.getLabelById(allOptions.targetGroups, survey.targetGroup),
        targetGenderLabel: optionsService.getLabelById(allOptions.targetGenders, survey.targetGender),
        tagsLabels: optionsService.convertIdsToLabels(allOptions.topics, survey.tags || [])
      };
    } catch (error) {
      throw error;
    }
  },

  // 獲取所有問卷
  async getAllSurveys() {
    try {
      // 先獲取所有問卷，然後在客戶端篩選和排序
      const querySnapshot = await getDocs(collection(db, 'surveys'));
      
      const surveys = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(survey => survey.isActive !== false) // 篩選活躍問卷
        .sort((a, b) => {
          // 按創建時間降序排序
          const aTime = a.createdAt?.toMillis() || 0;
          const bTime = b.createdAt?.toMillis() || 0;
          return bTime - aTime;
        });
      
      return surveys;
    } catch (error) {
      throw error;
    }
  },

  // 獲取所有問卷並轉換標籤顯示
  async getAllSurveysWithLabels() {
    try {
      const surveys = await this.getAllSurveys();
      const allOptions = await optionsService.getAllOptions();
      
      return surveys.map(survey => ({
        ...survey,
        fieldLabel: optionsService.getLabelById(allOptions.fields, survey.field),
        tagsLabels: optionsService.convertIdsToLabels(allOptions.topics, survey.tags || [])
      }));
    } catch (error) {
      throw error;
    }
  },

  // 根據篩選條件獲取問卷
  async getSurveysWithFilters(filters = {}) {
    try {
      // 獲取所有問卷，然後在客戶端篩選
      const querySnapshot = await getDocs(collection(db, 'surveys'));
      
      let surveys = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(survey => survey.isActive !== false); // 篩選活躍問卷

      // 客戶端篩選
      if (filters.field) {
        surveys = surveys.filter(survey => survey.field === filters.field);
      }
      
      if (filters.topics && filters.topics.length > 0) {
        surveys = surveys.filter(survey => {
          const surveyTags = survey.tags || [];
          return filters.topics.some(topic => surveyTags.includes(topic));
        });
      }

      // 客戶端排序
      surveys.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });

      // 轉換標籤顯示
      const allOptions = await optionsService.getAllOptions();
      return surveys.map(survey => ({
        ...survey,
        fieldLabel: optionsService.getLabelById(allOptions.fields, survey.field),
        tagsLabels: optionsService.convertIdsToLabels(allOptions.topics, survey.tags || [])
      }));
    } catch (error) {
      throw error;
    }
  },

  // 獲取用戶的問卷
  async getUserSurveys(userId) {
    try {
      // 獲取所有問卷，然後在客戶端篩選
      const querySnapshot = await getDocs(collection(db, 'surveys'));
      
      const surveys = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(survey => survey.createdBy === userId)
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0;
          const bTime = b.createdAt?.toMillis() || 0;
          return bTime - aTime;
        });
      
      return surveys;
    } catch (error) {
      throw error;
    }
  },

  // 更新問卷
  async updateSurvey(surveyId, updateData) {
    try {
      const docRef = doc(db, 'surveys', surveyId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw error;
    }
  },

  // 刪除問卷
  async deleteSurvey(surveyId) {
    try {
      const docRef = doc(db, 'surveys', surveyId);
      await deleteDoc(docRef);
    } catch (error) {
      throw error;
    }
  }
};

// 回答服務
export const answerService = {
  // 提交回答
  async submitAnswer(surveyId, answerData) {
    try {
      const docRef = await addDoc(collection(db, 'answers'), {
        surveyId,
        ...answerData,
        submittedAt: serverTimestamp(),
        submittedBy: auth.currentUser?.uid || null
      });
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  // 獲取問卷的所有回答
  async getSurveyAnswers(surveyId) {
    try {
      const q = query(
        collection(db, 'answers'),
        where('surveyId', '==', surveyId),
        orderBy('submittedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  },

  // 獲取用戶的回答
  async getUserAnswers(userId) {
    try {
      const q = query(
        collection(db, 'answers'),
        where('submittedBy', '==', userId),
        orderBy('submittedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  }
};
