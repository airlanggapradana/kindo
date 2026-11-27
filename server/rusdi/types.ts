export type ActionId = 'open_screening' | 'open_education' | 'open_consultation' | 'open_puskesmas' | 'open_onboarding' | 'open_dashboard';
export interface KnowledgeDocument { id: string; title: string; keywords: string[]; answer: string; action: ActionId | null }
export interface KnowledgeQuestion { number: number; text: string; appText: string; category: string; originalCategory: string; row: number }
export interface KnowledgeForm { ageMonths: number; file: string; hash: string; sheet: string; questions: KnowledgeQuestion[] }
export interface KnowledgeSnapshot { version: string; bankHash: string; sourceHash: string; documents: KnowledgeDocument[]; forms: KnowledgeForm[]; textDifferences: { ageMonths: number; number: number }[] }
export interface ChatInput { message: string; history: { role: 'user' | 'assistant'; content: string }[]; locale: 'id'; currentView?: string }
export interface ChatAnswer { requestId: string; answer: string; mode: 'facts' | 'rag' | 'faq' | 'not_found' | 'restricted' | 'unavailable'; sources: { id: string; title: string }[]; actions: { id: ActionId; label: string }[]; knowledgeVersion: string }
