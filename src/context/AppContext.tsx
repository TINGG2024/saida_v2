import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import type { User, Project, Message, MessageStatus, Task } from '../types';
import { mockProjects, mockMessages } from '../data/mockData';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { supabase } from '../utils/supabaseClient';

// localStorage keys
const TOKEN_KEY = 'saida_token';
const USERID_KEY = 'saida_userId';
const DATA_USERS_KEY = 'saida_users';
const DATA_PROJECTS_KEY = 'saida_projects';
const DATA_MESSAGES_KEY = 'saida_messages';

// Token 工具函数
function generateToken(userId: string): string {
  const payload = {
    userId,
    exp: Date.now() + 7 * 24 * 3600 * 1000
  };
  return btoa(JSON.stringify(payload));
}

function parseToken(token: string): { userId: string; exp: number } | null {
  try {
    const decoded = atob(token);
    const payload = JSON.parse(decoded);
    if (payload && payload.userId && payload.exp) {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}

function isTokenValid(token: string): boolean {
  const payload = parseToken(token);
  if (!payload) return false;
  return payload.exp > Date.now();
}

// 数据持久化工具
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // ignore parse errors
  }
  return fallback;
}

function saveToStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // quota exceeded or other errors
  }
}

function persistState(users: User[], projects: Project[], messages: Message[]) {
  saveToStorage(DATA_USERS_KEY, users);
  saveToStorage(DATA_PROJECTS_KEY, projects);
  saveToStorage(DATA_MESSAGES_KEY, messages);
}

// 状态类型
interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  messages: Message[];
  isAuthenticated: boolean;
  selectedRole: '队长' | '队员' | null;
}

// Action 类型
type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER'; payload: User }
  | { type: 'SELECT_ROLE'; payload: '队长' | '队员' }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'END_PROJECT'; payload: { projectId: string } }
  | { type: 'ADD_TASK'; payload: { projectId: string; task: Task } }
  | { type: 'UPDATE_TASK'; payload: { projectId: string; task: Task } }
  | { type: 'DELETE_TASK'; payload: { projectId: string; taskId: string } }
  | { type: 'SEND_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE_ID'; payload: { oldId: string; newId: string } }
  | { type: 'UPDATE_MESSAGE_STATUS'; payload: { id: string; status: MessageStatus } }
  | { type: 'MARK_MESSAGE_NOTIFIED'; payload: string }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'COMPLETE_TEAM'; payload: { projectId: string; memberId: string } };

// Reducer 函数
function appReducer(state: AppState, action: Action): AppState {
  let newState: AppState;

  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.payload, isAuthenticated: true, selectedRole: null };
    case 'LOGOUT':
      return { ...state, currentUser: null, isAuthenticated: false, selectedRole: null };
    case 'SELECT_ROLE':
      return { ...state, selectedRole: action.payload };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'REGISTER':
      return {
        ...state,
        users: [...state.users, action.payload],
        currentUser: action.payload,
        isAuthenticated: true
      };
    case 'ADD_PROJECT':
      newState = { ...state, projects: [...state.projects, action.payload] };
      break;
    case 'UPDATE_PROJECT':
      newState = {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id ? action.payload : p
        )
      };
      break;
    case 'DELETE_PROJECT':
      newState = {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload)
      };
      break;
    case 'END_PROJECT':
      newState = {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, status: '已结束' as const, endDate: new Date().toISOString() }
            : p
        )
      };
      break;
    case 'ADD_TASK':
      newState = {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, tasks: [...(p.tasks || []), action.payload.task] }
            : p
        )
      };
      break;
    case 'UPDATE_TASK':
      newState = {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                tasks: (p.tasks || []).map(t =>
                  t.id === action.payload.task.id ? action.payload.task : t
                )
              }
            : p
        )
      };
      break;
    case 'DELETE_TASK':
      newState = {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, tasks: (p.tasks || []).filter(t => t.id !== action.payload.taskId) }
            : p
        )
      };
      break;
    case 'SEND_MESSAGE':
      newState = {
        ...state,
        messages: [...state.messages, action.payload].sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      };
      break;
    case 'UPDATE_MESSAGE_ID':
      newState = {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.payload.oldId ? { ...m, id: action.payload.newId } : m
        )
      };
      break;
    case 'UPDATE_MESSAGE_STATUS':
      newState = {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.payload.id ? { ...m, status: action.payload.status } : m
        )
      };
      break;
    case 'MARK_MESSAGE_NOTIFIED':
      newState = {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.payload ? { ...m, notified: true } : m
        )
      };
      break;
    case 'UPDATE_USER':
      newState = {
        ...state,
        users: state.users.map(u =>
          u.id === action.payload.id ? action.payload : u
        ),
        currentUser:
          state.currentUser?.id === action.payload.id
            ? action.payload
            : state.currentUser
      };
      break;
    case 'DELETE_USER':
      newState = {
        ...state,
        users: state.users.filter(u => u.id !== action.payload)
      };
      break;
    case 'COMPLETE_TEAM': {
      const updatedProjects = state.projects.map(p => {
        if (p.id === action.payload.projectId) {
          const newTeamMembers = [...(p.teamMembers || []), action.payload.memberId];
          const requiredMembers = p.requiredMembers || 1;
          const isTeamFull = newTeamMembers.length >= requiredMembers;
          return {
            ...p,
            status: isTeamFull ? '已组队' as const : '招募中' as const,
            teamMembers: newTeamMembers
          } as Project;
        }
        return p;
      });

      const newUpdatedUsers = state.users.map(u => {
        if (u.id === action.payload.memberId) {
          return {
            ...u,
            seekingTeam: false,
            seekerReq: u.seekerReq ? { ...u.seekerReq, active: false } : undefined
          };
        }
        return u;
      });

      newState = {
        ...state,
        projects: updatedProjects,
        users: newUpdatedUsers,
        currentUser:
          state.currentUser?.id === action.payload.memberId
            ? newUpdatedUsers.find(u => u.id === action.payload.memberId)!
            : state.currentUser
      };
      break;
    }
    default:
      return state;
  }

  // 自动持久化所有非 LOGIN/LOGOUT 操作
  if (newState) {
    persistState(newState.users, newState.projects, newState.messages);
  }
  return newState || state;
}

// Context 类型
interface AppContextType extends AppState {
  login: (phone: string, password: string) => Promise<User | null>;
  register: (username: string, nickname: string, password: string, role?: '队长' | '队员' | 'both') => Promise<User | null>;
  logout: () => void;
  selectRole: (role: '队长' | '队员') => void;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  endProject: (projectId: string) => Promise<void>;
  addTask: (projectId: string, task: Task) => void;
  updateTask: (projectId: string, task: Task) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  sendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'status'> & Partial<Message>) => Promise<void>;
  updateMessageStatus: (id: string, status: MessageStatus) => Promise<void>;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  completeTeam: (projectId: string, memberId: string) => Promise<void>;
  sendChatMessage: (fromUserId: string, toUserId: string, projectId: string, content: string) => Promise<void>;
  markMessageNotified: (messageId: string) => void;
}

// 创建 Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// 初始状态 - 优先从 localStorage 读取
const initialState: AppState = {
  currentUser: null,
  users: loadFromStorage<User[]>(DATA_USERS_KEY, []),
  projects: loadFromStorage<Project[]>(DATA_PROJECTS_KEY, mockProjects),
  messages: loadFromStorage<Message[]>(DATA_MESSAGES_KEY, mockMessages),
  isAuthenticated: false,
  selectedRole: null
};

// Provider 组件
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const prevMessagesRef = useRef(state.messages);

  // 初始化时从 Supabase 恢复登录态
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const email = session.user.email || '';
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (!error && users) {
          const normalizeRole = (role: string | undefined): '队长' | '队员' | 'both' | '管理员' => {
            const roleMap: Record<string, '队长' | '队员' | 'both' | '管理员'> = {
              'captain': '队长',
              'member': '队员',
              'both': 'both',
              'admin': '管理员',
              '队长': '队长',
              '队员': '队员',
              '管理员': '管理员'
            };
            return roleMap[role || ''] || 'both';
          };

          const user: User = {
            id: users.id,
            username: users.username || '',
            password: users.password || '',
            nickname: users.nickname || '',
            email: users.email,
            phone: users.phone || '',
            avatar: users.avatar,
            major: users.major,
            skills: users.skills || [],
            experiences: users.experiences || [],
            awards: users.awards || [],
            role: normalizeRole(users.role),
            seekingTeam: users.seeking_team || false,
            bio: users.bio,
            createdAt: users.created_at,
            updatedAt: users.updated_at
          };
          dispatch({ type: 'LOGIN', payload: user });
        }
      }
    };
    checkSession();
  }, []);

  // 初始化时从 Supabase 获取项目、用户和消息数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResult, usersResult, messagesResult] = await Promise.all([
          supabase.from('projects').select('*, captain:users(id, nickname, major)'),
          supabase.from('users').select('*'),
          supabase.from('messages').select('*').order('created_at', { ascending: true })
        ]);

        if (projectsResult.error) {
          console.error('Error fetching projects:', projectsResult.error);
        } else {
          const projectsWithCaptainInfo = projectsResult.data?.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            competitionType: p.competition_type,
            captainId: p.captain_id,
            requiredSkills: p.required_skills || [],
            requiredMembers: p.required_members || 1,
            status: p.status || '招募中',
            teamMembers: p.team_members || [],
            tasks: p.tasks || [],
            captainAwardLevel: p.captain_award_level || '无',
            coverImage: p.cover_image,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            captainName: p.captain?.nickname || '未知队长',
            captainMajor: p.captain?.major || ''
          })) || [];
          dispatch({ type: 'SET_PROJECTS', payload: projectsWithCaptainInfo });
        }

        if (usersResult.error) {
          console.error('Error fetching users:', usersResult.error);
        } else {
          const normalizeRole = (role: string | undefined): '队长' | '队员' | 'both' | '管理员' => {
            const roleMap: Record<string, '队长' | '队员' | 'both' | '管理员'> = {
              'captain': '队长',
              'member': '队员',
              'both': 'both',
              'admin': '管理员',
              '队长': '队长',
              '队员': '队员',
              '管理员': '管理员'
            };
            return roleMap[role || ''] || 'both';
          };

          const usersData = usersResult.data?.map(u => ({
            id: u.id,
            username: u.username || '',
            password: u.password || '',
            nickname: u.nickname || '',
            email: u.email,
            phone: u.phone || '',
            avatar: u.avatar,
            major: u.major,
            skills: u.skills || [],
            experiences: u.experiences || [],
            awards: u.awards || [],
            role: normalizeRole(u.role),
            seekingTeam: u.seeking_team || false,
            bio: u.bio,
            createdAt: u.created_at,
            updatedAt: u.updated_at,
            seekerReq: u.seeker_req ? JSON.parse(u.seeker_req) : undefined
          })) || [];
          dispatch({ type: 'SET_USERS', payload: usersData });
        }

        if (messagesResult.error) {
          console.error('Error fetching messages:', messagesResult.error);
        } else {
          const messagesData = messagesResult.data?.map(m => {
            const msgType = m.type as 'apply' | 'invite' | 'chat';
            let status: 'pending' | 'accepted' | 'rejected' | 'read';
            
            if (m.status && ['pending', 'accepted', 'rejected', 'read'].includes(m.status)) {
              status = m.status as 'pending' | 'accepted' | 'rejected' | 'read';
            } else if (msgType === 'chat') {
              status = m.is_read ? 'read' : 'pending';
            } else {
              status = 'pending';
            }
            
            return {
              id: m.id,
              type: msgType,
              fromUserId: m.from_user_id,
              toUserId: m.to_user_id,
              projectId: m.project_id,
              content: m.content,
              timestamp: m.timestamp || m.created_at,
              status,
              notified: m.notified || false
            };
          }) || [];
          dispatch({ type: 'SET_MESSAGES', payload: messagesData });
        }
      } catch (err) {
        console.error('Unexpected error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  // 监听新消息触发浏览器通知
  useEffect(() => {
    const prevLength = prevMessagesRef.current.length;
    const currentLength = state.messages.length;
    const currentUser = state.currentUser;

    if (currentLength > prevLength && currentUser) {
      // 找到新增的消息
      const newMessages = state.messages.slice(prevLength);
      newMessages.forEach(msg => {
        if (
          msg.toUserId === currentUser.id &&
          msg.status === 'pending' &&
          !msg.notified
        ) {
          triggerBrowserNotification(msg.content);
          dispatch({ type: 'MARK_MESSAGE_NOTIFIED', payload: msg.id });
        }
      });
    }
    prevMessagesRef.current = state.messages;
  }, [state.messages, state.currentUser]);

  const login = async (phone: string, password: string): Promise<User | null> => {
    try {
      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (queryError || !users) {
        return null;
      }

      const storedPassword = users.password || '';
      const isHashMatch = await verifyPassword(password, storedPassword);
      const isPlainMatch = password === storedPassword;
      if (!isHashMatch && !isPlainMatch) {
        return null;
      }

      const normalizeRole = (role: string | undefined): '队长' | '队员' | 'both' | '管理员' => {
        const roleMap: Record<string, '队长' | '队员' | 'both' | '管理员'> = {
          'captain': '队长',
          'member': '队员',
          'both': 'both',
          'admin': '管理员',
          '队长': '队长',
          '队员': '队员',
          '管理员': '管理员'
        };
        return roleMap[role || ''] || 'both';
      };

      const user: User = {
        id: users.id,
        username: users.username || '',
        password: users.password || '',
        nickname: users.nickname || '',
        email: users.email,
        phone: users.phone || '',
        avatar: users.avatar,
        major: users.major,
        skills: users.skills || [],
        experiences: users.experiences || [],
        awards: users.awards || [],
        role: normalizeRole(users.role),
        seekingTeam: users.seeking_team || false,
        bio: users.bio,
        createdAt: users.created_at,
        updatedAt: users.updated_at
      };

      dispatch({ type: 'LOGIN', payload: user });
      return user;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  };

  const register = async (username: string, nickname: string, password: string, role: '队长' | '队员' | 'both' = 'both'): Promise<User | null> => {
    const existingUser = state.users.find(u => u.username === username);
    if (existingUser) return null;

    const hashedPassword = await hashPassword(password);
    const newUser: User = {
      id: 'user_' + Date.now(),
      username,
      nickname,
      password: hashedPassword,
      role,
      skills: [],
      major: '',
      awards: [],
      experiences: [],
      seekingTeam: false,
      bio: ''
    };

    dispatch({ type: 'REGISTER', payload: newUser });

    try {
      const { error } = await supabase.from('users').insert({
        id: newUser.id,
        username: newUser.username,
        nickname: newUser.nickname,
        password: newUser.password,
        role: newUser.role,
        skills: newUser.skills,
        major: newUser.major,
        awards: newUser.awards,
        experiences: newUser.experiences,
        seeking_team: newUser.seekingTeam,
        bio: newUser.bio,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.error('Error registering user in Supabase:', error.message);
        throw new Error(`注册失败: ${error.message}`);
      }

      console.log('User registered in Supabase successfully');
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }

    const token = generateToken(newUser.id);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USERID_KEY, newUser.id);

    return newUser;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERID_KEY);
    dispatch({ type: 'LOGOUT' });
  };

  const selectRole = (role: '队长' | '队员') => {
    dispatch({ type: 'SELECT_ROLE', payload: role });
  };

  const addProject = async (project: Project) => {
    dispatch({ type: 'ADD_PROJECT', payload: project });

    try {
      const { error } = await supabase.from('projects').insert({
        id: project.id,
        title: project.title,
        description: project.description,
        competition_type: project.competitionType,
        captain_id: project.captainId,
        required_skills: project.requiredSkills,
        required_members: project.requiredMembers,
        status: project.status,
        team_members: project.teamMembers || [],
        tasks: project.tasks || [],
        captain_award_level: project.captainAwardLevel,
        cover_image: project.coverImage,
        created_at: project.createdAt || new Date().toISOString(),
        updated_at: project.updatedAt || new Date().toISOString()
      });
      
      if (error) {
        console.error('Error adding project to Supabase:', error.message);
        throw new Error(`创建项目失败: ${error.message}`);
      }
      
      console.log('Project added to Supabase successfully');
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };
  const updateProject = async (project: Project) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: project });

    try {
      const { error } = await supabase.from('projects').update({
        title: project.title,
        description: project.description,
        competition_type: project.competitionType,
        required_skills: project.requiredSkills,
        required_members: project.requiredMembers,
        status: project.status,
        team_members: project.teamMembers || [],
        tasks: project.tasks || [],
        captain_award_level: project.captainAwardLevel,
        cover_image: project.coverImage,
        updated_at: new Date().toISOString()
      }).eq('id', project.id);
      
      if (error) {
        console.error('Error updating project in Supabase:', error.message);
        throw new Error(`更新项目失败: ${error.message}`);
      }
      
      console.log('Project updated in Supabase successfully');
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const deleteProject = async (projectId: string) => {
    dispatch({ type: 'DELETE_PROJECT', payload: projectId });

    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      
      if (error) {
        console.error('Error deleting project from Supabase:', error.message);
        throw new Error(`删除项目失败: ${error.message}`);
      }
      
      console.log('Project deleted from Supabase successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const endProject = async (projectId: string) => {
    dispatch({ type: 'END_PROJECT', payload: { projectId } });

    try {
      const { error } = await supabase.from('projects').update({
        status: '已结束',
        updated_at: new Date().toISOString()
      }).eq('id', projectId);
      
      if (error) {
        console.error('Error ending project in Supabase:', error.message);
        throw new Error(`结束项目失败: ${error.message}`);
      }
      
      console.log('Project ended in Supabase successfully');
    } catch (error) {
      console.error('Error ending project:', error);
    }
  };

  const addTask = (projectId: string, task: Task) => {
    dispatch({ type: 'ADD_TASK', payload: { projectId, task } });
  };

  const updateTask = (projectId: string, task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: { projectId, task } });
  };

  const deleteTask = (projectId: string, taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: { projectId, taskId } });
  };

  const sendMessage = async (message: Omit<Message, 'id' | 'timestamp' | 'status'> & Partial<Message>) => {
    const newMessage: Message = {
      ...message,
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      status: message.status || 'pending',
      notified: false
    };
    dispatch({ type: 'SEND_MESSAGE', payload: newMessage });

    const { data, error } = await supabase.from('messages').insert({
      from_user_id: newMessage.fromUserId,
      to_user_id: newMessage.toUserId,
      project_id: newMessage.projectId,
      content: newMessage.content,
      type: newMessage.type,
      is_read: false,
      status: newMessage.status,
      notified: newMessage.notified,
      created_at: newMessage.timestamp
    }).select();

    if (error) {
      console.error('Error sending message to Supabase:', error.message);
      throw new Error(`发送消息失败: ${error.message}`);
    }

    if (data && data.length > 0) {
      const dbMessage = data[0];
      dispatch({ type: 'UPDATE_MESSAGE_ID', payload: { oldId: newMessage.id, newId: dbMessage.id } });
    }
  };

  const updateMessageStatus = async (id: string, status: MessageStatus) => {
    dispatch({ type: 'UPDATE_MESSAGE_STATUS', payload: { id, status } });
    
    try {
      const { error } = await supabase.from('messages').update({
        status: status
      }).eq('id', id);
      
      if (error) {
        console.error('Error updating message status in Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error updating message status:', err);
    }
  };

  const updateUser = async (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
    
    try {
      const { error } = await supabase.from('users').update({
        nickname: user.nickname,
        role: user.role,
        skills: user.skills,
        experiences: user.experiences,
        awards: user.awards,
        major: user.major,
        bio: user.bio,
        seeking_team: user.seekingTeam
      }).eq('id', user.id);
      
      if (error) {
        console.error('Error updating user in Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };
  const deleteUser = (userId: string) => dispatch({ type: 'DELETE_USER', payload: userId });
  const completeTeam = async (projectId: string, memberId: string) => {
    dispatch({ type: 'COMPLETE_TEAM', payload: { projectId, memberId } });

    try {
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        const newTeamMembers = [...(project.teamMembers || []), memberId];
        const requiredMembers = project.requiredMembers || 1;
        const isTeamFull = newTeamMembers.length >= requiredMembers;
        
        const { error } = await supabase.from('projects').update({
          team_members: newTeamMembers,
          status: isTeamFull ? '已组队' : '招募中',
          updated_at: new Date().toISOString()
        }).eq('id', projectId);
        
        if (error) {
          console.error('Error completing team in Supabase:', error.message);
          throw new Error(`组队失败: ${error.message}`);
        }
        
        console.log('Team completed in Supabase successfully');
      }
    } catch (error) {
      console.error('Error completing team:', error);
    }
  };

  const sendChatMessage = async (fromUserId: string, toUserId: string, projectId: string, content: string) => {
    const chatMessage: Message = {
      id: `msg${Date.now()}`,
      type: 'chat',
      fromUserId,
      toUserId,
      projectId,
      content,
      timestamp: new Date().toISOString(),
      status: 'read'
    };
    dispatch({ type: 'SEND_MESSAGE', payload: chatMessage });

    try {
      const { data, error } = await supabase.from('messages').insert({
        type: chatMessage.type,
        from_user_id: chatMessage.fromUserId,
        to_user_id: chatMessage.toUserId,
        project_id: chatMessage.projectId,
        content: chatMessage.content,
        is_read: false,
        status: chatMessage.status,
        notified: false,
        created_at: chatMessage.timestamp
      }).select();
      
      if (error) {
        console.error('Error sending chat message to Supabase:', error.message);
        throw new Error(`发送消息失败: ${error.message}`);
      }

      if (data && data.length > 0) {
        const dbMessage = data[0];
        dispatch({ type: 'UPDATE_MESSAGE_ID', payload: { oldId: chatMessage.id, newId: dbMessage.id } });
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  };

  const markMessageNotified = (messageId: string) => {
    dispatch({ type: 'MARK_MESSAGE_NOTIFIED', payload: messageId });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        selectRole,
        addProject,
        updateProject,
        deleteProject,
        endProject,
        addTask,
        updateTask,
        deleteTask,
        sendMessage,
        updateMessageStatus,
        updateUser,
        deleteUser,
        completeTeam,
        sendChatMessage,
        markMessageNotified
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// 浏览器通知工具
function triggerBrowserNotification(body: string) {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'granted') {
    const notification = new Notification('赛搭 - 新消息', {
      body: body.length > 60 ? body.slice(0, 60) + '...' : body,
      icon: '/favicon.svg'
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        triggerBrowserNotification(body);
      }
    });
  }
}

// 请求通知权限（可在应用启动时调用）
export function requestNotificationPermission() {
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
