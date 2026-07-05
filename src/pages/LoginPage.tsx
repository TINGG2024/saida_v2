import React, { useState } from 'react';
import { useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { Form, Input, Button, Typography, App as AntdApp } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  RocketOutlined,
  BulbOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import ParticleBackground from '../components/ParticleBackground';
import { useApp } from '../context/AppContext';

const { Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useApp();
  const [loading, setLoading] = useState(false);
  const { message: antdMessage } = AntdApp.useApp();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onFinish = async (values: { phone: string; password: string }) => {
    setLoading(true);
    try {
      const user = await login(values.phone, values.password);
      if (user) {
        antdMessage.success('登录成功！');
        setTimeout(() => {
          navigate('/select-role', { replace: true });
        }, 500);
      } else {
        antdMessage.error('账号或密码错误！');
      }
    } catch (error) {
      antdMessage.error('登录失败，请稍后重试！');
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
      {/* Dark blue gradient overlay */}
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
        className="login-brand-side"
        style={{
          flex: '0 0 60%',
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
                textShadow:
                  '0 0 40px rgba(59,130,246,0.4), 0 0 80px rgba(59,130,246,0.2)',
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

      {/* Right side - Login form (40%), directly on background */}
      <div
        className="login-form-side"
        style={{
          flex: '0 0 40%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 48px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Heading */}
          <h2
            style={{
              margin: '0 0 8px 0',
              fontSize: 28,
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            }}
          >
            欢迎回来
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 14,
              marginBottom: 40,
            }}
          >
            登录你的账号继续使用
          </p>

          {/* Login form - no card container */}
          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="phone"
              label={
                <span
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 13,
                    fontWeight: 400,
                  }}
                >
                  phone
                </span>
              }
              rules={[
                { required: true, message: '请输入phone！' },
              ]}
              style={{ marginBottom: 28 }}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }} />}
                placeholder="请输入phone"
                style={{
                  height: 44,
                  borderRadius: 0,
                  fontSize: 14,
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  boxShadow: 'none',
                  paddingLeft: 36,
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 13,
                    fontWeight: 400,
                  }}
                >
                  password
                </span>
              }
              rules={[
                { required: true, message: '请输入password！' },
                { min: 6, message: 'password至少需要 6 个字符！' },
              ]}
              style={{ marginBottom: 32 }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }} />}
                placeholder="请输入password"
                style={{
                  height: 44,
                  borderRadius: 0,
                  fontSize: 14,
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  boxShadow: 'none',
                  paddingLeft: 36,
                }}
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
                  background: '#FFFFFF',
                  color: '#0F2557',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    '0 8px 30px rgba(0,0,0,0.25)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    '0 4px 20px rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          {/* Register link */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
              还没有账号？{' '}
              <Link
                to="/register"
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
                立即注册
              </Link>
            </Text>
          </div>

          {/* Test account hint - subtle, no background box */}
          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
              测试账号：13800138007 / 123456
            </Text>
          </div>
        </div>
      </div>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .login-brand-side {
            flex: 0 0 auto !important;
            padding: 40px 20px 24px !important;
          }
          .login-brand-side > div > div:first-child {
            flex-direction: column;
            gap: 8px !important;
          }
          .login-brand-side > div > div:first-child > span {
            font-size: 36px !important;
          }
          .login-brand-side > div > p {
            font-size: 14px !important;
            margin-bottom: 24px !important;
          }
          .login-form-side {
            flex: 0 0 auto !important;
            padding: 24px 20px 40px !important;
          }
        }
      `}</style>
    </div>
  );
}
