import { ref, onMounted } from 'vue';
import { optionsService } from '../services/options.js';

// 全域選項狀態
const allOptions = ref({});
const isLoading = ref(false);
const isInitialized = ref(false);

export function useOptions() {
  // 初始化選項資料
  const initOptions = async () => {
    if (isInitialized.value) return allOptions.value;
    
    isLoading.value = true;
    try {
      const options = await optionsService.getAllOptions();
      allOptions.value = options;
      isInitialized.value = true;
      return options;
    } catch (error) {
      console.error('初始化選項失敗:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // 獲取特定類型的選項
  const getOptions = (type) => {
    return allOptions.value[type] || [];
  };

  // 根據 ID 獲取標籤
  const getLabelById = (type, id) => {
    const options = getOptions(type);
    return optionsService.getLabelById(options, id);
  };

  // 根據標籤獲取 ID
  const getIdByLabel = (type, label) => {
    const options = getOptions(type);
    return optionsService.getIdByLabel(options, label);
  };

  // 批量轉換 ID 到標籤
  const convertIdsToLabels = (type, ids) => {
    const options = getOptions(type);
    return optionsService.convertIdsToLabels(options, ids);
  };

  // 批量轉換標籤到 ID
  const convertLabelsToIds = (type, labels) => {
    const options = getOptions(type);
    return optionsService.convertLabelsToIds(options, labels);
  };

  // 重新載入選項
  const refreshOptions = async () => {
    optionsService.clearCache();
    isInitialized.value = false;
    return await initOptions();
  };

  // 自動初始化
  onMounted(() => {
    if (!isInitialized.value) {
      initOptions();
    }
  });

  return {
    allOptions,
    isLoading,
    isInitialized,
    initOptions,
    getOptions,
    getLabelById,
    getIdByLabel,
    convertIdsToLabels,
    convertLabelsToIds,
    refreshOptions
  };
}

// 特定選項類型的 composables
export function useFieldOptions() {
  const { getOptions, getLabelById, getIdByLabel } = useOptions();
  
  return {
    fieldOptions: () => getOptions('fields'),
    getFieldLabel: (id) => getLabelById('fields', id),
    getFieldId: (label) => getIdByLabel('fields', label)
  };
}

export function useTopicOptions() {
  const { getOptions, getLabelById, getIdByLabel, convertIdsToLabels, convertLabelsToIds } = useOptions();
  
  return {
    topicOptions: () => getOptions('topics'),
    getTopicLabel: (id) => getLabelById('topics', id),
    getTopicId: (label) => getIdByLabel('topics', label),
    convertTopicIdsToLabels: (ids) => convertIdsToLabels('topics', ids),
    convertTopicLabelsToIds: (labels) => convertLabelsToIds('topics', labels)
  };
}

export function usePurposeOptions() {
  const { getOptions, getLabelById, getIdByLabel } = useOptions();
  
  return {
    purposeOptions: () => getOptions('purposes'),
    getPurposeLabel: (id) => getLabelById('purposes', id),
    getPurposeId: (label) => getIdByLabel('purposes', label)
  };
}

export function useLanguageOptions() {
  const { getOptions, getLabelById, getIdByLabel } = useOptions();
  
  return {
    languageOptions: () => getOptions('languages'),
    getLanguageLabel: (id) => getLabelById('languages', id),
    getLanguageId: (label) => getIdByLabel('languages', label)
  };
}

export function useOrganizationTypeOptions() {
  const { getOptions, getLabelById, getIdByLabel } = useOptions();
  
  return {
    organizationTypeOptions: () => getOptions('organizationTypes'),
    getOrganizationTypeLabel: (id) => getLabelById('organizationTypes', id),
    getOrganizationTypeId: (label) => getIdByLabel('organizationTypes', label)
  };
}

export function useTargetOptions() {
  const { getOptions, getLabelById, getIdByLabel } = useOptions();
  
  return {
    targetAgeOptions: () => getOptions('targetAges'),
    targetGroupOptions: () => getOptions('targetGroups'),
    targetGenderOptions: () => getOptions('targetGenders'),
    getTargetAgeLabel: (id) => getLabelById('targetAges', id),
    getTargetGroupLabel: (id) => getLabelById('targetGroups', id),
    getTargetGenderLabel: (id) => getLabelById('targetGenders', id),
    getTargetAgeId: (label) => getIdByLabel('targetAges', label),
    getTargetGroupId: (label) => getIdByLabel('targetGroups', label),
    getTargetGenderId: (label) => getIdByLabel('targetGenders', label)
  };
}
