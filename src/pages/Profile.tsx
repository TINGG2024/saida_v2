import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, Button, Space, Typography, App as AntdApp, Divider, Modal, Tag, Avatar, Popconfirm } from 'antd';
import { UserOutlined, CameraOutlined, SwitcherOutlined } from '@ant-design/icons';
import { useApp } from '../context/AppContext';
import SeekerFormModal from '../components/SeekerFormModal';
import { hashPassword, verifyPassword } from '../utils/crypto';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const cardStyle: React.CSSProperties = {
  borderRadius: 16,
  border: '1px solid rgba(148, 163, 184, 0.15)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  background: 'rgba(30, 41, 59, 0.85)',
};

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
    <span style={{ width: 4, height: 22, borderRadius: 2, background: 'linear-gradient(180deg, #3B82F6, #60A5FA)' }} />
    <span style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>
      {children}
    </span>
  </div>
);

const getAwardTagStyle = (level: string): React.CSSProperties => {
  switch (level) {
    case '国家级':
      return { background: 'rgba(234, 179, 8, 0.15)', color: '#92400E', fontWeight: 600, border: 'none', borderRadius: 8 };
    case '省部级':
      return { background: 'rgba(139, 92, 246, 0.15)', color: '#7C3AED', fontWeight: 600, border: 'none', borderRadius: 8 };
    default:
      return { background: 'rgba(255, 255, 255, 0.03)', color: '#94A3B8', fontWeight: 600, border: 'none', borderRadius: 8 };
  }
};

const getRoleTagStyle = (role: string): React.CSSProperties => {
  switch (role) {
    case '队长':
      return { background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', fontWeight: 600, border: 'none', borderRadius: 8 };
    case '队员':
      return { background: 'rgba(34, 197, 94, 0.15)', color: '#059669', fontWeight: 600, border: 'none', borderRadius: 8 };
    default:
      return { background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', fontWeight: 600, border: 'none', borderRadius: 8 };
  }
};

export default function Profile() {
  const { currentUser, updateUser, selectRole } = useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSeekerModalOpen, setIsSeekerModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { message: antdMessage } = AntdApp.useApp();

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .profile-page .ant-input-disabled,
      .profile-page .ant-select-disabled .ant-select-selector,
      .profile-page .ant-input-textarea-disabled,
      .profile-page .ant-textarea-disabled,
      .profile-page .ant-textarea-disabled > textarea {
        color: #FFFFFF !important;
        opacity: 1 !important;
        background-color: rgba(15, 23, 42, 0.8) !important;
        border-color: rgba(148, 163, 184, 0.3) !important;
        -webkit-text-fill-color: #FFFFFF !important;
        caret-color: #FFFFFF !important;
      }
      .profile-page .ant-select-disabled .ant-select-arrow {
        color: #FFFFFF !important;
        opacity: 0.6 !important;
      }
      .profile-page .ant-select-disabled .ant-select-selection-item {
        color: #FFFFFF !important;
      }
      .profile-page .ant-input-disabled::placeholder,
      .profile-page .ant-textarea-disabled::placeholder,
      .profile-page .ant-textarea-disabled > textarea::placeholder {
        color: rgba(255, 255, 255, 0.5) !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!currentUser) return null;

  const initialValues = {
    nickname: currentUser.nickname,
    major: currentUser.major || '',
    role: currentUser.role,
    bio: currentUser.bio,
    skills: currentUser.skills.join(', '),
    experiences: currentUser.experiences.join(', ')
  };

  const handleSave = (values: any) => {
    const skills = values.skills
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s);

    const experiences = values.experiences
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s);

    const updatedUser = {
      ...currentUser,
      nickname: values.nickname,
      major: values.major || undefined,
      role: values.role,
      bio: values.bio,
      skills,
      experiences,
      awards: values.awards || currentUser.awards,
      isNewUser: false
    };

    updateUser(updatedUser);
    setIsEditing(false);
    if (values.major) {
      antdMessage.success('保存成功！专业信息将作为技能标签参与匹配');
    } else {
      antdMessage.success('保存成功！');
    }
  };

  const handlePasswordSubmit = async (values: any) => {
    const isValid = await verifyPassword(values.oldPassword, currentUser.password);
    if (!isValid) {
      antdMessage.error('原密码不正确！');
      return;
    }

    const hashedNewPassword = await hashPassword(values.newPassword);
    updateUser({ ...currentUser, password: hashedNewPassword });
    setIsPasswordModalOpen(false);
    passwordForm.resetFields();
    antdMessage.success('密码修改成功！');
  };

  const handleRoleSwitch = () => {
    const newRole = currentUser.role === '队长' ? '队员' : '队长';
    const updatedUser = { ...currentUser, role: newRole as '队长' | '队员' };
    updateUser(updatedUser);
    selectRole(newRole);
    antdMessage.success(`已切换为${newRole}身份！`);
    navigate('/', { replace: true });
  };

  const handleAvatarClick = () => {
    setIsAvatarModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = () => {
    if (previewAvatar) {
      updateUser({ ...currentUser, avatar: previewAvatar });
      setIsAvatarModalOpen(false);
      setPreviewAvatar(null);
      antdMessage.success('头像更新成功！');
    }
  };

  return (
    <div className="profile-page min-h-screen py-8">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>

        {/* ========== Gradient Banner + Avatar ========== */}
        <div style={{
          height: 160,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #0F2557, #1D4ED8, #3B82F6)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 48,
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute',
            top: -30,
            right: -20,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -20,
            left: '15%',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }} />
        </div>

        {/* Avatar overlapping banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginTop: -112,
          marginBottom: 16,
          position: 'relative',
          zIndex: 2,
          padding: '0 32px',
        }}>
          <div className="relative">
            <Avatar 
              size={96} 
              src={currentUser.avatar}
              icon={<UserOutlined />}
              style={{
                backgroundColor: '#3B82F6',
                border: '4px solid #FFFFFF',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            />
            <Button
              icon={<CameraOutlined />}
              onClick={handleAvatarClick}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#3B82F6',
                color: '#fff',
                border: '2px solid #fff',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
              }}
              size="small"
            />
          </div>
          <Space style={{ marginTop: 64 }}>
            <Popconfirm
              title={`确定要切换为${currentUser.role === '队长' ? '队员' : '队长'}吗？`}
              description="切换后将跳转到对应工作台"
              onConfirm={handleRoleSwitch}
              okText="确定切换"
              cancelText="取消"
            >
              <Button 
                icon={<SwitcherOutlined />} 
                style={{ 
                  borderRadius: 10,
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#C4B5FD',
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139, 92, 246, 0.25)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139, 92, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139, 92, 246, 0.15)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139, 92, 246, 0.3)';
                }}
              >
                切换角色
              </Button>
            </Popconfirm>
            <Button type="primary" onClick={() => setIsEditing(!isEditing)} style={{ borderRadius: 8, fontWeight: 600 }}>
              {isEditing ? '取消编辑' : '编辑资料'}
            </Button>
          </Space>
        </div>

        {/* ========== Info Card ========== */}
        <Card style={{ ...cardStyle, padding: '32px', marginTop: -8 }}>
          <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
            <div>
              <Title level={2} style={{ margin: 0, color: '#F1F5F9', fontWeight: 700 }}>{currentUser.nickname}</Title>
              <Space className="mt-2">
                <Tag style={getRoleTagStyle(currentUser.role)} className="text-sm">
                  {currentUser.role}
                </Tag>
                {currentUser.major && (
                  <Tag style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', fontWeight: 600, borderRadius: 8, border: 'none' }} className="text-sm">{currentUser.major}</Tag>
                )}
              </Space>
            </div>
          </div>

          {currentUser.bio && (
            <Paragraph style={{ color: '#94A3B8', lineHeight: 1.7, marginBottom: 24, fontSize: 14 }}>
              {currentUser.bio}
            </Paragraph>
          )}

          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={handleSave}
          >
            <Form.Item label="账号（用户名）" labelCol={{ style: { color: '#F1F5F9', fontWeight: 500 } }}>
              <Input 
                value={currentUser.username} 
                disabled 
                placeholder="账号不可修改"
                style={{ borderRadius: 8, background: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(148, 163, 184, 0.3)', color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF' }}
              />
              <Text type="secondary" style={{ fontSize: 12, color: '#E2E8F0' }}>账号为唯一标识，不可修改</Text>
            </Form.Item>

            <Form.Item
              name="nickname"
              label="昵称"
              rules={[{ required: true, message: '请输入昵称' }]}
              labelCol={{ style: { color: '#F1F5F9', fontWeight: 500 } }}
              disabled={!isEditing}
            >
              <Input placeholder="请输入昵称" style={{ borderRadius: 8, background: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(148, 163, 184, 0.3)', color: '#FFFFFF' }} />
            </Form.Item>

            <Form.Item
              name="major"
              label="专业/领域"
              help="可选，专业信息将作为技能标签参与匹配"
              labelCol={{ style: { color: '#F1F5F9', fontWeight: 500 } }}
              disabled={!isEditing}
            >
              <Input placeholder="请输入专业/领域，如：计算机科学" style={{ borderRadius: 8, background: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(148, 163, 184, 0.3)', color: '#FFFFFF' }} />
            </Form.Item>

            <Form.Item
              name="role"
              label="角色"
              rules={[{ required: true, message: '请选择角色' }]}
              labelCol={{ style: { color: '#F1F5F9', fontWeight: 500 } }}
              disabled={!isEditing}
            >
              <Select placeholder="请选择角色" style={{ borderRadius: 8, background: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(148, 163, 184, 0.3)', color: '#FFFFFF' }}>
                <Option value="队长" style={{ color: '#1E293B' }}>队长</Option>
                <Option value="队员" style={{ color: '#1E293B' }}>队员</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="bio"
              label="个人简介"
              labelCol={{ style: { color: '#F1F5F9', fontWeight: 500 } }}
              disabled={!isEditing}
            >
              <TextArea rows={3} placeholder="请输入个人简介" style={{ borderRadius: 8, background: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(148, 163, 184, 0.3)', color: '#FFFFFF' }} />
            </Form.Item>

            <Form.Item
              name="skills"
              label="技能"
              help="多个技能用逗号分隔，如：React, Python, UI设计"
              labelCol={{ style: { color: '#F1F5F9', fontWeight: 500 } }}
              disabled={!isEditing}
            >
              <Input placeholder="React, Python, UI设计" style={{ borderRadius: 8, background: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(148, 163, 184, 0.3)', color: '#FFFFFF' }} />
            </Form.Item>

            <Divider />

            {/* Awards section */}
            <div>
              <SectionHeading>奖项</SectionHeading>
              <Form.List name="awards" initialValue={currentUser.awards}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={[name, 'competition']}
                          rules={[{ required: true, message: '请输入比赛名称' }]}
                          disabled={!isEditing}
                        >
                          <Input placeholder="比赛名称" style={{ width: 200, borderRadius: 8, background: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(148, 163, 184, 0.3)', color: '#FFFFFF' }} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'level']}
                          rules={[{ required: true, message: '请选择奖项等级' }]}
                          disabled={!isEditing}
                        >
                          <Select placeholder="奖项等级" style={{ width: 150, borderRadius: 8, background: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(148, 163, 184, 0.3)', color: '#FFFFFF' }}>
                            <Option value="国家级">国家级</Option>
                            <Option value="省部级">省部级</Option>
                            <Option value="校级">校级</Option>
                          </Select>
                        </Form.Item>
                        {isEditing && (
                          <Button type="text" danger onClick={() => remove(name)}>
                            删除
                          </Button>
                        )}
                      </Space>
                    ))}
                    {isEditing && (
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block icon={<span>+</span>} style={{ borderRadius: 8 }}>
                          添加奖项
                        </Button>
                      </Form.Item>
                    )}
                  </>
                )}
              </Form.List>

              {/* Display awards as tags when not editing */}
              {!isEditing && currentUser.awards && currentUser.awards.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentUser.awards.map((award, idx) => (
                    <Tag key={idx} style={getAwardTagStyle(award.level)}>
                      {award.competition} - {award.level}
                    </Tag>
                  ))}
                </div>
              )}
            </div>

            <Divider />

            {/* Experiences section */}
            <div>
              <SectionHeading>参赛经历</SectionHeading>
              <Form.Item
                name="experiences"
                help="多个经历用逗号分隔"
                disabled={!isEditing}
              >
                <TextArea rows={3} placeholder="2024挑战杯省赛一等奖, 2023互联网+校赛银奖" style={{ borderRadius: 8, background: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(148, 163, 184, 0.3)', color: '#FFFFFF' }} />
              </Form.Item>
            </div>

            {/* Display skills as tags when not editing */}
            {!isEditing && currentUser.skills.length > 0 && (
              <div className="mb-4">
                <SectionHeading>技能标签</SectionHeading>
                <div className="flex flex-wrap gap-2">
                  {currentUser.skills.map(skill => (
                    <Tag key={skill} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', borderRadius: 8, fontWeight: 600, border: 'none' }}>
                      {skill}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {isEditing && (
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" style={{ borderRadius: 8, fontWeight: 600 }}>保存修改</Button>
                  <Button onClick={() => {
                    setIsEditing(false);
                    form.resetFields();
                  }}>
                    取消
                  </Button>
                </Space>
              </Form.Item>
            )}
          </Form>
        </Card>

        {/* ========== Seeker Requirement Card ========== */}
        <Card style={{ ...cardStyle, marginTop: 24 }}>
          <SectionHeading>寻队需求</SectionHeading>
          {currentUser.seekerReq ? (
            <div style={{ marginBottom: '16px' }}>
              <Space style={{ marginBottom: '8px' }}>
                <Tag style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', fontWeight: 600, borderRadius: 8, border: 'none' }}>{currentUser.seekerReq.targetCompetition}</Tag>
                {currentUser.seekerReq.active && <Tag style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#059669', fontWeight: 600, borderRadius: 8, border: 'none' }}>生效中</Tag>}
                {!currentUser.seekerReq.active && <Tag style={{ background: 'rgba(255, 255, 255, 0.03)', color: '#94A3B8', borderRadius: 8, border: 'none' }}>已暂停</Tag>}
              </Space>
              <div style={{ marginBottom: '8px' }}>
                <Text type="secondary">期望技能：</Text>
                {currentUser.seekerReq.expectSkills.map(skill => (
                  <Tag key={skill} style={{ marginRight: '4px', borderRadius: 8, background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', fontWeight: 600, border: 'none' }}>{skill}</Tag>
                ))}
              </div>
              {currentUser.seekerReq.description && (
                <div>
                  <Text type="secondary">说明：{currentUser.seekerReq.description}</Text>
                </div>
              )}
              <Button type="link" onClick={() => setIsSeekerModalOpen(true)}>
                编辑寻队需求
              </Button>
            </div>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              <Text type="secondary">暂无寻队需求</Text>
              <br />
              <Button type="link" onClick={() => setIsSeekerModalOpen(true)}>
                创建寻队需求
              </Button>
            </div>
          )}
        </Card>

        {/* ========== Password Card ========== */}
        <Card style={{ ...cardStyle, marginTop: 24, marginBottom: 24 }}>
          <SectionHeading>账号安全</SectionHeading>
          <Button onClick={() => setIsPasswordModalOpen(true)} style={{ borderRadius: 8 }}>
            修改密码
          </Button>
        </Card>

        <SeekerFormModal
          open={isSeekerModalOpen}
          onCancel={() => setIsSeekerModalOpen(false)}
          onSuccess={() => setIsSeekerModalOpen(false)}
        />

        <Modal
          title="修改密码"
          open={isPasswordModalOpen}
          onCancel={() => setIsPasswordModalOpen(false)}
          footer={null}
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordSubmit}
          >
            <Form.Item
              name="oldPassword"
              label="原密码"
              rules={[
                { required: true, message: '请输入原密码' },
                { min: 6, message: '密码至少需要 6 个字符' }
              ]}
            >
              <Input.Password placeholder="请输入原密码" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少需要 6 个字符' }
              ]}
            >
              <Input.Password placeholder="请输入新密码" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请再次输入新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的新密码不一致！'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="请再次输入新密码" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" style={{ borderRadius: 8 }}>确认修改</Button>
                <Button onClick={() => setIsPasswordModalOpen(false)}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="更换头像"
          open={isAvatarModalOpen}
          onCancel={() => {
            setIsAvatarModalOpen(false);
            setPreviewAvatar(null);
          }}
          footer={null}
        >
          <div className="text-center">
            <div className="mb-4">
              <Avatar 
                size={120} 
                src={previewAvatar || currentUser.avatar}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#3B82F6', boxShadow: '0 4px 16px rgba(59,130,246,0.2)' }}
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button 
              type="primary" 
              onClick={() => fileInputRef.current?.click()}
              className="mb-4"
              style={{ borderRadius: 8 }}
            >
              选择图片
            </Button>
            <div>
              <Text type="secondary" className="text-sm">支持 JPG、PNG 格式，建议尺寸 200x200</Text>
            </div>
            {previewAvatar && (
              <div className="mt-4">
                <Space>
                  <Button type="primary" onClick={handleSaveAvatar} style={{ borderRadius: 8 }}>保存头像</Button>
                  <Button onClick={() => setPreviewAvatar(null)}>取消预览</Button>
                </Space>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
