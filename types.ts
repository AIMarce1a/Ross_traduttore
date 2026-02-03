
export enum TaskType {
  ARTICLE_BLOG = 'ARTICLE_BLOG',
  AD_POST = 'AD_POST',
  EMAIL = 'EMAIL',
  MESSAGE = 'MESSAGE',
  REWRITE = 'REWRITE'
}

export interface ContentConfig {
  task: TaskType;
  tone: string;
  length: string;
  audience: string;
  objective: string;
  sourceLanguage: string;
  targetLanguage: string;
  keywords: string;
  description: string;
  useEmoji: string;
}

export interface StyleOption {
  id: TaskType;
  label: string;
  image: string;
}
