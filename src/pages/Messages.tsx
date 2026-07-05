import React, { useEffect, useState } from 'react';
import { Card, Tabs, List, Typography, Tag, Space, Button, Avatar, Badge, App as AntdApp } from 'antd';
import { ArrowLeftOutlined, MessageOutlined, BellOutlined, ClockCircleOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { MessageStatus } from '../types';

const { Title, Text, Paragraph } = Typography;

const cardStyle: React.CSSProperties = {
  borderRadius: 14,
  border: '1px solid rgba(148, 163, 184, 0.08)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  background: 'rgba(255, 255, 255, 0.05)',
};

const getStatusTagStyle = (status: string) => {
  switch (status) {
    case 'pending':
      return { background: 'rgba(234, 179, 8, 0.15)', color: '#D97706', borderRadius: 6, border: 'none' };
    case 'accepted':
      return { background: 'rgba(34, 197, 94, 0.15)', color: '#059669', borderRadius: 6, border: 'none' };
    case 'rejected':
      return { background: 'rgba(220, 38, 38, 0.15)', color: '#DC2626', borderRadius: 6, border: 'none' };
    default:
      return { background: 'rgba(255, 255, 255, 0.03)', color: '#94A3B8', borderRadius: 6, border: 'none' };
  }
};

export default function Messages() {
  const navigate = useNavigate();
  const { 
    currentUser, 
    messages, 
    users, 
    projects, 
    updateMessageStatus, 
    completeTeam,
    sendChatMessage
  } = useApp();
  const { message: antdMessage, notification } = AntdApp.useApp();
  const [expandedReceived, setExpandedReceived] = useState(false);
  const [expandedSent, setExpandedSent] = useState(false);

  if (!currentUser) return null;

  // 进入消息中心时自动标记未读聊天消息为已读（不影响申请/邀请消息）
  useEffect(() => {
    const pendingMessages = messages.filter(
      msg => msg.toUserId === currentUser.id && msg.status === 'pending' && msg.type === 'chat'
    );
    if (pendingMessages.length > 0) {
      pendingMessages.forEach(msg => {
        updateMessageStatus(msg.id, 'read');
      });
    }
  }, [currentUser.id]);

  // 收到的邀请和申请
  const receivedRequests = messages.filter(
    m => m.toUserId === currentUser.id && (m.type === 'invite' || m.type === 'apply')
  );

  // 发出的邀请和申请
  const sentRequests = messages.filter(
    m => m.fromUserId === currentUser.id && (m.type === 'invite' || m.type === 'apply')
  );

  // 聊天消息分组（仅筛选当前用户参与的聊天）
  const chatMessages = messages.filter(m => 
    m.type === 'chat' && 
    (m.fromUserId === currentUser.id || m.toUserId === currentUser.id)
  );
  
  // 按对话分组聊天消息
  const groupChats = () => {
    const groups: Record<string, any[]> = {};
    chatMessages.forEach(msg => {
      const otherUserId = msg.fromUserId === currentUser.id ? msg.toUserId : msg.fromUserId;
      const groupKey = `${msg.projectId}_${otherUserId}`;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(msg);
    });
    return groups;
  };

  const chatGroups = groupChats();

  // 处理接受请求
  const handleAccept = (msg: any) => {
    updateMessageStatus(msg.id, 'accepted');
    
    // 完成组队
    completeTeam(msg.projectId, msg.type === 'invite' ? msg.toUserId : msg.fromUserId);
    
    // 发送通知消息
    const otherUserId = msg.fromUserId === currentUser.id ? msg.toUserId : msg.fromUserId;
    const project = projects.find(p => p.id === msg.projectId);
    sendChatMessage(
      currentUser.id,
      otherUserId,
      msg.projectId,
      `我们已成功组队！欢迎加入项目「${project?.title}」`
    );
    
    // 弹出通知
    notification.success({
      message: '组队成功',
      description: `恭喜！您已成功加入项目「${project?.title}」`,
      duration: 4
    });
    
    antdMessage.success('已接受！组队成功！');
  };

  // 处理拒绝请求
  const handleReject = (msg: any) => {
    updateMessageStatus(msg.id, 'rejected');
    antdMessage.info('已拒绝');
  };

  // 渲染系统消息项
  const renderRequestItem = (msg: any, isReceived: boolean) => {
    const otherUser = users.find(u => u.id === (isReceived ? msg.fromUserId : msg.toUserId));
    const project = projects.find(p => p.id === msg.projectId);
    const isInvite = msg.type === 'invite';
    const borderColor = isInvite ? '#3B82F6' : '#22C55E';
    const iconBg = isInvite ? 'rgba(59, 130, 246, 0.15)' : 'rgba(34, 197, 94, 0.2)';
    const iconColor = isInvite ? '#3B82F6' : '#22C55E';
    
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          border: '1px solid rgba(148, 163, 184, 0.08)',
          borderLeft: `4px solid ${borderColor}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {isInvite 
              ? <TeamOutlined style={{ fontSize: 20, color: iconColor }} />
              : <UserAddOutlined style={{ fontSize: 20, color: iconColor }} />
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <Text strong style={{ color: '#F1F5F9', fontSize: 15 }}>
                {isReceived ? otherUser?.nickname || '未知用户' : '你'}
              </Text>
              <Tag style={{ 
                background: isInvite ? 'rgba(59, 130, 246, 0.15)' : 'rgba(34, 197, 94, 0.2)',
                color: isInvite ? '#3B82F6' : '#22C55E', 
                borderRadius: 6, 
                border: 'none',
                fontWeight: 500,
              }}>
                {isInvite ? '邀请' : '申请'}
              </Tag>
              {msg.status === 'pending' && <Tag style={getStatusTagStyle('pending')}>待处理</Tag>}
              {msg.status === 'accepted' && <Tag style={getStatusTagStyle('accepted')}>已接受</Tag>}
              {msg.status === 'rejected' && <Tag style={getStatusTagStyle('rejected')}>已拒绝</Tag>}
            </div>
            <div style={{ fontSize: 14, color: '#F1F5F9', lineHeight: 1.6, marginBottom: 4 }}>
              {isReceived 
                ? msg.content 
                : msg.status !== 'pending'
                  ? (isInvite 
                      ? msg.status === 'accepted' 
                        ? `${otherUser?.nickname || '未知用户'} 已接受你的邀请`
                        : `${otherUser?.nickname || '未知用户'} 已拒绝你的邀请`
                      : msg.status === 'accepted'
                        ? `你的申请已被 ${otherUser?.nickname || '未知用户'} 接受`
                        : `你的申请已被 ${otherUser?.nickname || '未知用户'} 拒绝`)
                  : (isInvite 
                      ? `邀请 ${otherUser?.nickname || '未知用户'} 加入项目「${project?.title}」` 
                      : `申请加入 ${otherUser?.nickname || '未知用户'} 的项目「${project?.title}」`)}
            </div>
            {project && (
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>
                项目：{project.title}
              </div>
            )}
            <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ClockCircleOutlined style={{ fontSize: 12 }} />
              {new Date(msg.timestamp).toLocaleString()}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
            {msg.projectId && (
              <Button type="link" onClick={() => navigate(`/project/${msg.projectId}`)} style={{ color: '#3B82F6' }}>
                查看项目
              </Button>
            )}
            {isReceived && (msg.status === 'pending' || !msg.status) && (
              <>
                <Button 
                  onClick={() => handleAccept(msg)} 
                  size="small"
                  style={{ 
                    borderRadius: 10,
                    background: 'rgba(34, 197, 94, 0.3)',
                    border: '1px solid rgba(34, 197, 94, 0.5)',
                    color: '#22C55E',
                    fontWeight: 600,
                    paddingInline: 16,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(34, 197, 94, 0.4)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(34, 197, 94, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(34, 197, 94, 0.3)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(34, 197, 94, 0.5)';
                  }}
                >
                  接受
                </Button>
                <Button 
                  onClick={() => handleReject(msg)} 
                  size="small"
                  style={{ 
                    borderRadius: 10,
                    background: 'rgba(239, 68, 68, 0.3)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    color: '#EF4444',
                    fontWeight: 600,
                    paddingInline: 16,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.4)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239, 68, 68, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.3)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239, 68, 68, 0.5)';
                  }}
                >
                  拒绝
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染聊天组项
  const renderChatGroupItem = (groupKey: string, msgs: any[]) => {
    const [projectId, otherUserId] = groupKey.split('_');
    const otherUser = users.find(u => u.id === otherUserId);
    const project = projects.find(p => p.id === projectId);
    const lastMsg = msgs[msgs.length - 1];
    
    return (
      <div
        onClick={() => navigate(`/chat/${projectId}/${otherUserId}`)}
        style={{ 
          cursor: 'pointer', 
          padding: '14px 16px',
          borderRadius: 12,
          background: 'transparent',
          marginBottom: 4,
          transition: 'background 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(59, 130, 246, 0.15)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <Avatar 
          style={{ 
            backgroundColor: '#3B82F6', 
            borderRadius: '50%',
            flexShrink: 0,
          }} 
          size={48}
        >
          {otherUser?.nickname?.charAt(0) || '?'}
        </Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text strong style={{ color: '#F1F5F9', fontSize: 15 }}>{otherUser?.nickname || '未知用户'}</Text>
            {project && <Tag style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', borderRadius: 6, border: 'none', fontSize: 12 }}>{project.title}</Tag>}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}>
            <Paragraph 
              ellipsis={{ rows: 1 }} 
              style={{ 
                marginBottom: 0, 
                color: '#94A3B8', 
                fontSize: 13,
                flex: 1,
              }}
            >
              {lastMsg.subType === 'image' ? '[图片]' : lastMsg.content}
            </Paragraph>
            <Text style={{ fontSize: 12, color: '#64748B', flexShrink: 0 }}>
              {new Date(lastMsg.timestamp).toLocaleString()}
            </Text>
          </div>
        </div>
      </div>
    );
  };

  const tabItems = [
    {
      key: 'system',
      label: (
        <Space>
          <BellOutlined />
          <span>系统消息</span>
          {receivedRequests.filter(r => r.status === 'pending').length > 0 && (
            <Badge count={receivedRequests.filter(r => r.status === 'pending').length} />
          )}
        </Space>
      ),
      children: (
        <div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <Title level={5} style={{ marginTop: 0, marginBottom: 0, color: '#F1F5F9', fontWeight: 600 }}>收到的请求</Title>
              {receivedRequests.filter(r => r.status !== 'pending').length > 0 && (
                <Button 
                  type="text" 
                  size="small"
                  onClick={() => setExpandedReceived(!expandedReceived)}
                  style={{ color: '#3B82F6', padding: 0 }}
                >
                  {expandedReceived ? '收起' : `展开 (${receivedRequests.filter(r => r.status !== 'pending').length})`}
                </Button>
              )}
            </div>
            {receivedRequests.filter(r => r.status === 'pending').length > 0 ? (
              receivedRequests.filter(r => r.status === 'pending').map((item) => <div key={`received-${item.id}`}>{renderRequestItem(item, true)}</div>)
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#64748B', fontSize: 14 }}>暂无待处理的请求</div>
            )}
            {expandedReceived && receivedRequests.filter(r => r.status !== 'pending').length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                {receivedRequests.filter(r => r.status !== 'pending').map((item) => <div key={`received-${item.id}`}>{renderRequestItem(item, true)}</div>)}
              </div>
            )}
          </div>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <Title level={5} style={{ marginBottom: 0, marginTop: 0, color: '#F1F5F9', fontWeight: 600 }}>发出的请求</Title>
              {sentRequests.filter(r => r.status !== 'pending').length > 0 && (
                <Button 
                  type="text" 
                  size="small"
                  onClick={() => setExpandedSent(!expandedSent)}
                  style={{ color: '#3B82F6', padding: 0 }}
                >
                  {expandedSent ? '收起' : `展开 (${sentRequests.filter(r => r.status !== 'pending').length})`}
                </Button>
              )}
            </div>
            {sentRequests.filter(r => r.status === 'pending').length > 0 ? (
              sentRequests.filter(r => r.status === 'pending').map((item) => <div key={`sent-${item.id}`}>{renderRequestItem(item, false)}</div>)
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#64748B', fontSize: 14 }}>暂无待处理的请求</div>
            )}
            {expandedSent && sentRequests.filter(r => r.status !== 'pending').length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                {sentRequests.filter(r => r.status !== 'pending').map((item) => <div key={`sent-${item.id}`}>{renderRequestItem(item, false)}</div>)}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'chat',
      label: (
        <Space>
          <MessageOutlined />
          <span>聊天消息</span>
          {chatMessages.filter(m => m.toUserId === currentUser.id && m.status === 'pending').length > 0 && (
            <Badge count={chatMessages.filter(m => m.toUserId === currentUser.id && m.status === 'pending').length} />
          )}
        </Space>
      ),
      children: (
        <div>
          {Object.keys(chatGroups).length > 0 ? (
            Object.entries(chatGroups).map(([key, msgs]) => <div key={`chat-${key}`}>{renderChatGroupItem(key, msgs)}</div>)
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <MessageOutlined style={{ fontSize: 48, color: 'rgba(148, 163, 184, 0.3)', marginBottom: 16, display: 'block' }} />
              <div style={{ color: '#64748B', fontSize: 15, marginBottom: 8 }}>暂无聊天记录</div>
              <div style={{ color: '#64748B', fontSize: 13 }}>组队成功后可以开始聊天</div>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <Card style={cardStyle} variant="outlined">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            style={{ marginRight: 12, color: '#94A3B8' }}
          />
          <div>
            <Title level={3} style={{ marginBottom: 0, color: '#F1F5F9', fontWeight: 700 }}>消息中心</Title>
            <Text style={{ color: '#64748B', fontSize: 13 }}>管理系统通知与聊天消息</Text>
          </div>
        </div>
        <Tabs 
          items={tabItems} 
          style={{ marginTop: 8 }}
        />
      </Card>
    </div>
  );
}
