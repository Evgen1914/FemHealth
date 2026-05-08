export const SYMPTOM_OPTIONS = [
  { value: 'mood', label: 'Настроение', emoji: '😔' },
  { value: 'anxiety', label: 'Тревога', emoji: '😰' },
  { value: 'libido', label: 'Либидо', emoji: '💗' },
  { value: 'headache', label: 'Головная боль', emoji: '🤕' },
  { value: 'bloating', label: 'Вздутие', emoji: '🫧' },
  { value: 'acne', label: 'Акне', emoji: '🔴' },
  { value: 'hair_loss', label: 'Выпадение волос', emoji: '💇' },
  { value: 'breast_pain', label: 'Боль в груди', emoji: '⚡' },
  { value: 'sugar_craving', label: 'Тяга к сладкому', emoji: '🍫' },
  { value: 'sleep_issues', label: 'Нарушения сна', emoji: '😴' },
  { value: 'fatigue', label: 'Усталость', emoji: '🔋' },
  { value: 'other', label: 'Другое', emoji: '📝' },
] as const;

export type SymptomValue = (typeof SYMPTOM_OPTIONS)[number]['value'];
