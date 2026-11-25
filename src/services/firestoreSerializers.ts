import {
  DocumentItem,
  EmergencyContact,
  FamilyMember,
  Goal,
  HealthStat,
  Language,
  LearningItem,
  NoteItem,
  RoutineItem,
  Task,
  ThemePreference,
  Transaction,
  UserSettings,
} from '../types';

export type LifeFlowCollection =
  | 'tasks'
  | 'goals'
  | 'routines'
  | 'calendar'
  | 'finance'
  | 'notes'
  | 'documents'
  | 'health'
  | 'family'
  | 'learning'
  | 'emergency'
  | 'settings';

export type FirestoreOperationType = 'list' | 'get' | 'create' | 'update' | 'delete' | 'write';

export interface FirestoreErrorInfo {
  error: string;
  code: string;
  operationType: FirestoreOperationType;
  path: string;
  uid: string | null;
}

export interface CalendarEventPayloadItem {
  id: string;
  title: string;
  time: string;
  category: string;
  attendees: string;
  day: number;
}

const VALID_DOC_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

export function isValidFirestoreDocId(id: string): boolean {
  return typeof id === 'string' && VALID_DOC_ID_REGEX.test(id);
}

export function generateFirestoreDocId(prefix: string): string {
  const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '') || 'item';
  const rand = Math.random().toString(36).slice(2, 8);
  const candidate = `${safePrefix}_${Date.now()}_${rand}`.slice(0, 128);
  return isValidFirestoreDocId(candidate) ? candidate : `item_${Date.now()}`;
}

function clampString(val: unknown, maxLen: number, fallback = ''): string {
  const s = typeof val === 'string' ? val.trim() : fallback;
  return s.slice(0, maxLen);
}

function clampNumber(val: unknown, min: number, max?: number, fallback = 0): number {
  const num = typeof val === 'number' && Number.isFinite(val) ? val : fallback;
  const boundedLow = Math.max(min, num);
  return max !== undefined ? Math.min(max, boundedLow) : boundedLow;
}

// ============================================================================
// OUTGOING FIRESTORE SERIALIZERS (MUST NEVER CONTAIN CLIENT `id`)
// Every returned object strictly complies with firestore.rules `hasAll` & `hasOnly`.
// ============================================================================

export function serializeTask(task: Omit<Task, 'id'> | Task): Record<string, unknown> {
  const validCategories: Task['category'][] = ['Work', 'Personal', 'Health', 'Finance', 'Family'];
  const validPriorities: Task['priority'][] = ['High', 'Medium', 'Low'];

  const title = clampString(task.title, 200);
  if (!title) {
    throw new Error('Task title is required');
  }

  const payload: Record<string, unknown> = {
    title,
    category: validCategories.includes(task.category) ? task.category : 'Personal',
    priority: validPriorities.includes(task.priority) ? task.priority : 'Medium',
    completed: Boolean(task.completed),
  };

  if (typeof task.dueDate === 'string' && task.dueDate.trim().length > 0) {
    payload.dueDate = clampString(task.dueDate, 50);
  }
  if (typeof task.notes === 'string' && task.notes.trim().length > 0) {
    payload.notes = clampString(task.notes, 500);
  }
  return payload;
}

export function serializeGoal(goal: Omit<Goal, 'id'> | Goal): Record<string, unknown> {
  const validCategories: Goal['category'][] = ['Career', 'Health', 'Wealth', 'Personal'];

  const title = clampString(goal.title, 200);
  if (!title) {
    throw new Error('Goal title is required');
  }

  const payload: Record<string, unknown> = {
    title,
    category: validCategories.includes(goal.category) ? goal.category : 'Personal',
    progress: clampNumber(goal.progress, 0, 100, 0),
  };

  if (typeof goal.targetDate === 'string' && goal.targetDate.trim().length > 0) {
    payload.targetDate = clampString(goal.targetDate, 50);
  }

  if (Array.isArray(goal.milestones)) {
    payload.milestones = goal.milestones.slice(0, 50).map((m, idx) => ({
      id: clampString(m?.id, 64, `m_${idx + 1}`),
      title: clampString(m?.title, 200, 'Milestone'),
      completed: Boolean(m?.completed),
    }));
  }

  return payload;
}

export function serializeRoutine(routine: Omit<RoutineItem, 'id'> | RoutineItem): Record<string, unknown> {
  const validCategories: RoutineItem['category'][] = ['Morning', 'Afternoon', 'Evening'];

  const title = clampString(routine.title, 200);
  const time = clampString(routine.time, 20);
  if (!title || !time) {
    throw new Error('Routine title and time are required');
  }

  return {
    time,
    title,
    category: validCategories.includes(routine.category) ? routine.category : 'Morning',
    completed: Boolean(routine.completed),
    streak: clampNumber(routine.streak, 0, undefined, 0),
  };
}

export function serializeCalendarEvent(ev: Omit<CalendarEventPayloadItem, 'id'> | CalendarEventPayloadItem): Record<string, unknown> {
  const title = clampString(ev.title, 200);
  const time = clampString(ev.time, 50);
  const category = clampString(ev.category, 50, 'Personal');
  if (!title || !time) {
    throw new Error('Event title and time are required');
  }

  const payload: Record<string, unknown> = {
    title,
    time,
    category,
    day: Math.round(clampNumber(ev.day, 1, 31, 1)),
  };

  if (typeof ev.attendees === 'string' && ev.attendees.trim().length > 0) {
    payload.attendees = clampString(ev.attendees, 100);
  }

  return payload;
}

export function serializeTransaction(tx: Omit<Transaction, 'id'> | Transaction): Record<string, unknown> {
  const validTypes: Transaction['type'][] = ['income', 'expense'];
  const validCategories: Transaction['category'][] = ['Housing', 'Food', 'Transport', 'Investment', 'Salary', 'Leisure'];

  const title = clampString(tx.title, 200);
  const date = clampString(tx.date, 30);
  if (!title || !date || typeof tx.amount !== 'number' || !Number.isFinite(tx.amount)) {
    throw new Error('Valid transaction title, finite amount, and date are required');
  }

  return {
    title,
    amount: tx.amount,
    type: validTypes.includes(tx.type) ? tx.type : 'expense',
    category: validCategories.includes(tx.category) ? tx.category : 'Food',
    date,
  };
}

export function serializeNote(note: Omit<NoteItem, 'id'> | NoteItem): Record<string, unknown> {
  const validFolders: NoteItem['folder'][] = ['Personal', 'Ideas', 'Journal', 'Work'];

  const title = clampString(note.title, 200);
  const updatedAt = clampString(note.updatedAt, 30);
  if (!title || !updatedAt) {
    throw new Error('Note title and updatedAt are required');
  }

  return {
    title,
    folder: validFolders.includes(note.folder) ? note.folder : 'Personal',
    content: clampString(note.content, 5000),
    updatedAt,
  };
}

export function serializeDocument(docItem: Omit<DocumentItem, 'id'> | DocumentItem): Record<string, unknown> {
  const validCategories: DocumentItem['category'][] = ['Identity', 'Finance', 'Medical', 'Legal', 'Real Estate'];

  const name = clampString(docItem.name, 200);
  const uploadDate = clampString(docItem.uploadDate, 30);
  const size = clampString(docItem.size, 20, '0 KB');
  if (!name || !uploadDate || !size) {
    throw new Error('Document name, uploadDate, and size are required');
  }

  const payload: Record<string, unknown> = {
    name,
    category: validCategories.includes(docItem.category) ? docItem.category : 'Identity',
    uploadDate,
    size,
  };

  if (typeof docItem.expiryDate === 'string' && docItem.expiryDate.trim().length > 0) {
    payload.expiryDate = clampString(docItem.expiryDate, 30);
  }

  return payload;
}

export function serializeHealth(health: HealthStat): Record<string, unknown> {
  return {
    waterDrank: clampNumber(health.waterDrank, 0, undefined, 0),
    sleepHours: clampNumber(health.sleepHours, 0, undefined, 0),
    weight: clampNumber(health.weight, 0, undefined, 0),
    steps: clampNumber(health.steps, 0, undefined, 0),
    heartRate: clampNumber(health.heartRate, 0, undefined, 0),
  };
}

export function serializeFamilyMember(member: Omit<FamilyMember, 'id'> | FamilyMember): Record<string, unknown> {
  const name = clampString(member.name, 100);
  const relation = clampString(member.relation, 50);
  const status = clampString(member.status, 200);
  if (!name || !relation) {
    throw new Error('Family member name and relation are required');
  }

  const payload: Record<string, unknown> = {
    name,
    relation,
    status,
  };

  if (typeof member.avatarColor === 'string' && member.avatarColor.trim().length > 0) {
    payload.avatarColor = clampString(member.avatarColor, 50);
  }

  return payload;
}

export function serializeLearningItem(item: Omit<LearningItem, 'id'> | LearningItem): Record<string, unknown> {
  const validStatuses: LearningItem['status'][] = ['In Progress', 'Completed', 'Bookmarked'];

  const title = clampString(item.title, 200);
  const provider = clampString(item.provider, 100);
  const category = clampString(item.category, 50, 'General');
  if (!title || !provider) {
    throw new Error('Learning title and provider are required');
  }

  return {
    title,
    provider,
    progress: clampNumber(item.progress, 0, 100, 0),
    category,
    status: validStatuses.includes(item.status) ? item.status : 'In Progress',
  };
}

export function serializeEmergencyContact(contact: Omit<EmergencyContact, 'id'> | EmergencyContact): Record<string, unknown> {
  const name = clampString(contact.name, 100);
  const phone = clampString(contact.phone, 50);
  if (!name || !phone) {
    throw new Error('Emergency contact name and phone are required');
  }

  const payload: Record<string, unknown> = {
    name,
    phone,
  };

  if (typeof contact.relation === 'string' && contact.relation.trim().length > 0) {
    payload.relation = clampString(contact.relation, 50);
  }

  return payload;
}

export function serializeSettings(settings: UserSettings): Record<string, unknown> {
  const validLanguages: Language[] = ['en', 'bn', 'ar'];
  const language: Language = validLanguages.includes(settings.language) ? settings.language : 'en';

  const payload: Record<string, unknown> = {
    language,
  };

  if (typeof settings.theme === 'string' && settings.theme.trim().length > 0) {
    payload.theme = clampString(settings.theme, 30);
  }

  return payload;
}

export function serializeForCollection(collectionName: LifeFlowCollection, item: unknown): Record<string, unknown> {
  switch (collectionName) {
    case 'tasks':
      return serializeTask(item as Task);
    case 'goals':
      return serializeGoal(item as Goal);
    case 'routines':
      return serializeRoutine(item as RoutineItem);
    case 'calendar':
      return serializeCalendarEvent(item as CalendarEventPayloadItem);
    case 'finance':
      return serializeTransaction(item as Transaction);
    case 'notes':
      return serializeNote(item as NoteItem);
    case 'documents':
      return serializeDocument(item as DocumentItem);
    case 'health':
      return serializeHealth(item as HealthStat);
    case 'family':
      return serializeFamilyMember(item as FamilyMember);
    case 'learning':
      return serializeLearningItem(item as LearningItem);
    case 'emergency':
      return serializeEmergencyContact(item as EmergencyContact);
    case 'settings':
      return serializeSettings(item as UserSettings);
  }
}

// ============================================================================
// INCOMING FIRESTORE DESERIALIZERS (RESTORE `id` FROM `doc.id`)
// ============================================================================

export function deserializeTask(id: string, data: Record<string, unknown>): Task {
  return {
    id,
    title: typeof data.title === 'string' ? data.title : 'Untitled Task',
    category: (data.category as Task['category']) || 'Personal',
    priority: (data.priority as Task['priority']) || 'Medium',
    dueDate: typeof data.dueDate === 'string' ? data.dueDate : '',
    completed: Boolean(data.completed),
    ...(typeof data.notes === 'string' ? { notes: data.notes } : {}),
  };
}

export function deserializeGoal(id: string, data: Record<string, unknown>): Goal {
  return {
    id,
    title: typeof data.title === 'string' ? data.title : 'Untitled Goal',
    category: (data.category as Goal['category']) || 'Personal',
    progress: typeof data.progress === 'number' ? data.progress : 0,
    targetDate: typeof data.targetDate === 'string' ? data.targetDate : '',
    milestones: Array.isArray(data.milestones)
      ? data.milestones.map((m: any, idx: number) => ({
          id: typeof m?.id === 'string' ? m.id : `m_${idx + 1}`,
          title: typeof m?.title === 'string' ? m.title : '',
          completed: Boolean(m?.completed),
        }))
      : [],
  };
}

export function deserializeRoutine(id: string, data: Record<string, unknown>): RoutineItem {
  return {
    id,
    time: typeof data.time === 'string' ? data.time : '08:00 AM',
    title: typeof data.title === 'string' ? data.title : 'Routine',
    category: (data.category as RoutineItem['category']) || 'Morning',
    completed: Boolean(data.completed),
    streak: typeof data.streak === 'number' ? data.streak : 0,
  };
}

export function deserializeCalendarEvent(id: string, data: Record<string, unknown>): CalendarEventPayloadItem {
  return {
    id,
    title: typeof data.title === 'string' ? data.title : 'Event',
    time: typeof data.time === 'string' ? data.time : '09:00 AM',
    category: typeof data.category === 'string' ? data.category : 'Personal',
    attendees: typeof data.attendees === 'string' ? data.attendees : 'Personal',
    day: typeof data.day === 'number' ? data.day : 1,
  };
}

export function deserializeTransaction(id: string, data: Record<string, unknown>): Transaction {
  return {
    id,
    title: typeof data.title === 'string' ? data.title : 'Transaction',
    amount: typeof data.amount === 'number' ? data.amount : 0,
    type: data.type === 'income' ? 'income' : 'expense',
    category: (data.category as Transaction['category']) || 'Food',
    date: typeof data.date === 'string' ? data.date : '',
  };
}

export function deserializeNote(id: string, data: Record<string, unknown>): NoteItem {
  return {
    id,
    title: typeof data.title === 'string' ? data.title : 'Untitled Note',
    folder: (data.folder as NoteItem['folder']) || 'Personal',
    content: typeof data.content === 'string' ? data.content : '',
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : '',
  };
}

export function deserializeDocument(id: string, data: Record<string, unknown>): DocumentItem {
  return {
    id,
    name: typeof data.name === 'string' ? data.name : 'Document',
    category: (data.category as DocumentItem['category']) || 'Identity',
    uploadDate: typeof data.uploadDate === 'string' ? data.uploadDate : '',
    size: typeof data.size === 'string' ? data.size : '0 KB',
    ...(typeof data.expiryDate === 'string' ? { expiryDate: data.expiryDate } : {}),
  };
}

export function deserializeHealth(data: Record<string, unknown>): HealthStat {
  return {
    waterDrank: typeof data.waterDrank === 'number' ? data.waterDrank : 0,
    sleepHours: typeof data.sleepHours === 'number' ? data.sleepHours : 0,
    weight: typeof data.weight === 'number' ? data.weight : 0,
    steps: typeof data.steps === 'number' ? data.steps : 0,
    heartRate: typeof data.heartRate === 'number' ? data.heartRate : 0,
  };
}

export function deserializeFamilyMember(id: string, data: Record<string, unknown>): FamilyMember {
  return {
    id,
    name: typeof data.name === 'string' ? data.name : 'Family Member',
    relation: typeof data.relation === 'string' ? data.relation : 'Member',
    status: typeof data.status === 'string' ? data.status : '',
    avatarColor: typeof data.avatarColor === 'string' ? data.avatarColor : 'bg-emerald-700',
  };
}

export function deserializeLearningItem(id: string, data: Record<string, unknown>): LearningItem {
  return {
    id,
    title: typeof data.title === 'string' ? data.title : 'Course',
    provider: typeof data.provider === 'string' ? data.provider : '',
    progress: typeof data.progress === 'number' ? data.progress : 0,
    category: typeof data.category === 'string' ? data.category : 'General',
    status: (data.status as LearningItem['status']) || 'In Progress',
  };
}

export function deserializeEmergencyContact(id: string, data: Record<string, unknown>): EmergencyContact {
  return {
    id,
    name: typeof data.name === 'string' ? data.name : 'Emergency Contact',
    phone: typeof data.phone === 'string' ? data.phone : '',
    ...(typeof data.relation === 'string' ? { relation: data.relation } : {}),
  };
}

export function deserializeSettings(data: Record<string, unknown>): UserSettings {
  const validLanguages: Language[] = ['en', 'bn', 'ar'];
  const validThemes: ThemePreference[] = ['system', 'light', 'dark'];
  return {
    language: validLanguages.includes(data.language as Language) ? (data.language as Language) : 'en',
    theme: validThemes.includes(data.theme as ThemePreference) ? (data.theme as ThemePreference) : 'system',
  };
}

// ============================================================================
// STRUCTURED FIRESTORE ERROR FORMATTING (SAFE FOR LOGGING & UI DISPLAY)
// ============================================================================

export function extractFirestoreErrorCode(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err && typeof (err as any).code === 'string') {
    return (err as any).code;
  }
  return 'unknown';
}

export function toFriendlyFirestoreErrorMessage(
  err: unknown,
  collectionName: string,
  operationType: FirestoreOperationType
): string {
  const code = extractFirestoreErrorCode(err);
  switch (code) {
    case 'permission-denied':
      return `Permission denied while trying to ${operationType} ${collectionName}. Please verify you are signed in to the matching account.`;
    case 'unauthenticated':
      return `Authentication required to ${operationType} ${collectionName}. Please sign in again.`;
    case 'unavailable':
      return `Cloud sync is temporarily unavailable for ${collectionName}. Changes can be retried once reconnected.`;
    case 'failed-precondition':
      return `Sync precondition failed for ${collectionName}. Please refresh or retry.`;
    case 'invalid-argument':
      return `Invalid field values detected for ${collectionName}.`;
    default:
      return `Could not ${operationType} ${collectionName} in cloud sync. You can retry when ready.`;
  }
}

export function buildFirestoreErrorInfo(
  err: unknown,
  operationType: FirestoreOperationType,
  path: string,
  uid: string | null
): FirestoreErrorInfo {
  const message =
    err instanceof Error
      ? err.message
      : err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string'
        ? (err as any).message
        : String(err);

  return {
    error: message,
    code: extractFirestoreErrorCode(err),
    operationType,
    path,
    uid,
  };
}
