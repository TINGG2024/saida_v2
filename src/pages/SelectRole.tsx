import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { App as AntdApp } from 'antd';
import { TeamOutlined, UserOutlined } from '@ant-design/icons';
import ParticleBackground from '../components/ParticleBackground';
import { useApp } from '../context/AppContext';

export default function SelectRole() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, selectRole } = useApp();
  const { message: antdMessage } = AntdApp.useApp();
  const [hoveredRole, setHoveredRole] = useState<'队长' | '队员' | null>(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSelectRole = (role: '队长' | '队员') => {
    selectRole(role);
    antdMessage.success(`已选择${role}身份，正在进入工作台...`);

    setTimeout(() => {
      navigate('/', { replace: true });
    }, 1000);
  };

  const isHovered = (role: '队长' | '队员') => hoveredRole === role;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        position: 'relative',
        overflow: 'hidden',
        padding: '40px 24px',
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
            'linear-gradient(135deg, rgba(11,17,32,0.92) 0%, rgba(15,37,87,0.85) 50%, rgba(29,78,216,0.8) 100%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Floating particles */}
      <ParticleBackground />

      {/* Centered content */}
      <div
        style={{
          width: '100%',
          maxWidth: 720,
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1
            style={{
              margin: '0 0 16px 0',
              fontSize: 48,
              fontWeight: 800,
              color: '#ffffff',
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
              letterSpacing: 3,
              textShadow: '0 2px 30px rgba(0,0,0,0.5), 0 0 60px rgba(59,130,246,0.15)',
            }}
          >
            选择你的身份
          </h1>
          <p
            style={{
              margin: 0,
              color: 'rgba(255,255,255,0.6)',
              fontSize: 16,
              lineHeight: 1.6,
              letterSpacing: 0.5,
            }}
          >
            请选择你在平台中的主要角色
          </p>
        </div>

        {/* Role selection areas — no card containers */}
        <div
          className="app-select-role-cards"
          style={{
            display: 'flex',
            width: '100%',
            position: 'relative',
          }}
        >
          {/* Captain area */}
          <div
            onClick={() => handleSelectRole('队长')}
            onMouseEnter={() => setHoveredRole('队长')}
            onMouseLeave={() => setHoveredRole(null)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px 32px',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Icon with blue glow circle */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: isHovered('队长')
                  ? 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0.05) 70%)'
                  : 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.02) 70%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 28,
                boxShadow: isHovered('队长')
                  ? '0 0 50px rgba(59,130,246,0.4), 0 0 100px rgba(59,130,246,0.15)'
                  : '0 0 30px rgba(59,130,246,0.15)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <TeamOutlined
                style={{
                  fontSize: 36,
                  color: isHovered('队长') ? '#93c5fd' : '#ffffff',
                  transition: 'color 0.4s ease',
                }}
              />
            </div>
            <h2
              style={{
                margin: '0 0 12px 0',
                fontSize: 26,
                fontWeight: 700,
                color: isHovered('队长') ? '#ffffff' : 'rgba(255,255,255,0.9)',
                transition: 'color 0.4s ease',
                letterSpacing: 1,
              }}
            >
              队长
            </h2>
            <p
              style={{
                margin: 0,
                color: isHovered('队长')
                  ? 'rgba(255,255,255,0.8)'
                  : 'rgba(255,255,255,0.6)',
                fontSize: 15,
                lineHeight: 1.7,
                transition: 'color 0.4s ease',
              }}
            >
              发布竞赛项目，招募优秀队员
            </p>
          </div>

          {/* Vertical divider */}
          <div
            style={{
              width: 1,
              alignSelf: 'stretch',
              background: 'rgba(255,255,255,0.15)',
              flexShrink: 0,
            }}
          />

          {/* Member area */}
          <div
            onClick={() => handleSelectRole('队员')}
            onMouseEnter={() => setHoveredRole('队员')}
            onMouseLeave={() => setHoveredRole(null)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px 32px',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Icon with blue glow circle */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: isHovered('队员')
                  ? 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0.05) 70%)'
                  : 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.02) 70%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 28,
                boxShadow: isHovered('队员')
                  ? '0 0 50px rgba(59,130,246,0.4), 0 0 100px rgba(59,130,246,0.15)'
                  : '0 0 30px rgba(59,130,246,0.15)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <UserOutlined
                style={{
                  fontSize: 36,
                  color: isHovered('队员') ? '#93c5fd' : '#ffffff',
                  transition: 'color 0.4s ease',
                }}
              />
            </div>
            <h2
              style={{
                margin: '0 0 12px 0',
                fontSize: 26,
                fontWeight: 700,
                color: isHovered('队员') ? '#ffffff' : 'rgba(255,255,255,0.9)',
                transition: 'color 0.4s ease',
                letterSpacing: 1,
              }}
            >
              队员
            </h2>
            <p
              style={{
                margin: 0,
                color: isHovered('队员')
                  ? 'rgba(255,255,255,0.8)'
                  : 'rgba(255,255,255,0.6)',
                fontSize: 15,
                lineHeight: 1.7,
                transition: 'color 0.4s ease',
              }}
            >
              浏览团队项目，展示技能实力
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <span
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 14,
              letterSpacing: 2,
            }}
          >
            欢迎加入赛搭
          </span>
        </div>
      </div>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 576px) {
          .app-select-role-cards {
            flex-direction: column !important;
          }
          .app-select-role-cards > div[style*="width: 1"] {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          h1[style] {
            font-size: 36px !important;
          }
        }
      `}</style>
    </div>
  );
}
