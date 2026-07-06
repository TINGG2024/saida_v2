import React from 'react';
import { useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { Form, Input, Button, Typography, App as AntdApp } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  IdcardOutlined,
  RocketOutlined,
  BulbOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import ParticleBackground from '../components/ParticleBackground';
import { useApp } from '../context/AppContext';

const { Text } = Typography;

const inputStyle: React.CSSProperties = {
  height: 48,
  borderRadius: 0,
  fontSize: 14,
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(255,255,255,0.25)',
  color: '#ffffff',
  outline: 'none',
  boxShadow: 'none',
  transition: 'border-color 0.3s ease',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated } = useApp();
  const [loading, setLoading] = React.useState(false);
  const { message: antdMessage } = AntdApp.useApp();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onFinish = async (values: {
    phone: string;
    nickname: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      antdMessage.error('两次输入的密码不一致！');
      return;
    }

    setLoading(true);
    try {
      const user = await register(values.phone, values.nickname, values.password);
      if (user) {
        antdMessage.success('注册成功！请选择您的身份。');
        setTimeout(() => {
          navigate('/select-role', { replace: true });
        }, 1500);
      } else {
        antdMessage.error('该账号已被注册！请使用其他账号。');
      }
    } catch (error) {
      antdMessage.error('注册失败，请稍后重试！');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <BulbOutlined />, label: '智能匹配' },
    { icon: <TeamOutlined />, label: '高效组队' },
    { icon: <TrophyOutlined />, label: '竞赛管理' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(135deg, rgba(15,37,87,0.92) 0%, rgba(29,78,216,0.85) 50%, rgba(59,130,246,0.8) 100%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Floating particles */}
      <ParticleBackground />

      {/* Left side - Brand showcase (60%) */}
      <div
        className="register-brand-side"
        style={{
          flex: 1.5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 40px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: 'rgba(59,130,246,0.15)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(59,130,246,0.25)',
                boxShadow: '0 0 30px rgba(59,130,246,0.2)',
              }}
            >
              <RocketOutlined style={{ fontSize: 30, color: '#3B82F6' }} />
            </div>
            <span
              style={{
                fontSize: 52,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: 3,
                textShadow: '0 0 40px rgba(59,130,246,0.4), 0 0 80px rgba(59,130,246,0.2)',
              }}
            >
              赛搭
            </span>
          </div>
          <p
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: 17,
              marginBottom: 56,
              letterSpacing: 2,
              fontWeight: 400,
            }}
          >
            高校竞赛组队智能匹配平台
          </p>

          <div
            style={{
              display: 'flex',
              gap: 36,
              justifyContent: 'center',
            }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 0 24px rgba(59,130,246,0.15)',
                  }}
                >
                  <span style={{ fontSize: 22, color: '#ffffff' }}>{f.icon}</span>
                </div>
                <span
                  style={{
                    color: 'rgba(255,255,255,0.65)',
                    fontSize: 14,
                    fontWeight: 500,
                    letterSpacing: 1,
                  }}
                >
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Register form (40%), NO card container */}
      <div
        className="register-form-side"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 48px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 8 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                letterSpacing: 0.5,
              }}
            >
              创建账号
            </h2>
          </div>
          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 14,
              marginBottom: 36,
            }}
          >
            注册一个新账号开始使用
          </p>

          <Form
            name="register"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="phone"
              label={
                <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500, fontSize: 13 }}>手机号</span>
              }
              rules={[
                { required: true, message: '请输入手机号！' },
                {
                  pattern: /^1[3-9]\d{9}$/,
                  message: '请输入正确的手机号格式！',
                },
              ]}
              help="请输入11位手机号"
            >
              <Input
                prefix={<IdcardOutlined style={{ color: 'rgba(255,255,255,0.4)' }} />}
                placeholder="请输入11位手机号"
                style={inputStyle}
              />
            </Form.Item>

            <Form.Item
              name="nickname"
              label={
                <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500, fontSize: 13 }}>昵称</span>
              }
              rules={[
                { required: true, message: '请输入昵称！' },
                {
                  min: 2,
                  max: 20,
                  message: '昵称长度在 2 到 20 个字符！',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'rgba(255,255,255,0.4)' }} />}
                placeholder="请输入昵称"
                style={inputStyle}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500, fontSize: 13 }}>密码</span>
              }
              rules={[
                { required: true, message: '请输入密码！' },
                { min: 6, message: '密码至少需要 6 个字符！' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.4)' }} />}
                placeholder="请输入密码"
                style={inputStyle}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={
                <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500, fontSize: 13 }}>确认密码</span>
              }
              dependencies={['password']}
              rules={[
                { required: true, message: '请再次输入密码！' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致！'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.4)' }} />}
                placeholder="请再次输入密码"
                style={inputStyle}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                style={{
                  height: 50,
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  background: '#ffffff',
                  color: '#1e3a5f',
                  border: 'none',
                  boxShadow: '0 4px 24px rgba(255,255,255,0.15)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    '0 6px 32px rgba(255,255,255,0.25)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    '0 4px 24px rgba(255,255,255,0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                注册
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
                已有账号？{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#93C5FD',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#BFDBFE';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#93C5FD';
                  }}
                >
                  立即登录
                </Link>
              </Text>
            </div>
          </Form>
        </div>
      </div>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .register-brand-side {
            padding: 40px 20px 24px !important;
          }
          .register-brand-side > div > div:first-child {
            flex-direction: column;
            gap: 8px !important;
          }
          .register-brand-side > div > div:first-child > span {
            font-size: 36px !important;
          }
          .register-brand-side > div > p {
            font-size: 14px !important;
            margin-bottom: 24px !important;
          }
          .register-form-side {
            padding: 20px 24px !important;
          }
          .register-form-side > div {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
