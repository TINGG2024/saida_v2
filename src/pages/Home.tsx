import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tag, Typography, Button, Row, Col, Empty, Segmented, Switch, Space, App as AntdApp, Modal, Form, Input, Select, Avatar } from 'antd';
import {
  RocketOutlined,
  TeamOutlined,
  UserOutlined,
  MessageOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  BellOutlined,
  BulbOutlined,
  EditOutlined,
  PlusOutlined,
  EyeOutlined,
  CameraOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useApp } from '../context/AppContext';
import ProjectCard from '../components/ProjectCard';
import { recommendProjectsForMember, recommendMembersForProject, getUserHighestAwardLevel } from '../utils/matching';
import SeekerFormModal from '../components/SeekerFormModal';
import type { SeekerRequirement, User, Project } from '../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/* ── Member card for recommendations ───────────────────────── */
function MemberCard({
  member,
  project,
  onInvite,
  onViewProfile,
}: {
  member: User & { score: number };
  project: Project;
  onInvite: () => void;
  onViewProfile: () => void;
}) {
  const getAwardLevelColor = (level: string) => {
    switch (level) {
      case '国家级':
        return 'gold';
      case '省部级':
        return 'purple';
      case '校级':
        return 'default';
      default:
        return 'default';
    }
  };

  const isHighMatch = member.score > 80;

  return (
    <Card
      style={{
        borderRadius: 14,
        border: isHighMatch ? '2px solid #22C55E' : 'none',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        height: '100%',
      }}
      styles={{ body: { padding: '24px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={44}
            style={{
              background: isHighMatch
                ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                : 'linear-gradient(135deg, #3B82F6, #60A5FA)',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            {member.nickname.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9' }}>{member.nickname}</div>
            {member.major && (
              <div style={{ fontSize: 12, color: '#64748B' }}>{member.major}</div>
            )}
          </div>
        </div>
        <Tag
          style={{
            background: isHighMatch ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            color: isHighMatch ? '#22C55E' : '#3B82F6',
            border: 'none',
            borderRadius: 8,
            padding: '2px 10px',
            fontWeight: 600,
          }}
        >
          {member.score}
        </Tag>
      </div>

      {member.skills.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8, fontWeight: 500 }}>技能标签</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {member.skills.slice(0, 5).map((skill) => {
              const isMatch = project.requiredSkills.includes(skill);
              return (
                <Tag
                  key={skill}
                  style={{
                    background: isMatch ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: isMatch ? '#3B82F6' : '#64748B',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                >
                  {skill}
                </Tag>
              );
            })}
          </div>
        </div>
      )}

      {member.awards.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8, fontWeight: 500 }}>获奖经历</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {member.awards.slice(0, 3).map((award, index) => (
              <Tag
                key={index}
                color={getAwardLevelColor(award.level)}
                style={{ borderRadius: 6, fontSize: 12 }}
              >
                {award.level} · {award.competition}
              </Tag>
            ))}
          </div>
        </div>
      )}

      <Paragraph
        ellipsis={{ rows: 2 }}
        style={{ color: '#94A3B8', fontSize: 13, marginBottom: 16, minHeight: 36 }}
      >
        {member.bio}
      </Paragraph>

      <Space style={{ width: '100%' }} direction="vertical" size={8}>
        <Button
          block
          icon={<EyeOutlined />}
          onClick={onViewProfile}
          style={{ borderRadius: 10, fontWeight: 500 }}
        >
          查看详情
        </Button>
        {project.status === '招募中' && (
          <Button
            type="primary"
            block
            icon={<SendOutlined />}
            onClick={onInvite}
            style={{
              borderRadius: 10,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              border: 'none',
              boxShadow: '0 2px 8px rgba(59,130,246,0.25)',
            }}
          >
            发送邀请
          </Button>
        )}
      </Space>
    </Card>
  );
}

/* ── Reusable section heading ─────────────────────────────── */
function sectionHeading(title: string) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
      <span
        style={{
          width: 4,
          height: 22,
          borderRadius: 2,
          background: 'linear-gradient(180deg, #3B82F6, #60A5FA)',
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>{title}</span>
    </div>
  );
}

/* ── Stat card builder ────────────────────────────────────── */
function StatCard({
  color,
  bgColor,
  icon,
  label,
  value,
  sub,
  onClick,
}: {
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub: string;
  onClick?: () => void;
}) {
  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: 'none',
        borderRadius: 14,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        borderLeft: '4px solid ' + color,
        height: '100%',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
      }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 10 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#F1F5F9', lineHeight: 1.2 }}>{value}</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 6 }}>{sub}</div>
        </div>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

/* ── Role selection screen ─────────────────────────────────── */
function RoleSelection({
  currentUser,
  updateUser,
  navigate,
}: {
  currentUser: any;
  updateUser: (u: any) => void;
  navigate: (p: string) => void;
}) {
  return (
    <div style={{ padding: '40px 20px 60px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Hero area */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: 20,
              background: 'rgba(59, 130, 246, 0.15)',
              marginBottom: 20,
              boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
            }}
          >
            <RocketOutlined style={{ fontSize: 32, color: '#3B82F6' }} />
          </div>
          <Title level={2} style={{ color: '#F1F5F9', fontWeight: 800, marginBottom: 8 }}>
            欢迎来到赛搭
          </Title>
          <Text style={{ color: '#94A3B8', fontSize: 16 }}>找到最佳队友，冲刺赛场之巅</Text>
        </div>

        <Row justify="center" gutter={[28, 28]}>
          <Col xs={24} lg={11}>
            <Card
              hoverable
              onClick={() => {
                const updatedUser = { ...currentUser, role: '队长' as const };
                updateUser(updatedUser);
                navigate('/');
              }}
              style={{
                borderRadius: 14,
                border: '1px solid rgba(148, 163, 184, 0.08)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(59, 130, 246, 0.15)',
                    marginBottom: 20,
                  }}
                >
                  <TeamOutlined style={{ fontSize: 36, color: '#3B82F6' }} />
                </div>
                <Title level={3} style={{ color: '#F1F5F9', fontWeight: 700, marginBottom: 12 }}>
                  我是队长
                </Title>
                <Paragraph style={{ color: '#94A3B8', marginBottom: 20 }}>
                  创建项目，发布招募，寻找志同道合的队友，一起冲击比赛奖项
                </Paragraph>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 8,
                    marginBottom: 24,
                  }}
                >
                  <Tag
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#3B82F6',
                      border: 'none',
                      borderRadius: 8,
                      padding: '4px 14px',
                    }}
                  >
                    发布项目
                  </Tag>
                  <Tag
                    style={{
                      background: 'rgba(234, 179, 8, 0.15)',
                      color: '#EAB308',
                      border: 'none',
                      borderRadius: 8,
                      padding: '4px 14px',
                    }}
                  >
                    管理团队
                  </Tag>
                  <Tag
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: '#22C55E',
                      border: 'none',
                      borderRadius: 8,
                      padding: '4px 14px',
                    }}
                  >
                    查看申请
                  </Tag>
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  style={{
                    borderRadius: 10,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                    height: 44,
                    paddingInline: 28,
                  }}
                >
                  进入首页
                </Button>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={11}>
            <Card
              hoverable
              onClick={() => {
                const updatedUser = { ...currentUser, role: '队员' as const };
                updateUser(updatedUser);
                navigate('/');
              }}
              style={{
                borderRadius: 14,
                border: '1px solid rgba(148, 163, 184, 0.08)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(34, 197, 94, 0.15)',
                    marginBottom: 20,
                  }}
                >
                  <UserOutlined style={{ fontSize: 36, color: '#22C55E' }} />
                </div>
                <Title level={3} style={{ color: '#F1F5F9', fontWeight: 700, marginBottom: 12 }}>
                  我是队员
                </Title>
                <Paragraph style={{ color: '#94A3B8', marginBottom: 20 }}>
                  浏览项目，查看匹配度，申请加入心仪的团队，实现自我价值
                </Paragraph>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 8,
                    marginBottom: 24,
                  }}
                >
                  <Tag
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#3B82F6',
                      border: 'none',
                      borderRadius: 8,
                      padding: '4px 14px',
                    }}
                  >
                    浏览项目
                  </Tag>
                  <Tag
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      color: '#94A3B8',
                      border: 'none',
                      borderRadius: 8,
                      padding: '4px 14px',
                    }}
                  >
                    智能匹配
                  </Tag>
                  <Tag
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#3B82F6',
                      border: 'none',
                      borderRadius: 8,
                      padding: '4px 14px',
                    }}
                  >
                    申请加入
                  </Tag>
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  style={{
                    borderRadius: 10,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
                    height: 44,
                    paddingInline: 28,
                  }}
                >
                  进入首页
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

/* ── Main Home component ──────────────────────────────────── */
export default function Home() {
  const { currentUser, projects, users, messages, updateUser, sendMessage, addProject } = useApp();
  const navigate = useNavigate();
  const [isSeekerModalVisible, setIsSeekerModalVisible] = useState(false);
  const [isCreateProjectModalVisible, setIsCreateProjectModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [projectForm] = Form.useForm();
  const { message: antdMessage } = AntdApp.useApp();

  if (!currentUser) return null;

  const handleToggleSeeking = (checked: boolean) => {
    const updatedUser = {
      ...currentUser,
      seekingTeam: checked,
      seekerReq: currentUser.seekerReq
        ? { ...currentUser.seekerReq, active: checked }
        : undefined,
    };
    updateUser(updatedUser);
  };

  const handleApplyProject = (projectId: string, projectTitle: string, captainId: string) => {
    const applyMessage = {
      id: `msg${Date.now()}`,
      type: 'apply' as const,
      fromUserId: currentUser.id,
      toUserId: captainId,
      projectId,
      content: `申请加入项目「${projectTitle}」`,
      timestamp: new Date().toISOString(),
      status: 'pending' as const,
    };
    sendMessage(applyMessage);
    antdMessage.success('申请已发送！');
  };

  const handleSubmitSeekerReq = (req: Omit<SeekerRequirement, 'id' | 'userId'>) => {
    const newSeekerReq: SeekerRequirement = {
      id: currentUser.seekerReq?.id || `req${Date.now()}`,
      userId: currentUser.id,
      ...req,
    };
    updateUser({
      ...currentUser,
      seekerReq: newSeekerReq,
      seekingTeam: true,
    });
    setIsSeekerModalVisible(false);
    antdMessage.success('寻队需求已发布！');
  };

  const memberRecommendedProjects = useMemo(() => {
    if (!currentUser.seekingTeam) return [];
    return recommendProjectsForMember(currentUser, projects);
  }, [currentUser, projects]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProject = (values: any) => {
    const requiredSkills = values.requiredSkills
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s);

    const newProject: Project = {
      id: `project${Date.now()}`,
      title: values.title,
      description: values.description,
      competitionType: values.competitionType,
      requiredSkills,
      captainId: currentUser.id,
      status: '招募中',
      captainAwardLevel: getUserHighestAwardLevel(currentUser),
      requiredMembers: values.requiredMembers || 1,
      coverImage: coverImage || undefined,
    };

    addProject(newProject);
    setIsCreateProjectModalVisible(false);
    setCoverImage(null);
    projectForm.resetFields();
    antdMessage.success('项目创建成功！');
  };

  const handleViewRecommendations = (projectId: string) => {
    setSelectedProjectId(projectId === selectedProjectId ? null : projectId);
  };

  const handleSendInvite = (member: User, project: Project) => {
    const inviteMessage = {
      id: `msg${Date.now()}`,
      type: 'invite' as const,
      fromUserId: currentUser.id,
      toUserId: member.id,
      projectId: project.id,
      content: `邀请你加入项目「${project.title}」`,
      timestamp: new Date().toISOString(),
      status: 'pending' as const,
    };
    sendMessage(inviteMessage);
    antdMessage.success(`已向 ${member.nickname} 发送邀请！`);
  };

  const filterMembers = (members: (User & any)[], searchText: string) => {
    if (!searchText.trim()) {
      return members;
    }
    const keywords = searchText.toLowerCase().split(' ').filter((k) => k);
    return members.filter((member) => {
      const searchableText = [
        member.nickname,
        member.major || '',
        ...member.skills,
        member.bio,
        ...(member.awards || []).map((a: any) => a.competition),
        ...(member.experiences || []),
      ]
        .join(' ')
        .toLowerCase();
      return keywords.every((keyword) => searchableText.includes(keyword));
    });
  };

  /* ── Role not yet chosen ────────────────────────────────── */
  if (!currentUser.role) {
    return <RoleSelection currentUser={currentUser} updateUser={updateUser} navigate={navigate} />;
  }

  const isCaptain = currentUser.role === '队长';
  const myProjects = isCaptain
    ? projects.filter((p) => p.captainId === currentUser.id)
    : projects.filter((p) => (p.teamMembers || []).includes(currentUser.id));

  const pendingMessages = messages.filter(
    (m) => m.status === 'pending' && m.toUserId === currentUser.id,
  );

  const pendingApplications = isCaptain
    ? messages.filter(
        (m) =>
          m.type === 'apply' && m.toUserId === currentUser.id && m.status === 'pending',
      )
    : [];

  const recruitingProjects = myProjects.filter((p) => p.status === '招募中');

  const archivedProjects = projects.filter((p) => p.status === '已结束');

  const displayedProjects = useMemo(() => {
    if (showArchived) {
      return myProjects.filter((p) => p.status === '已结束' || p.status === '已组队');
    }
    return myProjects.filter((p) => p.status !== '已结束' && p.status !== '已组队');
  }, [myProjects, showArchived]);

  return (
    <div style={{ padding: '24px 20px', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* ══════════ Welcome Banner ══════════ */}
        <div
          style={{
            position: 'relative',
            borderRadius: 16,
            padding: '32px 40px',
            background: 'linear-gradient(135deg, #0F2557 0%, #1D4ED8 60%, #3B82F6 100%)',
            marginBottom: 32,
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: 'absolute',
              top: -40,
              right: 60,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -50,
              right: 200,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: -20,
              left: '40%',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 24,
            }}
          >
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
                你好，{currentUser.nickname}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                {isCaptain
                  ? '管理你的项目团队，招募优秀队员，冲刺比赛巅峰'
                  : '浏览优质项目，找到志同道合的团队，开启精彩旅程'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  padding: '10px 20px',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF' }}>
                  {myProjects.length}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>我的项目</div>
              </div>
              <div
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  padding: '10px 20px',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF' }}>
                  {recruitingProjects.length}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>招募中</div>
              </div>
              <div
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  padding: '10px 20px',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF' }}>
                  {pendingMessages.length}
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>待处理</div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ Statistics Row ══════════ */}
        <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              color="#3B82F6"
              bgColor="rgba(59, 130, 246, 0.15)"
              icon={<FileTextOutlined style={{ fontSize: 22, color: '#3B82F6' }} />}
              label="我的项目"
              value={myProjects.length}
              sub={recruitingProjects.length > 0 ? `${recruitingProjects.length}个招募中` : '招募中'}
              onClick={() => navigate('/')}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              color="#F97316"
              bgColor="rgba(249, 115, 22, 0.15)"
              icon={<MessageOutlined style={{ fontSize: 22, color: '#F97316' }} />}
              label="待处理消息"
              value={pendingMessages.length}
              sub="条需要处理"
              onClick={() => navigate('/messages')}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              color="#EAB308"
              bgColor="rgba(234, 179, 8, 0.15)"
              icon={<ClockCircleOutlined style={{ fontSize: 22, color: '#EAB308' }} />}
              label={isCaptain ? '待审核申请' : '已申请项目'}
              value={
                isCaptain
                  ? pendingApplications.length
                  : pendingMessages.filter(
                      (m) => m.type === 'apply' && m.fromUserId === currentUser.id,
                    ).length
              }
              sub={isCaptain ? '份等待审核' : '个等待回复'}
              onClick={() => navigate('/messages')}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              color="#22C55E"
              bgColor="rgba(34, 197, 94, 0.15)"
              icon={<CheckCircleOutlined style={{ fontSize: 22, color: '#22C55E' }} />}
              label="已完成组队"
              value={myProjects.filter((p) => p.status === '已组队' || p.status === '已结束').length}
              sub={myProjects.filter((p) => p.status === '已结束').length > 0 ? `${myProjects.filter((p) => p.status === '已结束').length}个已结束` : '已结束'}
              onClick={() => navigate('/')}
            />
          </Col>
        </Row>



        {/* ══════════ Quick Actions ══════════ */}
        {sectionHeading('快捷操作')}
        <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              onClick={() => {
                if (isCaptain) {
                  setIsCreateProjectModalVisible(true);
                } else {
                  const updatedUser = { ...currentUser, role: '队长' as const };
                  updateUser(updatedUser);
                  setIsCreateProjectModalVisible(true);
                }
              }}
              style={{
                borderRadius: 14,
                border: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                height: '100%',
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <PlusCircleOutlined style={{ fontSize: 22, color: '#3B82F6' }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>
                    创建项目
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B' }}>发布招募，组建你的战队</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              onClick={() => navigate('/')}
              style={{
                borderRadius: 14,
                border: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                height: '100%',
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'rgba(34, 197, 94, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <TeamOutlined style={{ fontSize: 22, color: '#22C55E' }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>
                    浏览团队
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B' }}>查看招募中的优质项目</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              onClick={() => navigate('/messages')}
              style={{
                borderRadius: 14,
                border: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                height: '100%',
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'rgba(249, 115, 22, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <BellOutlined style={{ fontSize: 22, color: '#F97316' }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>
                    查看消息
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B' }}>
                    {pendingMessages.length > 0
                      ? `${pendingMessages.length}条消息待处理`
                      : '查看申请与邀请'}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* ══════════ Member Workbench Section ══════════ */}
        {!isCaptain && (
          <>
            {/* ══════════ Seeking Team Toggle Card ══════════ */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 14,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                padding: '24px 28px',
                marginBottom: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: currentUser.seekingTeam
                      ? 'rgba(59, 130, 246, 0.15)'
                      : 'rgba(148, 163, 184, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <TeamOutlined
                    style={{
                      fontSize: 22,
                      color: currentUser.seekingTeam ? '#3B82F6' : '#94A3B8',
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>
                    {currentUser.seekingTeam ? '寻队已开启' : '开启寻队状态'}
                  </div>
                  <div style={{ fontSize: 13, color: '#94A3B8' }}>
                    {currentUser.seekingTeam
                      ? '队长们可以看到你的资料并向你发送邀请'
                      : '开启后系统将为你推荐匹配的项目'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {currentUser.seekerReq && currentUser.seekerReq.active && (
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => setIsModalVisible(true)}
                    style={{ borderRadius: 10, fontWeight: 500 }}
                  >
                    修改需求
                  </Button>
                )}
                {!currentUser.seekingTeam && (
                  <Button
                    type="primary"
                    onClick={() => setIsModalVisible(true)}
                    style={{
                      borderRadius: 10,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(59,130,246,0.25)',
                    }}
                  >
                    发布寻队需求
                  </Button>
                )}
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  寻队状态
                </span>
                <Switch
                  checked={currentUser.seekingTeam}
                  onChange={handleToggleSeeking}
                  size="default"
                />
              </div>
            </div>

            {/* ══════════ Recommended Projects Section ══════════ */}
            {currentUser.seekingTeam ? (
              <>
                {sectionHeading('为你推荐以下项目')}

                {currentUser.seekerReq && currentUser.seekerReq.active && (
                  <div style={{ marginBottom: 20 }}>
                    <Tag
                      style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#22C55E',
                        border: 'none',
                        borderRadius: 8,
                        padding: '4px 14px',
                        fontWeight: 500,
                      }}
                    >
                      已发布寻队需求
                    </Tag>
                  </div>
                )}

                {memberRecommendedProjects.length > 0 ? (
                  <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
                    {memberRecommendedProjects.map((project) => (
                      <Col xs={24} sm={12} lg={8} key={project.id}>
                        <ProjectCard project={project} matchRate={project.score} />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Card
                    style={{
                      borderRadius: 14,
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      textAlign: 'center',
                      marginBottom: 32,
                    }}
                    styles={{ body: { padding: '56px 24px' } }}
                  >
                    <Empty
                      description={
                        <div>
                          <div style={{ fontSize: 18, marginBottom: 8 }}>没有找到匹配的项目</div>
                          <Text style={{ color: '#94A3B8' }}>请尝试调整搜索条件或技能筛选</Text>
                        </div>
                      }
                    />
                  </Card>
                )}
              </>
            ) : (
              <>
                {sectionHeading('发现机会')}

                <Card
                  style={{
                    borderRadius: 14,
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    textAlign: 'center',
                    marginBottom: 32,
                    background: 'rgba(255, 255, 255, 0.03)',
                  }}
                  styles={{ body: { padding: '64px 24px' } }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: 'rgba(59, 130, 246, 0.15)',
                      marginBottom: 20,
                    }}
                  >
                    <RocketOutlined style={{ color: '#3B82F6', fontSize: 32 }} />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#F1F5F9', marginBottom: 8 }}>
                    开启寻队状态后，系统将为你推荐合适的项目
                  </div>
                  <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 24 }}>
                    点击上方开关或发布寻队需求，开始寻找你的队友
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => setIsSeekerModalVisible(true)}
                    style={{
                      borderRadius: 10,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
                      height: 44,
                      paddingInline: 28,
                    }}
                  >
                    发布寻队需求
                  </Button>
                </Card>
              </>
            )}

            {/* ══════════ Seeker Form Modal ══════════ */}
            <SeekerFormModal
              open={isSeekerModalVisible}
              onCancel={() => setIsSeekerModalVisible(false)}
              onSuccess={handleSubmitSeekerReq}
              initialData={currentUser.seekerReq}
            />
          </>
        )}

        {/* ══════════ Captain Workbench Section ══════════ */}
        {isCaptain && (
          <>
            {/* ══════════ My Projects Section ══════════ */}
            {sectionHeading('我的项目')}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <Segmented
                value={showArchived ? '已完成' : '进行中'}
                options={['进行中', '已完成']}
                onChange={(value) => setShowArchived(value === '已完成')}
                style={{ marginBottom: 0 }}
              />
              <Button
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateProjectModalVisible(true)}
                style={{
                  borderRadius: 10,
                  fontWeight: 600,
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: '#FFFFFF',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}
              >
                创建新项目
              </Button>
            </div>

            {displayedProjects.length > 0 ? (
              <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
                {displayedProjects.map((project) => (
                  <Col xs={24} sm={12} lg={8} key={project.id}>
                    <div
                      style={showArchived ? { opacity: 0.7, filter: 'grayscale(30%)' } : undefined}
                    >
                      <ProjectCard
                        project={project}
                        extraTags={
                          showArchived
                            ? [<Tag key="archived" color="default" style={{ borderRadius: 6 }}>已完成</Tag>]
                            : undefined
                        }
                      />
                      {!showArchived && project.status === '招募中' && (
                        <Button
                          type="link"
                          block
                          onClick={() => handleViewRecommendations(project.id)}
                          style={{
                            marginTop: 8,
                            color: '#3B82F6',
                            fontWeight: 500,
                            borderRadius: 8,
                          }}
                        >
                          {selectedProjectId === project.id ? '收起推荐队员' : '查看推荐队员'}
                        </Button>
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <Card
                style={{
                  borderRadius: 14,
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  textAlign: 'center',
                  marginBottom: 32,
                }}
                styles={{ body: { padding: '56px 24px' } }}
              >
                <Empty
                  description={
                    <div>
                      <div style={{ fontSize: 18, marginBottom: 8 }}>
                        {showArchived ? '暂无归档项目' : '暂无项目'}
                      </div>
                      <Text style={{ color: '#94A3B8' }}>
                        {showArchived
                          ? '结束的项目会归档在这里'
                          : '点击上方按钮创建你的第一个项目'}
                      </Text>
                    </div>
                  }
                />
              </Card>
            )}

            {/* ══════════ Recommended Members Section ══════════ */}
            {selectedProjectId && (
              <div style={{ marginBottom: 32 }}>
                {sectionHeading('推荐队员')}

                <div style={{ marginBottom: 20 }}>
                  <Input.Search
                    placeholder="搜索队员（技能、专业、昵称等）"
                    allowClear
                    onChange={(e) => setSearchText(e.target.value)}
                    size="large"
                    style={{ maxWidth: 480 }}
                  />
                </div>

                {(() => {
                  const project = projects.find((p) => p.id === selectedProjectId);
                  if (!project) return null;

                  let recommendedMembers = recommendMembersForProject(project, users);
                  recommendedMembers = filterMembers(recommendedMembers, searchText);

                  if (recommendedMembers.length === 0) {
                    return (
                      <Card
                        style={{
                          borderRadius: 14,
                          border: 'none',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                          textAlign: 'center',
                        }}
                        styles={{ body: { padding: '56px 24px' } }}
                      >
                        <Empty description="没有找到匹配的队员，请尝试其他搜索词" />
                      </Card>
                    );
                  }

                  return (
                    <Row gutter={[20, 20]}>
                      {recommendedMembers.map((member) => (
                        <Col xs={24} sm={12} lg={8} key={member.id}>
                          <MemberCard
                            member={member}
                            project={project}
                            onInvite={() => handleSendInvite(member, project)}
                            onViewProfile={() => navigate(`/user/${member.id}?projectId=${project.id}`)}
                          />
                        </Col>
                      ))}
                    </Row>
                  );
                })()}
              </div>
            )}
          </>
        )}

        {/* ══════════ CTA Banner ══════════ */}
        <div
          style={{
            borderRadius: 16,
            padding: '32px 40px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.05) 100%)',
            boxShadow: '0 8px 24px rgba(59,130,246,0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: 'absolute',
              top: -30,
              right: 40,
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -40,
              right: 180,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20,
            }}
          >
            <div>
              <Title level={4} style={{ color: '#1E40AF', fontWeight: 700, marginBottom: 6 }}>
                准备好开始了吗？
              </Title>
              <Text style={{ color: '#94A3B8', fontSize: 14 }}>
                {isCaptain
                  ? '发布项目，寻找优秀队员，一起冲击比赛奖项！'
                  : '浏览项目，找到适合您的团队，开启精彩的比赛之旅！'}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
