// 奖项接口
export interface Award {
  competition: string;
  level: string;
}

// 队员组队需求接口
export interface SeekerRequirement {
  id: string;
  userId: string;
  targetCompetition: string;
  expectSkills: string[];
  description: string;
  active: boolean;
}

// 任务接口（项目协作）
export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  deadline?: string;
  status: 'todo' | 'inProgress' | 'done';
  createdAt: string;
}

// 用户接口
export interface User {
  id: string;
  username: string;
  password: string;
  nickname: string;
  email?: string;
  phone?: string;
  avatar?: string;
  major?: string;
  skills?: string[];
  experiences?: string[];
  awards?: Award[];
  role?: '队长' | '队员' | 'both' | '管理员';
  seekingTeam?: boolean;
  bio?: string;
  seekerReq?: SeekerRequirement;
  createdAt?: string;
  updatedAt?: string;
}

// 项目接口
export interface Project {
  id: string;
  title: string;
  description: string;
  competitionType: string;
  requiredSkills: string[];
  captainId: string;
  captainName?: string;
  status: '招募中' | '已组队' | '已结束';
  captainAwardLevel: '国家级' | '省部级' | '校级' | '无';
  teamMembers?: string[];
  requiredMembers?: number;
  coverImage?: string;
  endDate?: string;
  tasks?: Task[];
}

// 消息类型和状态
export type MessageType = 'invite' | 'apply' | 'accept' | 'reject' | 'chat';
export type MessageStatus = 'pending' | 'accepted' | 'rejected' | 'read';
export type ChatMessageSubType = 'text' | 'image';

// 消息接口
export interface Message {
  id: string;
  type: MessageType;
  fromUserId: string;
  toUserId: string;
  projectId: string;
  content: string;
  timestamp: string;
  status: MessageStatus;
  replyToId?: string;
  subType?: ChatMessageSubType;
  imageUrl?: string;
  notified?: boolean;
}

// 匹配结果接口
export interface MatchResult {
  id: string;
  score: number;
  skillScore: number;
  experienceScore: number;
  awardBonus: number;
}
