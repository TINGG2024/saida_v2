import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Tag, Typography, Button, Space, App as AntdApp, Modal, Select, Row, Col, Avatar } from 'antd';
import { UserOutlined, StarOutlined, TrophyOutlined, RiseOutlined, EditOutlined, ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { useApp } from '../context/AppContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, users, projects, sendMessage } = useApp();
  const { message: antdMessage } = AntdApp.useApp();

  const projectId = searchParams.get('projectId');

  if (!currentUser) return null;

  const user = users.find(u => u.id === id);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const handleBack = () => {
    navigate(-1);
  };

  if (!user) {
    return (
      <div style={{ 
        minHeight: '50vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.03)',
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>👤</div>
        <Title level={3}>用户不存在</Title>
        <Text type="secondary">该用户已被删除或不存在</Text>
        <Button type="primary" onClick={handleBack} style={{ marginTop: 16, background: '#3B82F6', border: 'none' }}>
          返回
        </Button>
      </div>
    );
  }

  const getAwardLevelColor = (level: string) => {
    switch (level) {
      case '国家级': return 'gold';
      case '省部级': return 'purple';
      case '校级': return 'default';
      default: return 'default';
    }
  };

  const getAwardLevelIcon = (level: string) => {
    switch (level) {
      case '国家级': return '🥇';
      case '省部级': return '🥈';
      case '校级': return '🥉';
      default: return '🎖️';
    }
  };

  const myProjects = projects.filter(p => p.captainId === currentUser.id && p.status === '招募中');

  const showInviteModal = () => {
    setIsInviteModalVisible(true);
  };

  const handleSendInvite = () => {
    if (!selectedProjectId) {
      antdMessage.error('请选择一个项目');
      return;
    }
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return;

    const inviteMessage = {
      id: `msg${Date.now()}`,
      type: 'invite' as const,
      fromUserId: currentUser.id,
      toUserId: user.id,
      projectId: project.id,
      content: `邀请你加入项目「${project.title}」`,
      timestamp: new Date().toISOString(),
      status: 'pending' as const
    };
    sendMessage(inviteMessage);
    setIsInviteModalVisible(false);
    setSelectedProjectId('');
    antdMessage.success(`已向 ${user.nickname} 发送邀请！`);
  };

  const sectionTitleStyle: React.CSSProperties = {
    borderLeft: '4px solid transparent',
    borderImage: 'linear-gradient(180deg, #DBEAFE, #3B82F6, #DBEAFE) 1',
    paddingLeft: 12,
    marginBottom: 16,
  };

  const gradientHeaderStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #0F2557 0%, #1D4ED8 50%, #3B82F6 100%)',
    padding: '40px 32px',
    color: '#FFFFFF',
  };

  const contentCardStyle: React.CSSProperties = {
    borderRadius: 14,
    border: '1px solid rgba(148, 163, 184, 0.08)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  };

  const sectionCardStyle: React.CSSProperties = {
    borderRadius: 12,
    border: '1px solid rgba(148, 163, 184, 0.08)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    background: 'rgba(255, 255, 255, 0.05)',
  };

  return (
    <div style={{ minHeight: '100vh', padding: '32px 0', background: 'transparent' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        <Button 
          type="text" 
          onClick={handleBack} 
          style={{ marginBottom: 20, color: '#94A3B8', display: 'flex', alignItems: 'center' }}
          icon={<ArrowLeftOutlined />}
        >
          返回
        </Button>

        <Card variant="outlined" style={contentCardStyle}>
          {/* Gradient Header */}
          <div style={gradientHeaderStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar 
                  style={{ backgroundColor: '#fff', color: '#3B82F6', border: '4px solid rgba(255,255,255,0.3)' }}
                  size={80}
                >
                  {user.nickname?.charAt(0)}
                </Avatar>
                <div>
                  <Title level={2} style={{ color: '#FFFFFF', margin: 0 }}>{user.nickname}</Title>
                  <Space style={{ marginTop: 8 }}>
                    <Tag style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 6 }}>
                      {user.role}
                    </Tag>
                    {user.major && (
                      <Tag style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 6 }}>
                        {user.major}
                      </Tag>
                    )}
                  </Space>
                </div>
              </div>
              {currentUser.id === user.id && (
                <Button 
                  type="primary" 
                  onClick={() => navigate('/profile')}
                  icon={<EditOutlined />}
                  style={{ background: '#3B82F6', color: '#FFFFFF', border: 'none', fontWeight: 600, borderRadius: 8 }}
                >
                  编辑资料
                </Button>
              )}
            </div>
          </div>

          <div style={{ padding: 24 }}>
            <Row gutter={[24, 24]}>
              <Col lg={16} xs={24}>
                {user.bio && (
                  <div style={{ marginBottom: 24 }}>
                    <Title level={4} style={{ ...sectionTitleStyle, color: '#F1F5F9', fontWeight: 600 }}>
                      <UserOutlined /> 个人简介
                    </Title>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 12, padding: 20, border: '1px solid rgba(148, 163, 184, 0.08)' }}>
                      <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', color: '#F1F5F9', marginBottom: 0 }}>
                        {user.bio}
                      </Paragraph>
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <Title level={4} style={{ ...sectionTitleStyle, color: '#F1F5F9', fontWeight: 600 }}>
                    <StarOutlined /> 技能特长
                  </Title>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {user.skills.map(skill => (
                      <Tag 
                        key={skill} 
                        style={{ 
                          background: 'rgba(59, 130, 246, 0.15)', 
                          color: '#3B82F6', 
                          border: 'none', 
                          fontWeight: 500,
                          padding: '6px 16px',
                          borderRadius: 20,
                          fontSize: 15,
                        }}
                      >
                        {skill}
                      </Tag>
                    ))}
                  </div>
                </div>

                {user.experiences.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <Title level={4} style={{ ...sectionTitleStyle, color: '#F1F5F9', fontWeight: 600 }}>
                      <RiseOutlined /> 项目经历
                    </Title>
                    <div style={sectionCardStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {user.experiences.map((exp, index) => (
                          <div 
                            key={index} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 12, 
                              padding: 14,
                              borderRadius: 10,
                              background: 'rgba(255, 255, 255, 0.03)',
                              transition: 'background 0.2s',
                              cursor: 'default',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(59, 130, 246, 0.15)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255, 255, 255, 0.05)'; }}
                          >
                            <div style={{ fontSize: 20 }}>📋</div>
                            <Text style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9' }}>{exp}</Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Col>

              <Col lg={8} xs={24}>
                {user.awards.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ 
                      background: 'rgba(234, 179, 8, 0.1)', 
                      borderRadius: 14, 
                      padding: 20, 
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      boxShadow: '0 2px 8px rgba(234,179,8,0.08)',
                    }}>
                      <Title level={4} style={{ ...sectionTitleStyle, color: '#F1F5F9', fontWeight: 600 }}>
                        <TrophyOutlined /> 获奖经历
                      </Title>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {user.awards.map((award, index) => (
                          <div 
                            key={index} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 12, 
                              padding: 14,
                              borderRadius: 10,
                              background: 'rgba(255, 255, 255, 0.05)',
                            }}
                          >
                            <div style={{ fontSize: 24 }}>{getAwardLevelIcon(award.level)}</div>
                            <div>
                              <Text style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>{award.competition}</Text>
                              <div style={{ marginTop: 2 }}>
                                <Tag 
                                  style={award.level === '校级' || getAwardLevelColor(award.level) === 'default' 
                                    ? { background: 'rgba(255, 255, 255, 0.03)', color: '#94A3B8', border: 'none', borderRadius: 6 } 
                                    : { borderRadius: 6 }}
                                  color={award.level === '校级' || getAwardLevelColor(award.level) === 'default' ? undefined : getAwardLevelColor(award.level)}
                                >
                                  {award.level}
                                </Tag>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {user.role === '队员' && (
                  <div style={{ marginBottom: 24, ...sectionCardStyle, padding: 20 }}>
                    <Title level={4} style={{ ...sectionTitleStyle, color: '#F1F5F9', fontWeight: 600 }}>求职意向</Title>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text type="secondary">是否在找队伍</Text>
                        <Tag style={user.seekingTeam ? { background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', border: 'none', borderRadius: 6 } : { background: 'rgba(255, 255, 255, 0.03)', color: '#94A3B8', border: 'none', borderRadius: 6 }}>
                          {user.seekingTeam ? '是' : '否'}
                        </Tag>
                      </div>
                      {user.seekerReq && user.seekerReq.active && (
                        <div>
                          <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>期望技能</Text>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {user.seekerReq.expectSkills.map(skill => (
                              <Tag key={skill} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', border: 'none', borderRadius: 6 }}>{skill}</Tag>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {user.role === '队长' && (
                  <div style={{ marginBottom: 24, ...sectionCardStyle, padding: 20 }}>
                    <Title level={4} style={{ ...sectionTitleStyle, color: '#F1F5F9', fontWeight: 600 }}>我的项目</Title>
                    {(() => {
                      const captainProjects = projects.filter(p => p.captainId === user.id);
                      return captainProjects.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {captainProjects.slice(0, 3).map(project => (
                            <div 
                              key={project.id}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                padding: 14,
                                borderRadius: 10,
                                background: 'rgba(255, 255, 255, 0.03)',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                              }}
                              onClick={() => navigate(`/project/${project.id}`)}
                              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(59, 130, 246, 0.15)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255, 255, 255, 0.05)'; }}
                            >
                              <div>
                                <Text style={{ fontWeight: 600, color: '#F1F5F9' }}>{project.title}</Text>
                                <div>
                                  <Text type="secondary" style={{ fontSize: 13 }}>
                                    {project.status} · {project.teamMembers?.length || 0}人
                                  </Text>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Text type="secondary">暂无项目</Text>
                      );
                    })()}
                  </div>
                )}
              </Col>
            </Row>
          </div>

          {currentUser.id !== user.id && (currentUser.role === '队长' || currentUser.role === 'both') && myProjects.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 24, paddingBottom: 24 }}>
              <Button 
                type="primary" 
                size="large" 
                onClick={showInviteModal}
                style={{
                  background: '#3B82F6',
                  border: 'none',
                  borderRadius: 10,
                  height: 48,
                  paddingInline: 32,
                  fontSize: 16,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                }}
                icon={<SendOutlined />}
              >
                邀请加入项目
              </Button>
            </div>
          )}
        </Card>

        <Modal
          title="选择项目"
          open={isInviteModalVisible}
          onCancel={() => setIsInviteModalVisible(false)}
          onOk={handleSendInvite}
          okButtonProps={{ style: { background: '#3B82F6', border: 'none', borderRadius: 8 } }}
        >
          <Select
            placeholder="请选择一个项目"
            value={selectedProjectId}
            onChange={setSelectedProjectId}
            style={{ width: '100%' }}
            size="large"
          >
            {myProjects.map(project => (
              <Option key={project.id} value={project.id}>
                {project.title}
              </Option>
            ))}
          </Select>
          <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
            选择后将向 {user.nickname} 发送组队邀请
          </Text>
        </Modal>
      </div>
    </div>
  );
}
