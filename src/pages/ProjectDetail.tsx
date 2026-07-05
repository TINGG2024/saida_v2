import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tag, Typography, Button, Space, App as AntdApp, List, Avatar, Progress, Row, Col, Modal, Form, Input, Select, Popconfirm, InputNumber, DatePicker, Badge } from 'antd';
import { UserOutlined, StarOutlined, ClockCircleOutlined, CheckCircleOutlined, ArrowLeftOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { useApp } from '../context/AppContext';
import { calculateMemberMatchProject } from '../utils/matching';
import type { Task, User, Message } from '../types';

import { supabase } from '../utils/supabaseClient';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const STATUS_CONFIG: Record<string, { color: string; label: string; bg: string }> = {
  todo: { color: '#D97706', label: '待办', bg: 'rgba(234, 179, 8, 0.15)' },
  inProgress: { color: '#3B82F6', label: '进行中', bg: 'rgba(59, 130, 246, 0.15)' },
  done: { color: '#059669', label: '已完成', bg: 'rgba(34, 197, 94, 0.2)' },
};



const SectionHeading: React.FC<{ icon?: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
    <span style={{ width: 4, height: 22, borderRadius: 2, background: 'linear-gradient(180deg, #3B82F6, #60A5FA)' }} />
    <span style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
      {icon}
      {children}
    </span>
  </div>
);

interface ProjectWithCaptain {
  id: string;
  title: string;
  description: string;
  competitionType: string;
  captainId: string;
  requiredSkills: string[];
  requiredMembers: number;
  status: '招募中' | '已组队' | '已结束';
  teamMembers: string[];
  tasks: Task[];
  captainAwardLevel: '国家级' | '省部级' | '校级' | '无';
  createdAt: string;
  updatedAt: string;
  captain?: {
    id: string;
    nickname: string;
    major: string;
  };
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, projects, users, messages, sendMessage, updateMessageStatus, updateProject, deleteProject, endProject, addTask, updateTask, deleteTask, completeTeam } = useApp();
  const { message: antdMessage } = AntdApp.useApp();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();

  // Kanban states
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [addTaskForm] = Form.useForm();
  const [assigneeFilter, setAssigneeFilter] = useState<string | undefined>(undefined);

  const [projectWithCaptain, setProjectWithCaptain] = useState<ProjectWithCaptain | null>(null);

  useEffect(() => {
    const fetchProjectWithCaptain = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('projects')
        .select('*, captain:users(id, nickname, major)')
        .eq('id', id)
        .single();
      if (!error && data) {
        const mappedProject: ProjectWithCaptain = {
          id: data.id,
          title: data.title,
          description: data.description,
          competitionType: data.competition_type,
          captainId: data.captain_id,
          requiredSkills: data.required_skills || [],
          requiredMembers: data.required_members || 1,
          status: (data.status || '招募中') as '招募中' | '已组队' | '已结束',
          teamMembers: data.team_members || [],
          tasks: data.tasks || [],
          captainAwardLevel: (data.captain_award_level || '无') as '国家级' | '省部级' | '校级' | '无',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          captain: data.captain ? {
            id: data.captain.id,
            nickname: data.captain.nickname,
            major: data.captain.major
          } : undefined
        };
        setProjectWithCaptain(mappedProject);
      }
    };
    fetchProjectWithCaptain();
  }, [id]);

  if (!currentUser) return null;

  const project = projectWithCaptain || projects.find(p => p.id === id);
  const captain = projectWithCaptain?.captain || (project ? users.find(u => u.id === project.captainId) : null);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <div className="text-6xl mb-4">&#x1F50D;</div>
        <Title level={3}>项目不存在</Title>
        <Text type="secondary">该项目已被删除或不存在</Text>
        <Button type="primary" onClick={() => navigate('/')} className="mt-4">返回首页</Button>
      </div>
    );
  }

  const matchResult = calculateMemberMatchProject(currentUser, project);

  const projectMessages = messages.filter(msg => msg.projectId === project.id);

  const pendingApplications = projectMessages.filter(
    msg => msg.type === 'apply' && 
    msg.fromUserId === currentUser.id && 
    msg.status === 'pending'
  );

  const receivedApplications = projectMessages.filter(
    msg => msg.type === 'apply' && 
    msg.toUserId === currentUser.id && 
    msg.status === 'pending'
  );

  const receivedInvites = projectMessages.filter(
    msg => msg.type === 'invite' && 
    msg.toUserId === currentUser.id && 
    msg.status === 'pending'
  );

  const teamMembers = project.teamMembers || [];
  const teamMemberUsers = teamMembers.map(memberId => users.find(u => u.id === memberId)).filter(Boolean);

  const handleApply = async () => {
    const { error: insertError } = await supabase.from('project_applications').insert({
      project_id: project.id,
      applicant_id: currentUser.id,
      status: '待审核'
    });

    if (insertError) {
      console.error('Error inserting application:', insertError.message);
      antdMessage.error(`申请失败: ${insertError.message}`);
      return;
    }

    const applyMessage = {
      id: `msg${Date.now()}`,
      type: 'apply' as const,
      fromUserId: currentUser.id,
      toUserId: project.captainId,
      projectId: project.id,
      content: `申请加入项目「${project.title}」`,
      timestamp: new Date().toISOString(),
      status: 'pending' as const
    };
    sendMessage(applyMessage);
    antdMessage.success('申请已发送！');
  };

  const handleCancelApplication = (msgId: string) => {
    updateMessageStatus(msgId, 'rejected');
    antdMessage.success('已取消申请');
  };

  const isCaptain = currentUser.id === project.captainId;

  const currentMembers = teamMembers.length;
  const requiredMembers = project.requiredMembers || 1;
  const progress = Math.round((currentMembers / requiredMembers) * 100);

  const handleEdit = () => {
    editForm.setFieldsValue({
      title: project.title,
      description: project.description,
      competitionType: project.competitionType,
      requiredSkills: project.requiredSkills.join(', '),
      requiredMembers: project.requiredMembers,
      captainAwardLevel: project.captainAwardLevel
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (values: any) => {
    const skills = values.requiredSkills
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s);

    const updatedProject = {
      ...project,
      title: values.title,
      description: values.description,
      competitionType: values.competitionType,
      requiredSkills: skills,
      requiredMembers: values.requiredMembers,
      captainAwardLevel: values.captainAwardLevel
    };

    updateProject(updatedProject);
    setIsEditModalOpen(false);
    antdMessage.success('项目更新成功！');
  };

  const handleDelete = () => {
    deleteProject(project.id);
    antdMessage.success('项目已删除！');
    navigate('/');
  };

  // --- Kanban / Task logic ---

  const isTeamMember = isCaptain || teamMembers.includes(currentUser.id);
  const showKanban = project.status === '已组队' && isTeamMember;

  const tasks: Task[] = project.tasks || [];

  const filteredTasks = assigneeFilter
    ? tasks.filter(t => t.assigneeId === assigneeFilter)
    : tasks;

  const todoTasks = filteredTasks.filter(t => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'inProgress');
  const doneTasks = filteredTasks.filter(t => t.status === 'done');

  const handleEndProject = () => {
    endProject(project.id);
    antdMessage.success('项目已结束！');
  };

  const handleAddTask = (values: any) => {
    const newTask: Task = {
      id: `task${Date.now()}`,
      title: values.title,
      description: values.description || '',
      assigneeId: values.assigneeId,
      deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : undefined,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };
    addTask(project.id, newTask);
    setIsAddTaskModalOpen(false);
    addTaskForm.resetFields();
    antdMessage.success('任务已添加！');
  };

  const handleMoveTask = (task: Task, newStatus: 'todo' | 'inProgress' | 'done') => {
    updateTask(project.id, { ...task, status: newStatus });
    antdMessage.success(`任务已移至「${STATUS_CONFIG[newStatus].label}」`);
  };

  const handleDeleteTask = (task: Task) => {
    deleteTask(project.id, task.id);
    antdMessage.success('任务已删除');
  };

  const renderTaskCard = (task: Task) => {
    const assignee = users.find(u => u.id === task.assigneeId);
    const statusConfig = STATUS_CONFIG[task.status];

    return (
      <Card
        key={task.id}
        size="small"
        className="mb-3 transition-all duration-200"
        style={{
          borderRadius: 10,
          border: '1px solid rgba(148, 163, 184, 0.08)',
          background: 'rgba(255, 255, 255, 0.05)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
        hoverable
      >
        <div style={{ marginBottom: 6 }}>
          <Text strong style={{ fontSize: 14, color: '#F1F5F9' }}>{task.title}</Text>
        </div>
        {task.description && (
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8, lineHeight: 1.6 }}>
            {task.description}
          </Text>
        )}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Avatar
              size={22}
              style={{ backgroundColor: '#3B82F6', fontSize: 11 }}
            >
              {assignee?.nickname?.charAt(0)}
            </Avatar>
            <Text style={{ fontSize: 12, color: '#94A3B8' }}>{assignee?.nickname || '未分配'}</Text>
          </div>
        </div>
        {task.deadline && (
          <div className="flex items-center gap-1 mb-2">
            <CalendarOutlined style={{ fontSize: 12, color: '#64748B' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>{task.deadline}</Text>
          </div>
        )}
        <Space size={4} wrap>
          {task.status === 'todo' && (
            <Button
              size="small"
              style={{ fontSize: 12, borderColor: '#3B82F6', color: '#3B82F6', borderRadius: 6 }}
              onClick={() => handleMoveTask(task, 'inProgress')}
            >
              开始
            </Button>
          )}
          {task.status === 'inProgress' && (
            <>
              <Button
                size="small"
                style={{ fontSize: 12, borderColor: '#22C55E', color: '#22C55E', borderRadius: 6 }}
                onClick={() => handleMoveTask(task, 'done')}
              >
                完成
              </Button>
              <Button
                size="small"
                style={{ fontSize: 12, borderColor: '#EAB308', color: '#EAB308', borderRadius: 6 }}
                onClick={() => handleMoveTask(task, 'todo')}
              >
                回退待办
              </Button>
            </>
          )}
          {task.status === 'done' && (
            <Button
              size="small"
              style={{ fontSize: 12, borderColor: '#3B82F6', color: '#3B82F6', borderRadius: 6 }}
              onClick={() => handleMoveTask(task, 'inProgress')}
            >
              重新开始
            </Button>
          )}
          {isCaptain && (
            <Popconfirm
              title="确定要删除这个任务吗？"
              onConfirm={() => handleDeleteTask(task)}
              okText="删除"
              cancelText="取消"
            >
              <Button
                size="small"
                danger
                style={{ fontSize: 12, borderRadius: 6 }}
              >
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      </Card>
    );
  };

  const renderKanbanColumn = (statusKey: 'todo' | 'inProgress' | 'done', tasksList: Task[]) => {
    const config = STATUS_CONFIG[statusKey];
    return (
      <Col xs={24} md={8}>
        <div
          className="rounded-xl p-4"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            minHeight: 200,
            border: `1px solid ${config.color}22`,
            borderRadius: 14,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <Space>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: config.color,
                  display: 'inline-block',
                }}
              />
              <Text strong style={{ fontSize: 15, color: '#F1F5F9' }}>{config.label}</Text>
            </Space>
            <Badge
              count={tasksList.length}
              style={{ backgroundColor: config.color, boxShadow: `0 2px 8px ${config.color}40` }}
              overflowCount={99}
            />
          </div>
          <div>
            {tasksList.map(task => renderTaskCard(task))}
            {tasksList.length === 0 && (
              <div className="text-center py-8">
                <Text type="secondary" style={{ fontSize: 13 }}>暂无任务</Text>
              </div>
            )}
          </div>
        </div>
      </Col>
    );
  };

  return (
    <div className="min-h-screen py-8">
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        <div className="flex items-center justify-between mb-6">
          <Button 
            type="text" 
            onClick={() => navigate(-1)} 
            className="flex items-center hover:text-blue-500"
            icon={<ArrowLeftOutlined />}
            style={{ color: '#94A3B8' }}
          >
            返回
          </Button>
          <Space>
            {isCaptain && project.status === '已组队' && (
              <Popconfirm
                title="确定要结束这个项目吗？"
                description="结束后项目将标记为已结束，无法再修改任务"
                onConfirm={handleEndProject}
                okText="确定结束"
                cancelText="取消"
              >
                <Button
                  style={{
                    background: '#F97316',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
                  }}
                >
                  结束项目
                </Button>
              </Popconfirm>
            )}
            {isCaptain && (
              <>
                <Button 
                  icon={<EditOutlined />} 
                  onClick={handleEdit}
                  style={{ borderRadius: 8 }}
                >
                  编辑项目
                </Button>
                <Popconfirm
                  title="确定要删除这个项目吗？"
                  description="删除后无法恢复"
                  onConfirm={handleDelete}
                  okText="确定删除"
                  cancelText="取消"
                >
                  <Button 
                    icon={<DeleteOutlined />}
                    style={{ 
                      borderRadius: 10,
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#FCA5A5',
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.25)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239, 68, 68, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.15)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    删除项目
                  </Button>
                </Popconfirm>
              </>
            )}
          </Space>
        </div>

        {/* Gradient Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0F2557, #1D4ED8, #3B82F6)',
          borderRadius: '16px 16px 0 0',
          padding: '40px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative semi-transparent circles */}
          <div style={{
            position: 'absolute',
            top: -40,
            right: -30,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -50,
            left: '10%',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'absolute',
            top: '30%',
            right: '25%',
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }} />

          <div className="flex justify-between items-start" style={{ position: 'relative', zIndex: 1 }}>
            <div>
              <Space className="mb-2">
                <Tag style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                  {project.competitionType}
                </Tag>
                <Tag style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                  {project.status}
                </Tag>
              </Space>
              <Title level={2} style={{ color: '#FFFFFF', margin: '8px 0', fontWeight: 700 }}>{project.title}</Title>
            </div>
            {!isCaptain && matchResult.score > 0 && (
              <div className="text-right">
                <div className="flex items-center justify-center w-16 h-16 rounded-full" style={{ background: 'rgba(59,130,246,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(59,130,246,0.25)' }}>
                  <div className="text-center">
                    <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF' }}>{matchResult.score}</Text>
                    <Text style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>匹配度</Text>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* White Content Card overlapping header bottom */}
        <Card style={{
          borderRadius: '0 0 16px 16px',
          borderTop: 'none',
          border: '1px solid rgba(148, 163, 184, 0.08)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          marginBottom: 24,
          marginTop: 0,
        }}>
          <Row gutter={[24, 24]}>
            <Col lg={16} xs={24}>
              <div className="mb-6">
                <SectionHeading icon={<UserOutlined />}>
                  项目队长
                </SectionHeading>
                <Card 
                  hoverable 
                  className="cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  onClick={() => navigate(`/user/${captain?.id}?projectId=${project.id}`)}
                  style={{
                    borderRadius: 14,
                    border: '1px solid rgba(148, 163, 184, 0.08)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  }}
                >
                  <Space>
                    <Avatar style={{ backgroundColor: '#3B82F6' }} size={56}>
                      {captain?.nickname?.charAt(0)}
                    </Avatar>
                    <div>
                      <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#F1F5F9' }}>{captain?.nickname}</Text>
                      <div>
                        <Text type="secondary">{captain?.major || '未填写专业'}</Text>
                      </div>
                    </div>
                  </Space>
                </Card>
              </div>

              <div className="mb-6">
                <SectionHeading icon={<StarOutlined />}>
                  所需技能
                </SectionHeading>
                <div className="flex flex-wrap gap-2">
                  {(project.requiredSkills || []).map(skill => {
                    const isMatch = (currentUser.skills || []).includes(skill);
                    return (
                      <Tag 
                        key={skill} 
                        style={isMatch
                          ? { background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', fontWeight: 600, borderRadius: 10, border: 'none' }
                          : { background: 'rgba(255, 255, 255, 0.03)', color: '#94A3B8', borderRadius: 10, border: '1px solid rgba(148, 163, 184, 0.08)' }
                        }
                        className="text-lg px-4 py-2"
                      >
                        {skill} {isMatch && <CheckCircleOutlined />}
                      </Tag>
                    );
                  })}
                </div>
                <Text type="secondary" className="mt-2 block">
                  技能匹配度：{Math.round(matchResult.skillScore)}%
                </Text>
              </div>

              <div className="mb-6">
                <SectionHeading icon={<ClockCircleOutlined />}>
                  项目描述
                </SectionHeading>
                <Card style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: 14 }}>
                  <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', color: '#F1F5F9' }}>
                    {project.description}
                  </Paragraph>
                </Card>
              </div>
            </Col>

            <Col lg={8} xs={24}>
              <Card className="mb-6" style={{
                borderRadius: 14,
                border: '1px solid rgba(148, 163, 184, 0.08)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}>
                <div className="text-center">
                  <Title level={3} style={{ color: '#F1F5F9', fontWeight: 700 }}>{project.status}</Title>
                  <div className="my-4">
                    <Progress 
                      type="circle" 
                      percent={Math.min(progress, 100)} 
                      strokeColor={project.status === '招募中' ? '#EAB308' : '#22C55E'}
                      trailColor="rgba(148, 163, 184, 0.2)"
                      format={() => `${currentMembers}/${requiredMembers}`}
                      size={120}
                    />
                  </div>
                  <Text type="secondary">招募进度</Text>
                </div>
              </Card>

              {teamMemberUsers.length > 0 && (
                <Card className="mb-6" style={{
                  borderRadius: 14,
                  border: '1px solid rgba(148, 163, 184, 0.08)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}>
                  <SectionHeading>
                    团队成员
                  </SectionHeading>
                  <List
                    dataSource={[captain, ...teamMemberUsers]}
                    renderItem={(member: User | null) => member && (
                      <List.Item 
                        className="py-3 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => navigate(`/user/${member.id}?projectId=${project.id}`)}
                      >
                        <List.Item.Meta
                          avatar={
                              <Avatar 
                                style={{ 
                                  backgroundColor: member.id === captain?.id ? '#3B82F6' : '#22C55E'
                                }}
                                size={44}
                              >
                              {member.nickname?.charAt(0)}
                            </Avatar>
                          }
                          title={
                            <Space>
                              <Text style={{ fontSize: '16px', fontWeight: 'semibold', color: '#F1F5F9' }}>{member.nickname}</Text>
                              {member.id === captain?.id && (
                                <Tag style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', borderRadius: 8, fontWeight: 600, border: 'none' }} className="text-xs">队长</Tag>
                              )}
                            </Space>
                          }
                          description={
                            <div className="flex flex-wrap gap-1 mt-1">
                              {member.skills.slice(0, 3).map((skill: string) => (
                                <Tag key={skill} style={{ background: 'rgba(255, 255, 255, 0.03)', color: '#94A3B8', borderRadius: 8, border: '1px solid rgba(148, 163, 184, 0.08)' }} className="text-xs">{skill}</Tag>
                              ))}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              )}

              {isCaptain && project.status === '招募中' && receivedApplications.length > 0 && (
                <Card style={{
                  borderRadius: 14,
                  border: '1px solid rgba(148, 163, 184, 0.08)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}>
                  <SectionHeading>
                    收到的申请 ({receivedApplications.length})
                  </SectionHeading>
                  <List
                    dataSource={receivedApplications}
                    renderItem={(msg: Message) => {
                      const applicant = users.find(u => u.id === msg.fromUserId);
                      return (
                        <List.Item 
                          className="py-3"
                          style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}
                          actions={[
                            <Button type="link" onClick={() => navigate(`/user/${applicant?.id}?projectId=${project.id}`)}>
                              查看资料
                            </Button>,
                            <Button type="primary" onClick={() => navigate('/messages')} style={{ borderRadius: 8 }}>
                              处理
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar style={{ backgroundColor: '#22C55E' }} size={40}>
                                {applicant?.nickname?.charAt(0)}
                              </Avatar>
                            }
                            title={applicant?.nickname}
                            description={
                              <Text type="secondary" className="text-sm">
                                {new Date(msg.timestamp).toLocaleString()}
                              </Text>
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                </Card>
              )}
            </Col>
          </Row>

          {!isCaptain && project.status === '招募中' && (
            <div className="text-center mt-8">
              {pendingApplications.length > 0 ? (
                <div className="flex flex-col items-center gap-3">
                  <Tag className="text-lg px-6 py-2" style={{ borderRadius: 10, background: 'rgba(249, 115, 22, 0.15)', color: '#FDBA74', border: '1px solid rgba(249, 115, 22, 0.25)', fontWeight: 600 }}>
                    &#x23F3; 已申请，等待队长审核
                  </Tag>
                  <Button 
                    size="large" 
                    onClick={() => handleCancelApplication(pendingApplications[0].id)}
                    style={{ 
                      borderRadius: 10,
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#FCA5A5',
                      fontWeight: 600,
                      marginTop: 4,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.25)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239, 68, 68, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.15)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    取消申请
                  </Button>
                </div>
              ) : receivedInvites.length > 0 ? (
                <div className="flex flex-col items-center gap-3">
                  <Tag className="text-lg px-6 py-2" style={{ borderRadius: 10, background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.25)', fontWeight: 600 }}>
                    &#x1F4E8; 收到队长邀请
                  </Tag>
                  <Button 
                    type="primary" 
                    size="large" 
                    onClick={() => {
                      updateMessageStatus(receivedInvites[0].id, 'accepted');
                      completeTeam(project.id, currentUser.id);
                      antdMessage.success('已接受邀请！组队成功！');
                    }}
                    style={{ 
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                      border: 'none',
                      height: 48,
                      paddingInline: 32,
                      fontSize: 16,
                      fontWeight: 600,
                      boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
                    }}
                  >
                    同意加入
                  </Button>
                </div>
              ) : teamMembers.includes(currentUser.id) ? (
                <Tag className="text-lg px-6 py-2" style={{ borderRadius: 10, background: 'rgba(34, 197, 94, 0.15)', color: '#86EFAC', border: '1px solid rgba(34, 197, 94, 0.25)', fontWeight: 600 }}>
                  &#x2705; 已加入团队
                </Tag>
              ) : (
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={handleApply}
                  style={{ 
                    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    border: 'none',
                    borderRadius: 10,
                    height: 48,
                    paddingInline: 32,
                    fontSize: 16,
                    fontWeight: 600,
                    boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
                  }}
                >
                  申请加入项目
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* ============ Kanban Board ============ */}
        {showKanban && (
          <div className="mt-8 fade-in">
            <div className="flex items-center justify-between mb-4">
              <SectionHeading icon={<ClockCircleOutlined />}>
                任务看板
              </SectionHeading>
              <Space>
                <Select
                  placeholder="筛选负责人"
                  allowClear
                  style={{ width: 160, borderRadius: 8 }}
                  value={assigneeFilter}
                  onChange={(val: string | undefined) => setAssigneeFilter(val)}
                >
                  <Option value={undefined}>全部</Option>
                  <Option value={project.captainId}>
                    {captain?.nickname || '队长'}（队长）
                  </Option>
                  {teamMembers.map(memberId => {
                    const member = users.find(u => u.id === memberId);
                    return (
                      <Option key={memberId} value={memberId}>
                        {member?.nickname || '队员'}
                      </Option>
                    );
                  })}
                </Select>
                {isCaptain && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddTaskModalOpen(true)}
                    style={{ background: '#3B82F6', border: 'none', borderRadius: 8, fontWeight: 600 }}
                  >
                    添加任务
                  </Button>
                )}
              </Space>
            </div>

            <Row gutter={[16, 16]}>
              {renderKanbanColumn('todo', todoTasks)}
              {renderKanbanColumn('inProgress', inProgressTasks)}
              {renderKanbanColumn('done', doneTasks)}
            </Row>
          </div>
        )}

        {/* ============ Add Task Modal ============ */}
        <Modal
          title="添加任务"
          open={isAddTaskModalOpen}
          onCancel={() => {
            setIsAddTaskModalOpen(false);
            addTaskForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={addTaskForm}
            layout="vertical"
            onFinish={handleAddTask}
            initialValues={{ status: 'todo' }}
          >
            <Form.Item
              name="title"
              label="任务标题"
              rules={[{ required: true, message: '请输入任务标题' }]}
            >
              <Input placeholder="请输入任务标题" />
            </Form.Item>

            <Form.Item
              name="description"
              label="任务描述"
            >
              <TextArea rows={3} placeholder="请输入任务描述（可选）" />
            </Form.Item>

            <Form.Item
              name="assigneeId"
              label="负责人"
              rules={[{ required: true, message: '请选择负责人' }]}
            >
              <Select placeholder="请选择负责人">
                <Option value={project.captainId}>
                  {captain?.nickname || '队长'}（队长）
                </Option>
                {teamMembers.map(memberId => {
                  const member = users.find(u => u.id === memberId);
                  return (
                    <Option key={memberId} value={memberId}>
                      {member?.nickname || '队员'}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            <Form.Item
              name="deadline"
              label="截止日期"
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="请选择截止日期"
                format="YYYY-MM-DD"
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" style={{ background: '#3B82F6', border: 'none', borderRadius: 8 }}>添加</Button>
                <Button onClick={() => {
                  setIsAddTaskModalOpen(false);
                  addTaskForm.resetFields();
                }}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* ============ Edit Project Modal ============ */}
        <Modal
          title="编辑项目"
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          footer={null}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditSubmit}
          >
            <Form.Item
              name="title"
              label="项目标题"
              rules={[{ required: true, message: '请输入项目标题' }]}
            >
              <Input placeholder="请输入项目标题" />
            </Form.Item>

            <Form.Item
              name="description"
              label="项目描述"
              rules={[{ required: true, message: '请输入项目描述' }]}
            >
              <TextArea rows={4} placeholder="请输入项目描述" />
            </Form.Item>

            <Form.Item
              name="competitionType"
              label="比赛类型"
              rules={[{ required: true, message: '请选择比赛类型' }]}
            >
              <Select placeholder="请选择比赛类型">
                <Option value="互联网+">互联网+</Option>
                <Option value="挑战杯">挑战杯</Option>
                <Option value="创青春">创青春</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="requiredSkills"
              label="所需技能"
              rules={[{ required: true, message: '请输入所需技能' }]}
              help="多个技能用逗号分隔"
            >
              <Input placeholder="React, Python, UI设计" />
            </Form.Item>

            <Form.Item
              name="requiredMembers"
              label="招募人数"
              rules={[{ required: true, message: '请输入招募人数' }]}
            >
              <InputNumber min={1} max={20} placeholder="请输入招募人数" />
            </Form.Item>

            <Form.Item
              name="captainAwardLevel"
              label="队长奖项等级"
              rules={[{ required: true, message: '请选择奖项等级' }]}
            >
              <Select placeholder="请选择奖项等级">
                <Option value="国家级">国家级</Option>
                <Option value="省部级">省部级</Option>
                <Option value="校级">校级</Option>
                <Option value="无">无</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" style={{ borderRadius: 8 }}>
                  保存修改
                </Button>
                <Button onClick={() => setIsEditModalOpen(false)}>
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
