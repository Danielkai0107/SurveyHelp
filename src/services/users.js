import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'

// 用户服务
export const usersService = {
  // 获取用户资料
  async getUserProfile(userId) {
    try {
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      
      return null
    } catch (error) {
      console.error('获取用户资料失败:', error)
      throw error
    }
  },

  // 检查用户是否已完成资料设置
  async isProfileComplete(userId) {
    try {
      const profile = await this.getUserProfile(userId)
      
      if (!profile) return false
      
      // 检查必填字段
      return !!(
        profile.ageRange && 
        profile.gender && 
        profile.occupation &&
        profile.region
      )
    } catch (error) {
      console.error('检查用户资料完整性失败:', error)
      return false
    }
  },

  // 创建或更新用户资料
  async updateUserProfile(userId, profileData) {
    try {
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        // 更新现有资料
        await updateDoc(docRef, {
          ...profileData,
          updatedAt: serverTimestamp()
        })
      } else {
        // 创建新资料
        await setDoc(docRef, {
          ...profileData,
          totalPoints: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
      
      console.log('用户资料已更新:', userId)
      return true
    } catch (error) {
      console.error('更新用户资料失败:', error)
      throw error
    }
  },

  // 初始化用户资料（首次登入时调用）
  async initUserProfile(userId, userData) {
    try {
      const profile = await this.getUserProfile(userId)
      
      if (!profile) {
        // 创建基本资料
        await setDoc(doc(db, 'users', userId), {
          email: userData.email || null,
          displayName: userData.displayName || null,
          photoURL: userData.photoURL || null,
          totalPoints: 0,
          ageRange: null,
          gender: null,
          occupation: null,
          region: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        
        console.log('用户基本资料已创建:', userId)
      }
      
      return await this.getUserProfile(userId)
    } catch (error) {
      console.error('初始化用户资料失败:', error)
      throw error
    }
  }
}

