import React, { useState, useMemo } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Tag,
  Typography,
  Space,
  App as AntdApp,
  Switch,
  Select,
  Empty,
} from 'antd';
import {
  RocketOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  TeamOutlined,
  BulbOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { recommendProjectsForMember } from '../utils/matching';
import SeekerFormModal from '../components/SeekerFormModal';
import ProjectCard from '../components/ProjectCard';
import type { SeekerRequirement } from '../types';

const { Text } = Typography;

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
  onClick,
}: {
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  label: string;
  value: number;
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

/* ── Main Member component ────────────────────────────────── */
export default function Member() {
  const navigate = useNavigate();
  const { currentUser, projects, users, updateUser, sendMessage } = useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText] = useState('');
  const [selectedSkills] = useState<string[]>([]);
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
    setIsModalVisible(false);
    antdMessage.success('寻队需求已发布！');
  };

  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    (projects || []).forEach((p) => (p.requiredSkills || []).forEach((s) => skills.add(s)));
    return Array.from(skills);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let result = currentUser.seekingTeam
      ? recommendProjectsForMember(currentUser, projects)
      : [];

    if (searchText.trim()) {
      const keywords = searchText
        .toLowerCase()
        .split(' ')
        .filter((k) => k);
      result = result.filter((project) => {
        const captain = users.find((u) => u.id === project.captainId);
        const searchableText = [
          project.title,
          project.description,
          project.competitionType,
          ...project.requiredSkills,
          captain?.nickname || '',
          captain?.major || '',
          ...(captain?.skills || []),
        ]
          .join(' ')
          .toLowerCase();
        return keywords.every((keyword) => searchableText.includes(keyword));
      });
    }

    if (selectedSkills.length > 0) {
      result = result.filter((project) =>
        selectedSkills.every((skill) => project.requiredSkills.includes(skill)),
      );
    }

    return result;
  }, [currentUser, projects, users, searchText, selectedSkills]);

  const joinedProjects = projects.filter((p) => p.teamMembers?.includes(currentUser.id));

  return (
    <div style={{ padding: '24px 20px', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

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
              left: '38%',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
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
                队员工作台
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                寻找合适的队伍，展示你的技能，找到志同道合的队友
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
        </div>

        {/* ══════════ Statistics Row ══════════ */}
        <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={8}>
            <StatCard
              color="#22C55E"
              bgColor="rgba(34, 197, 94, 0.15)"
              icon={<CheckCircleOutlined style={{ fontSize: 22, color: '#22C55E' }} />}
              label="已加入项目"
              value={joinedProjects.length}
              onClick={() => navigate('/member')}
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatCard
              color="#3B82F6"
              bgColor="rgba(59, 130, 246, 0.15)"
              icon={<RocketOutlined style={{ fontSize: 22, color: '#3B82F6' }} />}
              label="推荐项目"
              value={filteredProjects.length}
              onClick={() => navigate('/member')}
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatCard
              color="#F97316"
              bgColor="rgba(249, 115, 22, 0.15)"
              icon={<BulbOutlined style={{ fontSize: 22, color: '#F97316' }} />}
              label="技能数量"
              value={currentUser.skills.length}
              onClick={() => navigate('/profile')}
            />
          </Col>
        </Row>

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
          </div>
        </div>

        {/* ══════════ Recommended Projects Section ══════════ */}
        {currentUser.seekingTeam ? (
          <>
            {sectionHeading('为你推荐以下项目')}

            {/* Seeker req tag */}
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

            {filteredProjects.length > 0 ? (
              <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
                {filteredProjects.map((project) => (
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
                onClick={() => setIsModalVisible(true)}
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
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onSuccess={handleSubmitSeekerReq}
          initialData={currentUser.seekerReq}
        />
      </div>
    </div>
  );
}
