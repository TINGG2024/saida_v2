import type { User, Project, Message } from '../types';
import { PRECOMPUTED_HASHES } from '../utils/crypto';

// 预设初始用户（密码使用预计算的 SHA-256 哈希值）
export const INITIAL_USERS: User[] = [
  {
    id: 'user1',
    username: 'zhangsan',
    nickname: '张三',
    password: PRECOMPUTED_HASHES['123456'], // 原密码 123456
    role: 'both',
    skills: ['Python', '数据分析', '机器学习', 'UI设计'],
    awards: [
      { competition: '互联网+', level: '国家级' },
      { competition: '挑战杯', level: '省部级' }
    ],
    experiences: ['2024 互联网+全国金奖', '2023 挑战杯省赛一等奖'],
    seekingTeam: true,
    bio: '计算机科学与技术专业大三学生，热爱技术创新，有丰富的竞赛经历。',
    major: '计算机科学'
  },
  {
    id: 'user2',
    username: 'lisi',
    nickname: '李四',
    password: PRECOMPUTED_HASHES['123456'],
    role: '队长',
    skills: ['Java', '后端开发', '数据库', '系统架构'],
    awards: [
      { competition: 'ACM', level: '省部级' }
    ],
    experiences: ['ACM-ICPC 区域赛铜奖', '校级程序设计大赛一等奖'],
    seekingTeam: false,
    bio: '软件工程专业，擅长后端开发和系统设计。',
    major: '软件工程'
  },
  {
    id: 'user3',
    username: 'wangwu',
    nickname: '王五',
    password: PRECOMPUTED_HASHES['123456'],
    role: '队员',
    skills: ['React', '前端开发', 'TypeScript', 'UI设计'],
    awards: [],
    experiences: ['前端开发实习经历', '校级网页设计大赛三等奖'],
    seekingTeam: true,
    bio: '数字媒体技术专业大二学生，热爱前端开发。',
    major: '视觉设计',
    seekerReq: {
      id: 'req1',
      userId: 'user3',
      targetCompetition: '互联网+',
      expectSkills: ['Python', '数据分析'],
      description: '希望参加互联网+比赛，擅长前端设计，想找一个有数据分析能力的团队',
      active: true
    }
  },
  {
    id: 'user4',
    username: 'zhaoliu',
    nickname: '赵六',
    password: PRECOMPUTED_HASHES['123456'],
    role: 'both',
    skills: ['Python', '深度学习', '计算机视觉', '数据可视化'],
    awards: [
      { competition: '数学建模', level: '国家级' }
    ],
    experiences: ['全国大学生数学建模竞赛一等奖', '图像识别项目开发经验'],
    seekingTeam: true,
    bio: '人工智能专业，专注于计算机视觉方向。',
    major: '数据科学'
  },
  {
    id: 'user5',
    username: 'sunqi',
    nickname: '孙七',
    password: PRECOMPUTED_HASHES['123456'],
    role: '队长',
    skills: ['产品设计', 'PPT制作', '演讲', '项目管理'],
    awards: [
      { competition: '互联网+', level: '校级' },
      { competition: '挑战杯', level: '校级' }
    ],
    experiences: ['多次组织创新创业项目', '商业计划书撰写经验丰富'],
    seekingTeam: false,
    bio: '工商管理专业大四学生，具有优秀的组织协调能力。',
    major: '金融学'
  },
  {
    id: 'user6',
    username: 'zhouba',
    nickname: '周八',
    password: PRECOMPUTED_HASHES['123456'],
    role: '队员',
    skills: ['C++', '算法', '数据结构', '嵌入式开发'],
    awards: [
      { competition: '蓝桥杯', level: '省部级' }
    ],
    experiences: ['蓝桥杯省赛一等奖', '嵌入式系统课程设计'],
    seekingTeam: true,
    bio: '电子信息工程专业，热爱硬件和算法。',
    major: '机械工程'
  },
  {
    id: 'admin',
    username: 'admin',
    nickname: '系统管理员',
    password: PRECOMPUTED_HASHES['admin123'], // 原密码 admin123
    role: '管理员',
    skills: [],
    awards: [],
    experiences: [],
    seekingTeam: false,
    bio: '赛搭平台系统管理员',
    major: ''
  }
];

// 模拟用户数据
export const mockUsers: User[] = [...INITIAL_USERS];

// 模拟项目数据
export const mockProjects: Project[] = [];

// 初始消息数据
export const mockMessages: Message[] = [
  {
    id: 'msg1',
    type: 'invite',
    fromUserId: 'user1',
    toUserId: 'user3',
    projectId: 'project2',
    content: '邀请你加入项目「AI 图像识别垃圾分类」',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: 'pending'
  },
  {
    id: 'msg2',
    type: 'chat',
    fromUserId: 'user1',
    toUserId: 'user2',
    projectId: 'project1',
    content: '你好，我是张三，很高兴加入这个项目！',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: 'read'
  },
  {
    id: 'msg3',
    type: 'chat',
    fromUserId: 'user2',
    toUserId: 'user1',
    projectId: 'project1',
    content: '你好张三！欢迎加入我们的团队！',
    timestamp: new Date(Date.now() - 7000000).toISOString(),
    status: 'read'
  }
];
