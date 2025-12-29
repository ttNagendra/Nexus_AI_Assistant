
export enum ViewType {
  CHAT = 'CHAT',
  VOICE = 'VOICE',
  IMAGE = 'IMAGE',
  TASKS = 'TASKS'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'video';
  imageUrl?: string;
  sources?: { web?: { uri: string, title: string }, maps?: { uri: string, title: string } }[];
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface AIState {
  isThinking: boolean;
  isListening: boolean;
  error: string | null;
}
