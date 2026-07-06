import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Input, Avatar, Typography, Empty, Image, Tag, message as antdMessage
} from 'antd';
import { ArrowLeftOutlined, SendOutlined, PictureOutlined, WarningOutlined } from '@ant-design/icons';
import { useApp } from '../context/AppContext';
import { Message as MessageType } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const myBubbleStyle: React.CSSProperties = {
  background: '#3B82F6',
  color: '#FFFFFF',
  borderRadius: '14px 14px 4px 14px',
  padding: '12px 18px',
  maxWidth: '100%',
  wordBreak: 'break-word',
  boxShadow: '0 2px 8px rgba(59,130,246,0.2)',
};

const otherBubbleStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  color: '#F1F5F9',
  border: '1px solid rgba(148, 163, 184, 0.08)',
  borderRadius: '14px 14px 14px 4px',
  padding: '12px 18px',
  maxWidth: '100%',
  wordBreak: 'break-word',
};

export default function ChatPage() {
  const { projectId, userId } = useParams<{ projectId: string; userId: string }>();
  const navigate = useNavigate();
  const { currentUser, users, messages, sendMessage, projects } = useApp();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 查找对话用户
  const chatUser = users.find(u => u.id === userId);
  
  // 查找当前项目
  const project = projects.find(p => p.id === projectId);
  
  // 检查是否组队成功
  const isTeamFormed = project?.status === '已组队';

  if (!currentUser || !chatUser) {
    return (
      <div style={{ 
        margin: '16px', 
        borderRadius: 14, 
        border: '1px solid rgba(148, 163, 184, 0.08)', 
        background: 'rgba(255, 255, 255, 0.05)',
        padding: 40,
        textAlign: 'center',
      }}>
        <Empty description="用户不存在" />
      </div>
    );
  }

  // 筛选当前用户和chatUser之间的消息
  const chatMessages = messages
    .filter(m => 
      (m.fromUserId === currentUser.id && m.toUserId === userId) || 
      (m.fromUserId === userId && m.toUserId === currentUser.id)
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 发送文本消息
  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    const messageData: Omit<MessageType, 'id' | 'timestamp' | 'status'> = {
      type: 'chat',
      fromUserId: currentUser.id,
      toUserId: userId,
      content: newMessage,
      subType: 'text',
      projectId: projectId || ''
    };
    
    sendMessage(messageData);
    setNewMessage('');
  };

  // 处理图片选择和发送
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      antdMessage.error('请选择图片文件！');
      return;
    }

    // 验证文件大小 (限制 5MB)
    if (file.size > 5 * 1024 * 1024) {
      antdMessage.error('图片大小不能超过 5MB！');
      return;
    }

    // 使用FileReader将图片转换为base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      
      // 发送图片消息
      const messageData: Omit<MessageType, 'id' | 'timestamp' | 'status'> = {
        type: 'chat',
        fromUserId: currentUser.id,
        toUserId: userId,
        content: '[图片]',
        subType: 'image',
        imageUrl: imageUrl,
        projectId: projectId || ''
      };

      sendMessage(messageData);
      antdMessage.success('图片已发送');
      
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      antdMessage.error('图片读取失败，请重试！');
    };

    reader.readAsDataURL(file);
  };

  return (
    <div style={{ 
      margin: '16px', 
      height: 'calc(100vh - 100px)',
      borderRadius: 14,
      border: '1px solid rgba(148, 163, 184, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.05)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 24px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        flexShrink: 0,
      }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/messages')}
          style={{ marginRight: 4, color: '#94A3B8' }}
        />
        <Avatar style={{ backgroundColor: '#3B82F6', flexShrink: 0 }}>
          {chatUser.nickname.charAt(0)}
        </Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text strong style={{ fontSize: 16, color: '#F1F5F9' }}>{chatUser.nickname}</Text>
            <Tag style={{ 
              borderRadius: 6, 
              border: 'none',
              fontWeight: 500,
              ...(isTeamFormed 
                ? { background: 'rgba(34, 197, 94, 0.15)', color: '#059669' } 
                : { background: 'rgba(234, 179, 8, 0.15)', color: '#D97706' }
              )
            }}>
              {isTeamFormed ? '已组队' : '招募中'}
            </Tag>
          </div>
          {project && (
            <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>
              项目：{project.title}
            </div>
          )}
        </div>
      </div>

      {/* 聊天内容区域 */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto', 
        padding: '20px 24px',
        background: 'rgba(255, 255, 255, 0.03)',
      }}>
        {chatMessages.length === 0 ? (
          <Empty 
            description={
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, marginBottom: 8, color: '#F1F5F9', fontWeight: 500 }}>
                  暂无消息
                </div>
                <div style={{ fontSize: 13, color: '#64748B' }}>
                  开始你们的对话吧！
                </div>
              </div>
            }
            style={{ margin: '60px 0' }}
          />
        ) : (
          <div>
            {chatMessages.map((msg) => {
              const isMe = msg.fromUserId === currentUser.id;
              const isImage = msg.subType === 'image';
              
              return (
                <div key={msg.id} style={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  marginBottom: 16,
                  maxWidth: '80%',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  ...(isMe ? { marginLeft: 'auto' } : {}),
                }}>
                  {!isMe && (
                    <Avatar 
                      style={{ marginRight: 10, backgroundColor: '#3B82F6', flexShrink: 0, marginTop: 2 }}>
                      {chatUser.nickname.charAt(0)}
                    </Avatar>
                  )}
                  <div style={isMe ? myBubbleStyle : otherBubbleStyle}>
                    {isImage && msg.imageUrl ? (
                      <div>
                        <Image
                          src={msg.imageUrl}
                          alt="图片消息"
                          width={200}
                          style={{ borderRadius: 10, display: 'block' }}
                          preview={{ mask: '点击查看大图' }}
                        />
                        <div style={{ fontSize: 11, color: isMe ? 'rgba(255,255,255,0.75)' : '#94A3B8', marginTop: 6, textAlign: 'right' }}>
                          {new Date(msg.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 14, lineHeight: 1.6 }}>{msg.content}</div>
                        <div style={{ fontSize: 11, color: isMe ? 'rgba(255,255,255,0.75)' : '#94A3B8', marginTop: 6, textAlign: 'right' }}>
                          {new Date(msg.timestamp).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                  {isMe && (
                    <Avatar style={{ marginLeft: 10, backgroundColor: '#3B82F6', flexShrink: 0, marginTop: 2 }}>
                      {currentUser.nickname.charAt(0)}
                    </Avatar>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 组队状态提示 */}
      {!isTeamFormed && (
        <div style={{ 
          margin: '0 24px 12px',
          padding: '12px 16px', 
          background: 'rgba(234, 179, 8, 0.15)', 
          borderRadius: 10, 
          border: '1px solid rgba(234, 179, 8, 0.3)', 
          fontSize: 13, 
          color: '#92400E',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <WarningOutlined style={{ color: '#D97706', fontSize: 16, flexShrink: 0 }} />
          <span>组队成功后可以发送图片消息。目前只能发送文本消息。</span>
        </div>
      )}

      {/* 输入区域 */}
      <div style={{ 
        display: 'flex', 
        gap: 10, 
        alignItems: 'flex-end',
        padding: '16px 24px',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)',
        background: 'rgba(255, 255, 255, 0.05)',
        flexShrink: 0,
      }}>
        {/* 隐藏的文件输入 */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />
        
        {/* 图片按钮 - 只有组队成功才显示 */}
        {isTeamFormed && (
          <Button
            icon={<PictureOutlined />}
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              height: 42, 
              width: 42, 
              borderRadius: 10, 
              border: '1px solid rgba(148, 163, 184, 0.08)',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="发送图片"
          />
        )}

        <TextArea
          rows={1}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isTeamFormed ? "输入消息，按 Enter 发送..." : "请先完成组队才能自由沟通..."}
          onPressEnter={handleSend}
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{ 
            resize: 'none', 
            flex: 1, 
            borderRadius: 10, 
            borderColor: 'rgba(148, 163, 184, 0.1)',
            fontSize: 14,
          }}
        />
        <Button 
          type="primary" 
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={!newMessage.trim()}
          style={{ 
            height: 42, 
            borderRadius: 8, 
            background: '#3B82F6', 
            border: 'none',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          发送
        </Button>
      </div>
    </div>
  );
}
