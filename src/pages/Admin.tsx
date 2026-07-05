import React from 'react';
import { Card, Table, Tag, Typography, Space, Button, Row, Col, Popconfirm, App as AntdApp } from 'antd';
import { TeamOutlined, ProjectOutlined, TrophyOutlined, CheckCircleOutlined, UserOutlined, DeleteOutlined, DashboardOutlined } from '@ant-design/icons';
import { useApp } from '../context/AppContext';

const { Title, Text } = Typography;

const STAT_CARDS = [
  { key: 'users', label: '总用户数', color: '#3B82F6', icon: TeamOutlined, bg: 'rgba(59, 130, 246, 0.15)' },
  { key: 'projects', label: '总项目数', color: '#F97316', icon: ProjectOutlined, bg: 'rgba(249, 115, 22, 0.15)' },
  { key: 'formed', label: '已组队', color: '#22C55E', icon: TrophyOutlined, bg: 'rgba(34, 197, 94, 0.15)' },
  { key: 'ended', label: '已结束', color: '#94A3B8', icon: CheckCircleOutlined, bg: 'rgba(148, 163, 184, 0.15)' },
] as const;

export default function Admin() {
  const { currentUser, users, projects, messages, deleteUser, deleteProject } = useApp();
  const { message: antdMessage } = AntdApp.useApp();

  if (!currentUser || currentUser.role !== '管理员') return null;

  const nonAdminUsers = users.filter(u => u.role !== '管理员');
  const totalUsers = users.filter(u => u.role !== '管理员').length;
  const totalProjects = projects.length;
  const formedTeams = projects.filter(p => p.status === '已组队').length;
  const endedProjects = projects.filter(p => p.status === '已结束').length;

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId);
    antdMessage.success('用户已删除');
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
    antdMessage.success('项目已删除');
  };

  const statValues = [totalUsers, totalProjects, formedTeams, endedProjects];

  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => (
        <Text strong style={{ color: '#F1F5F9' }}>{text}</Text>
      ),
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (text: string) => <Text style={{ color: '#94A3B8' }}>{text}</Text>,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag
          style={{
            borderRadius: 8,
            background: role === '队长' ? 'rgba(59, 130, 246, 0.15)' : role === '队员' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            color: role === '队长' ? '#3B82F6' : role === '队员' ? '#D97706' : '#64748B',
            border: 'none',
            fontWeight: 500,
          }}
        >
          {role}
        </Tag>
      ),
    },
    {
      title: '技能',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills: string[]) => (
        <Space size={4} wrap>
          {(skills || []).slice(0, 2).map((skill) => (
            <Tag key={skill} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', border: 'none', borderRadius: 6 }}>{skill}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: any) => (
        <Popconfirm
          title="确认删除此用户？"
          onConfirm={() => handleDeleteUser(record.id)}
          okText="确认"
          cancelText="取消"
          okButtonProps={{ style: { background: '#DC2626', border: 'none' } }}
        >
          <Button type="text" icon={<DeleteOutlined />} size="small" style={{ color: '#DC2626' }}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const projectColumns = [
    {
      title: '项目名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <Text strong style={{ color: '#F1F5F9' }}>{text}</Text>
      ),
    },
    {
      title: '比赛类型',
      dataIndex: 'competitionType',
      key: 'competitionType',
      render: (text: string) => <Tag style={{ border: 'none', borderRadius: 6, background: 'rgba(255, 255, 255, 0.03)', color: '#94A3B8' }}>{text}</Tag>,
    },
    {
      title: '队长',
      key: 'captain',
      render: (_: unknown, record: { captainId: string }) => {
        const captain = users.find(u => u.id === record.captainId);
        return <Text style={{ color: '#94A3B8' }}>{captain?.nickname || '未知'}</Text>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          '招募中': '#3B82F6',
          '已组队': '#059669',
          '已结束': '#64748B',
          '进行中': '#D97706',
        };
        const bgMap: Record<string, string> = {
          '招募中': 'rgba(59, 130, 246, 0.15)',
          '已组队': 'rgba(34, 197, 94, 0.2)',
          '已结束': 'rgba(255, 255, 255, 0.03)',
          '进行中': 'rgba(234, 179, 8, 0.15)',
        };
        return (
          <Tag
            style={{
              borderRadius: 8,
              background: bgMap[status] || 'rgba(255, 255, 255, 0.03)',
              color: colorMap[status] || '#64748B',
              border: 'none',
              fontWeight: 500,
            }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: '团队人数',
      dataIndex: 'teamMembers',
      key: 'teamMembers',
      render: (teamMembers: string[]) => (
        <Text style={{ color: '#F1F5F9' }}>{teamMembers?.length || 0}</Text>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: any) => (
        <Popconfirm
          title="确认删除此项目？"
          onConfirm={() => handleDeleteProject(record.id)}
          okText="确认"
          cancelText="取消"
          okButtonProps={{ style: { background: '#DC2626', border: 'none' } }}
        >
          <Button type="text" icon={<DeleteOutlined />} size="small" style={{ color: '#DC2626' }}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const sectionTitleStyle: React.CSSProperties = {
    borderLeft: '4px solid transparent',
    borderImage: 'linear-gradient(180deg, #DBEAFE, #3B82F6, #DBEAFE) 1',
    paddingLeft: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const sectionCardStyle: React.CSSProperties = {
    borderRadius: 14,
    border: '1px solid rgba(148, 163, 184, 0.08)',
    background: 'rgba(255, 255, 255, 0.05)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0F2557 0%, #1D4ED8 50%, #3B82F6 100%)',
        height: 120,
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <DashboardOutlined style={{ fontSize: 28, color: 'rgba(255,255,255,0.9)' }} />
            <div>
              <Title level={3} style={{ color: '#FFFFFF', fontWeight: 700, margin: 0 }}>管理后台</Title>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>管理平台用户、项目及数据概览</Text>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', marginTop: -40 }}>
        {/* Stat Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          {STAT_CARDS.map((card, index) => (
            <Col xs={24} sm={12} lg={6} key={card.key}>
              <Card variant="outlined" style={{
                borderRadius: 14,
                border: '1px solid rgba(148, 163, 184, 0.08)',
                background: 'rgba(255, 255, 255, 0.05)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                borderLeft: `4px solid ${card.color}`,
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text style={{ color: '#94A3B8', fontSize: 14 }}>{card.label}</Text>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#F1F5F9', lineHeight: 1.3, marginTop: 4 }}>
                      {statValues[index]}
                    </div>
                  </div>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: card.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <card.icon style={{ fontSize: 24, color: card.color }} />
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* User Management */}
        <Card
          bordered={false}
          style={{ ...sectionCardStyle, marginBottom: 24 }}
        >
          <div style={{ marginBottom: 20 }}>
            <Title level={4} style={{ ...sectionTitleStyle, color: '#F1F5F9', fontWeight: 600, margin: 0 }}>
              <UserOutlined style={{ color: '#3B82F6' }} />
              用户管理
            </Title>
          </div>
          <Table
            dataSource={nonAdminUsers}
            columns={userColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            style={{ borderColor: 'rgba(148, 163, 184, 0.1)' }}
            onRow={(record) => ({
              style: { borderRadius: 12 }
            })}
          />
        </Card>

        {/* Project Management */}
        <Card
          bordered={false}
          style={{ ...sectionCardStyle, marginBottom: 24 }}
        >
          <div style={{ marginBottom: 20 }}>
            <Title level={4} style={{ ...sectionTitleStyle, color: '#F1F5F9', fontWeight: 600, margin: 0 }}>
              <ProjectOutlined style={{ color: '#F97316' }} />
              项目管理
            </Title>
          </div>
          <Table
            dataSource={projects}
            columns={projectColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            style={{ borderColor: 'rgba(148, 163, 184, 0.1)' }}
          />
        </Card>
      </div>
    </div>
  );
}
