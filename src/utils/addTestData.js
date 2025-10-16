import { surveyService } from '../services/firebase.js';

// 測試問卷資料
const testSurveys = [
  {
    title: "大學生消費習慣研究",
    description: "探索大學生在不同情境下的消費決策與偏好。",
    organizationType: "school",
    organization: "NTU Marketing Lab",
    field: "academic",
    purpose: "research",
    language: "zh",
    tags: ["campus", "consumption", "lifestyle"],
    minutes: 6,
    targetCount: 50,
    incentive: 10,
    link: "https://forms.google.com/test1",
    targetAge: "18-25",
    targetGroup: "student",
    targetGender: ""
  },
  {
    title: "外送平台滿意度調查",
    description: "評估外送平台的滿意度、推薦意願與流失原因。",
    organizationType: "company",
    organization: "Biz Research Co.",
    field: "business",
    purpose: "market-research",
    language: "zh",
    tags: ["food", "service"],
    minutes: 7,
    targetCount: 300,
    incentive: 10,
    link: "https://forms.google.com/test2",
    targetAge: "26-35",
    targetGroup: "office-worker",
    targetGender: ""
  },
  {
    title: "遠端工作生產力研究",
    description: "探討混合辦公對個人與團隊生產力的影響。",
    organizationType: "company",
    organization: "HR Analytics Group",
    field: "business",
    purpose: "research",
    language: "en",
    tags: ["remote-work", "efficiency"],
    minutes: 8,
    targetCount: 120,
    incentive: 12,
    link: "https://forms.google.com/test3",
    targetAge: "26-35",
    targetGroup: "office-worker",
    targetGender: ""
  }
];

// 添加測試資料到 Firestore
export async function addTestSurveys() {
  console.log('開始添加測試問卷資料...');
  
  try {
    const results = [];
    
    for (const surveyData of testSurveys) {
      try {
        const result = await surveyService.createSurvey(surveyData);
        results.push(result);
        console.log(`✓ 已添加問卷: ${surveyData.title}`);
      } catch (error) {
        console.error(`✗ 添加問卷失敗 (${surveyData.title}):`, error);
      }
    }
    
    console.log(`✓ 測試資料添加完成，共添加 ${results.length} 個問卷`);
    return results;
    
  } catch (error) {
    console.error('添加測試資料失敗:', error);
    throw error;
  }
}

// 在瀏覽器控制台中使用
if (typeof window !== 'undefined') {
  window.addTestSurveys = addTestSurveys;
}
