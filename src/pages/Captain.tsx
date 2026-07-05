import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Typography,
  Space,
  App as AntdApp,
  Badge,
  Avatar,
  Empty,
  Segmented,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  EyeOutlined,
  RocketOutlined,
  CameraOutlined,
  TeamOutlined,
  TrophyOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { recommendMembersForProject, getUserHighestAwardLevel } from '../utils/matching';
import type { User, Project } from '../types';
import ProjectCard from '../components/ProjectCard';
import { supabase } from '../utils/supabaseClient';

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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
      {/* Header */}
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

      {/* Skills */}
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

      {/* Awards */}
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

      {/* Bio */}
      <Paragraph
        ellipsis={{ rows: 2 }}
        style={{ color: '#94A3B8', fontSize: 13, marginBottom: 16, minHeight: 36 }}
      >
        {member.bio}
      </Paragraph>

      {/* Actions */}
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

/* ── Main Captain component ──────────────────────────────── */
export default function Captain() {
  const navigate = useNavigate();
  const { currentUser, projects, users, addProject, sendMessage } = useApp();

  if (!currentUser) return null;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [form] = Form.useForm();
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const { message: antdMessage } = AntdApp.useApp();

  const myProjects = currentUser ? projects.filter((p) => p.captainId === currentUser.id) : [];
  const activeProjects = myProjects.filter((p) => p.status !== '已结束');
  const archivedProjects = myProjects.filter((p) => p.status === '已结束');
  const displayedProjects = showArchived ? archivedProjects : activeProjects;

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

  const showCreateModal = () => {
    setIsModalVisible(true);
    setCoverImage(null);
  };

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

  const handleCreateProject = async (values: any) => {
    const requiredSkills = values.requiredSkills
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s);

    const projectId = `project${Date.now()}`;

    const { error } = await supabase.from('projects').insert({
      id: projectId,
      title: values.title,
      description: values.description,
      competition_type: values.competitionType,
      captain_id: currentUser.id,
      required_skills: requiredSkills,
      status: '招募中'
    });

    if (error) {
      console.error('Error creating project:', error.message);
      antdMessage.error(`创建项目失败: ${error.message}`);
      return;
    }

    const newProject: Project = {
      id: projectId,
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
    setIsModalVisible(false);
    setCoverImage(null);
    form.resetFields();
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
              background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
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
              left: '35%',
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
                队长工作台
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                管理你的项目团队，招募优秀队员，冲刺比赛巅峰
              </div>
            </div>
            <Button
              size="large"
              icon={<PlusOutlined />}
              onClick={showCreateModal}
              style={{
                borderRadius: 10,
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: '#FFFFFF',
                color: '#1D4ED8',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                height: 48,
                paddingInline: 32,
                fontSize: 15,
              }}
            >
              创建新项目
            </Button>
          </div>
        </div>

        {/* ══════════ Statistics Row ══════════ */}
        <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={8}>
            <StatCard
              color="#3B82F6"
              bgColor="rgba(59, 130, 246, 0.15)"
              icon={<RocketOutlined style={{ fontSize: 22, color: '#3B82F6' }} />}
              label="我的项目"
              value={activeProjects.length}
              onClick={() => navigate('/captain')}
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatCard
              color="#F97316"
              bgColor="rgba(249, 115, 22, 0.15)"
              icon={<TeamOutlined style={{ fontSize: 22, color: '#F97316' }} />}
              label="招募中"
              value={activeProjects.filter((p) => p.status === '招募中').length}
              onClick={() => navigate('/captain')}
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatCard
              color="#22C55E"
              bgColor="rgba(34, 197, 94, 0.15)"
              icon={<TrophyOutlined style={{ fontSize: 22, color: '#22C55E' }} />}
              label="已组队"
              value={activeProjects.filter((p) => p.status === '已组队').length}
              onClick={() => navigate('/captain')}
            />
          </Col>
        </Row>

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
            value={showArchived ? '已归档' : '进行中'}
            options={['进行中', '已归档']}
            onChange={(value) => setShowArchived(value === '已归档')}
            style={{ marginBottom: 0 }}
          />
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
                        ? [<Tag key="archived" color="default" style={{ borderRadius: 6 }}>已归档</Tag>]
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

            {/* Search bar */}
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

        {/* ══════════ Create Project Modal ══════════ */}
        <Modal
          title="创建新项目"
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setCoverImage(null);
          }}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleCreateProject}>
            <Form.Item
              name="title"
              label="项目名称"
              rules={[{ required: true, message: '请输入项目名称' }]}
            >
              <Input placeholder="请输入项目名称" size="large" style={{ borderRadius: 10 }} />
            </Form.Item>

            <Form.Item
              name="competitionType"
              label="比赛类型"
              rules={[{ required: true, message: '请选择比赛类型' }]}
            >
              <Select placeholder="请选择比赛类型" size="large" style={{ borderRadius: 10 }}>
                <Option value="互联网+">互联网+</Option>
                <Option value="挑战杯">挑战杯</Option>
                <Option value="数学建模">数学建模</Option>
                <Option value="大创">大创</Option>
                <Option value="ACM">ACM</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>

            <Form.Item label="封面图片">
              <div style={{ textAlign: 'center' }}>
                {coverImage ? (
                  <div style={{ marginBottom: 16 }}>
                    <img
                      src={coverImage}
                      alt="封面"
                      style={{ width: 128, height: 128, objectFit: 'cover', borderRadius: 14 }}
                    />
                    <div>
                      <Button type="link" onClick={() => setCoverImage(null)}>
                        更换图片
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      style={{ display: 'none' }}
                      id="cover-image-input"
                    />
                    <Button
                      icon={<CameraOutlined />}
                      onClick={() => document.getElementById('cover-image-input')?.click()}
                      style={{ borderRadius: 10 }}
                    >
                      上传封面图片
                    </Button>
                  </div>
                )}
              </div>
            </Form.Item>

            <Form.Item
              name="description"
              label="项目描述"
              rules={[{ required: true, message: '请输入项目描述' }]}
            >
              <TextArea
                rows={4}
                placeholder="请详细描述你的项目"
                size="large"
                style={{ borderRadius: 10 }}
              />
            </Form.Item>

            <Form.Item
              name="requiredSkills"
              label="需要技能"
              rules={[{ required: true, message: '请输入需要的技能' }]}
              help="多个技能用逗号分隔，如：React, Python, UI设计"
            >
              <Input
                placeholder="React, Python, UI设计"
                size="large"
                style={{ borderRadius: 10 }}
              />
            </Form.Item>

            <Form.Item
              name="requiredMembers"
              label="需要队员数量"
              rules={[{ required: true, message: '请选择需要的队员数量' }]}
              initialValue={3}
            >
              <Select
                placeholder="请选择需要的队员数量"
                size="large"
                style={{ borderRadius: 10 }}
              >
                <Option value={1}>1 人</Option>
                <Option value={2}>2 人</Option>
                <Option value={3}>3 人</Option>
                <Option value={4}>4 人</Option>
                <Option value={5}>5 人</Option>
                <Option value={6}>6 人</Option>
                <Option value={7}>7 人</Option>
                <Option value={8}>8 人</Option>
              </Select>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Space size={12}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
                    paddingInline: 32,
                  }}
                >
                  创建项目
                </Button>
                <Button
                  size="large"
                  onClick={() => {
                    setIsModalVisible(false);
                    setCoverImage(null);
                  }}
                  style={{ borderRadius: 10 }}
                >
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
