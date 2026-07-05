import type { User, Project, MatchResult } from '../types';

// 奖项等级加分基数
const AWARD_LEVEL_SCORE: Record<string, number> = {
  '国家级': 30,
  '省部级': 20,
  '校级': 10,
  '无': 0
};

/**
 * 获取用户的综合技能（包括专业）
 * @param user 用户对象
 * @param includeMajor 是否包含专业，默认 true
 * @returns 综合技能数组（去重）
 */
function getCombinedSkills(user: User, includeMajor: boolean = true): string[] {
  const skills = [...user.skills];
  if (includeMajor && user.major) {
    return [...new Set([...skills, user.major])];
  }
  return skills;
}

/**
 * 计算 Jaccard 相似度
 * @param setA 集合 A
 * @param setB 集合 B
 * @returns 相似度分数 (0-100)
 */
export function calculateJaccardSimilarity(setA: string[] | undefined, setB: string[] | undefined): number {
  const arrA = setA || [];
  const arrB = setB || [];
  const intersection = arrA.filter(skill => arrB.includes(skill));
  const union = [...new Set([...arrA, ...arrB])];
  if (union.length === 0) return 0;
  return (intersection.length / union.length) * 100;
}

/**
 * 获取用户的最高奖项等级
 * @param user 用户对象
 * @returns 最高奖项等级
 */
export function getUserHighestAwardLevel(user: User): '国家级' | '省部级' | '校级' | '无' {
  if (!user.awards || user.awards.length === 0) return '无';
  
  const levels: Record<string, number> = {
    '国家级': 3,
    '省部级': 2,
    '校级': 1
  };
  
  let highestLevel = '校级';
  let highestScore = 1;
  
  for (const award of user.awards) {
    if (!award.level) continue;
    const score = levels[award.level];
    if (score && score > highestScore) {
      highestScore = score;
      highestLevel = award.level;
    }
  }
  
  return highestLevel as '国家级' | '省部级' | '校级';
}

/**
 * 计算经历相似分
 * @param user 用户
 * @param competitionType 比赛类型
 * @returns 经历相似分 (0, 50, 100)
 */
export function calculateExperienceScore(user: User, competitionType: string): number {
  if (!competitionType) return 0;
  
  // 检查奖项中是否有相关比赛
  const hasMatchingAward = user.awards.some(award => 
    award.competition && award.competition.includes(competitionType)
  );
  
  // 检查经历中是否有相关比赛
  const hasMatchingExperience = user.experiences.some(exp => 
    exp && exp.includes(competitionType)
  );
  
  if (hasMatchingAward || hasMatchingExperience) {
    return 100;
  }
  
  // 部分关键词匹配（简化处理）
  const keywords = ['挑战杯', '互联网+', '数学建模', 'ACM', '蓝桥杯', '大创'];
  const hasKeyword = keywords.some(keyword => 
    competitionType.includes(keyword) && 
    (user.awards.some(a => a.competition && a.competition.includes(keyword)) || 
     user.experiences.some(e => e && e.includes(keyword)))
  );
  
  return hasKeyword ? 50 : 0;
}

/**
 * 计算队员对项目的匹配度（队员端）
 * @param member 队员
 * @param project 项目
 * @returns 匹配结果
 */
export function calculateMemberMatchProject(member: User, project: Project): MatchResult {
  let skillScore: number;
  
  // 1. 技能匹配分：检查队员有寻队需求则用需求技能，否则用个人技能
  if (member.seekerReq && member.seekerReq.active) {
    // 寻队需求技能 + 队员专业
    const memberSkills = getCombinedSkills(member, true);
    // 合并需求技能和队员综合技能
    const combinedSkills = [...new Set([...member.seekerReq.expectSkills, ...memberSkills])];
    skillScore = calculateJaccardSimilarity(combinedSkills, project.requiredSkills);
  } else {
    // 使用队员综合技能（包含专业）
    skillScore = calculateJaccardSimilarity(getCombinedSkills(member, true), project.requiredSkills);
  }
  
  // 2. 经历相似分
  const experienceScore = calculateExperienceScore(member, project.competitionType);
  
  // 3. 奖项加成（使用队长的奖项等级）
  const awardBonus = AWARD_LEVEL_SCORE[project.captainAwardLevel];
  
  // 计算总分
  const totalScore = skillScore * 0.5 + experienceScore * 0.2 + awardBonus * 0.3;
  
  return {
    id: member.id,
    score: parseFloat(totalScore.toFixed(2)),
    skillScore: parseFloat(skillScore.toFixed(2)),
    experienceScore: experienceScore,
    awardBonus
  };
}

/**
 * 计算项目对队员的匹配度（队长端）
 * @param project 项目
 * @param member 队员
 * @returns 匹配结果
 */
export function calculateProjectMatchMember(project: Project, member: User): MatchResult {
  // 1. 技能匹配分（包含队员专业）
  const skillScore = calculateJaccardSimilarity(project.requiredSkills, getCombinedSkills(member, true));
  
  // 2. 经历相似分
  const experienceScore = calculateExperienceScore(member, project.competitionType);
  
  // 3. 奖项加成（使用队员的最高奖项等级）
  const memberHighestLevel = getUserHighestAwardLevel(member);
  const awardBonus = AWARD_LEVEL_SCORE[memberHighestLevel];
  
  // 计算总分
  const totalScore = skillScore * 0.5 + experienceScore * 0.2 + awardBonus * 0.3;
  
  return {
    id: member.id,
    score: parseFloat(totalScore.toFixed(2)),
    skillScore: parseFloat(skillScore.toFixed(2)),
    experienceScore: experienceScore,
    awardBonus
  };
}

/**
 * 为项目推荐队员（队长端）
 * @param project 项目
 * @param allUsers 所有用户
 * @returns 按匹配度排序的队员列表
 */
export function recommendMembersForProject(project: Project, allUsers: User[]): (User & MatchResult)[] {
  const members = allUsers.filter(user => 
    user.id !== project.captainId && // 排除队长自己
    (user.role === '队员' || user.role === 'both') // 可以是队员或双重角色
  );
  
  const results = members.map(member => {
    const matchResult = calculateProjectMatchMember(project, member);
    return { ...member, ...matchResult };
  });
  
  // 排序：先按总分降序，再按奖项加成降序
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.awardBonus - a.awardBonus;
  });
  
  return results;
}

/**
 * 为队员推荐项目（队员端）
 * @param member 队员
 * @param allProjects 所有项目
 * @returns 按匹配度排序的项目列表
 */
export function recommendProjectsForMember(member: User, allProjects: Project[]): (Project & MatchResult)[] {
  const activeProjects = allProjects.filter(project => 
    project.status === '招募中' // 只推荐招募中的项目
  );
  
  const results = activeProjects.map(project => {
    const matchResult = calculateMemberMatchProject(member, project);
    return { ...project, ...matchResult, id: project.id };
  });
  
  // 排序：先按总分降序，再按奖项加成降序
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.awardBonus - a.awardBonus;
  });
  
  return results;
}
