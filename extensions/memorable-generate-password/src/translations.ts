import { environment } from "@raycast/api";

export type Language = "en" | "zh";

export const translations = {
  en: {
    searchPlaceholder: "Filter by password or plaintext words...",
    results: "Results",
    itemsCount: "{count} items",
    source: "Source",
    regenerate: "Regenerate",
    openPreferences: "Open Extension Preferences",
    copyPassword: "Copy Password",
    copyPlaintext: "Copy Plaintext",
    passwordCopied: "Password copied to clipboard",
    plaintextCopied: "Plaintext copied to clipboard",
    generatedPassword: "Generated Password",
    components: "Components",
    transformationRules: "Transformation Rules",
    wordList: "Word List",
    separator: "Separator",
    casing: "Casing",
    leetSpeak: "LeetSpeak",
    prefixSuffix: "Prefix/Suffix",
    none: "(none)",
    yes: "Yes",
    no: "No",
    wordCount: "Word Count",
    totalLength: "Total Length",
    strengthScore: "Strength Score",
    entropy: "Entropy",
    sourceList: "Source List",
    strengthVeryStrong: "Very Strong",
    strengthStrong: "Strong",
    strengthModerate: "Moderate",
    strengthWeak: "Weak",
    maxCountError: "Count cannot be greater than 99",
    wordListDropdownTitle: "Word List",
    allWordLists: "All Word Lists",
    copyActions: "Password Actions",
    generationActions: "Generation",
    systemActions: "System",
    emptyTitle: "No Passwords Found",
    emptyDescription: "Try adjusting your word count or search query.",
    oxford: "Oxford 3000",
    idioms: "Chinese Idioms",
    poetry: "Chinese Poetry",
    tech: "Technology",
    nature: "Nature",
    custom: "Custom File",
    strengthLabel: "Strength",
    componentsLabel: "Components",
    generatedAt: "Generated at",
  },
  zh: {
    searchPlaceholder: "通过密码或原始词汇过滤...",
    results: "生成结果",
    itemsCount: "{count} 个项目",
    source: "来源",
    regenerate: "重新生成",
    openPreferences: "打开扩展设置",
    copyPassword: "复制密码",
    copyPlaintext: "复制原始词汇序列",
    passwordCopied: "密码已复制",
    plaintextCopied: "序列已复制",
    generatedPassword: "生成的密码",
    components: "组成部分",
    transformationRules: "转换规则",
    wordList: "词库",
    separator: "分隔符",
    casing: "大小写",
    leetSpeak: "字符替换 (Leet)",
    prefixSuffix: "前缀 / 后缀",
    none: "(无)",
    yes: "是",
    no: "否",
    wordCount: "单词数",
    totalLength: "总长度",
    strengthScore: "强度评分",
    entropy: "熵值 (Entropy)",
    sourceList: "词库来源",
    strengthVeryStrong: "极高强度",
    strengthStrong: "高强度",
    strengthModerate: "中等强度",
    strengthWeak: "弱强度",
    maxCountError: "数量不能超过 99",
    wordListDropdownTitle: "切换词库",
    allWordLists: "全部词库",
    copyActions: "密码操作",
    generationActions: "生成控制",
    systemActions: "系统设置",
    emptyTitle: "未找到密码",
    emptyDescription: "请尝试调整单词数量或搜索关键词",
    oxford: "牛津 3000",
    idioms: "中文成语",
    poetry: "精选诗词",
    tech: "技术术语",
    nature: "自然地理",
    custom: "自定义文件",
    strengthLabel: "安全强度",
    componentsLabel: "组成单词",
    generatedAt: "生成于",
  },
};

export function getLanguage(preferencesLanguage: string): Language {
  if (preferencesLanguage === "auto") {
    return (environment as any).language === "zh" ? "zh" : "en";
  }
  return preferencesLanguage as Language;
}

export function t(
  key: keyof typeof translations.en,
  lang: Language,
  variables?: Record<string, string | number>
): string {
  let text = translations[lang][key] || translations.en[key] || key;
  if (variables) {
    Object.entries(variables).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}
