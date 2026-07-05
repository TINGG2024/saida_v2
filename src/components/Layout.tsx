import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, Avatar, Space, Typography, Tag } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  MessageOutlined,
  LogoutOutlined,
  ProjectOutlined,
  UserAddOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CrownOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ParticleBackground from './ParticleBackground';

const { Text } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

// NOTE: Project archive toggle (active/archived) is handled inside the workbench
// pages themselves (CaptainWorkbench / MemberWorkbench), NOT in this Layout component.
// Each workbench page manages its own archive filter state.

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, selectedRole, messages, projects, users, logout } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const unreadCount = currentUser ? messages.filter(
    m => m.status === 'pending' && m.toUserId === currentUser.id
  ).length : 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = currentUser?.role === '管理员';
  const userRole = currentUser?.role;
  const canBeCaptain = userRole === '队长' || userRole === 'both';

  // ── Sidebar menu items ──────────────────────────────────────────
  const sidebarMenuItems = isAdmin
    ? [
        {
          key: '/admin',
          icon: <CrownOutlined style={{ color: '#F97316' }} />,
          label: '管理后台',
        },
      ]
    : [
        {
          key: '/',
          icon: <HomeOutlined />,
          label: '首页',
        },
        {
          key: '/profile',
          icon: <SettingOutlined />,
          label: '个人中心',
        },
        {
          key: '/messages',
          icon: <MessageOutlined />,
          label: '消息中心',
          badge: unreadCount,
        },
      ];

  // ── User dropdown items ──────────────────────────────────────────
  const dropdownItems = isAdmin
    ? [
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: '退出登录',
          onClick: handleLogout,
        },
      ]
    : [
        {
          key: 'profile',
          icon: <SettingOutlined />,
          label: '个人中心',
          onClick: () => navigate('/profile'),
        },
        {
          type: 'divider' as const,
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: '退出登录',
          onClick: handleLogout,
        },
      ];

  const getProjectTitle = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.title || '项目';
  };

  const getUserNickname = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.nickname || '用户';
  };

  // ── Breadcrumb generation (kept for logic, display removed) ──────
  const generateBreadcrumbs = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: { title: string; href?: string }[] = [];

    breadcrumbs.push({ title: '首页', href: '/' });

    const titles: Record<string, string> = {
      member: '队员工作台',
      profile: '个人中心',
      messages: '消息中心',
      chat: '聊天',
      admin: '管理后台',
    };

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const prevPart = pathParts[i - 1];

      if (prevPart === 'project') {
        breadcrumbs.push({
          title: getProjectTitle(part),
          href: `/project/${part}`,
        });
      } else if (prevPart === 'user') {
        breadcrumbs.push({
          title: getUserNickname(part),
          href: `/user/${part}`,
        });
      } else if (prevPart === 'chat') {
        const projectId = pathParts[i - 1];
        const userId = pathParts[i];
        breadcrumbs.push({
          title: getProjectTitle(projectId),
          href: `/chat/${projectId}/${userId}`,
        });
        breadcrumbs.push({
          title: getUserNickname(userId),
          href: undefined,
        });
        break;
      } else {
        breadcrumbs.push({
          title: titles[part] || part,
          href: `/${part}`,
        });
      }
    }

    return breadcrumbs;
  };

  // ── Page title for top bar ───────────────────────────────────────
  const getPageTitle = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    const prevPart = pathParts[pathParts.length - 2];

    if (prevPart === 'project') {
      return getProjectTitle(lastPart);
    } else if (prevPart === 'user') {
      return getUserNickname(lastPart);
    } else if (prevPart === 'chat') {
      const userId = pathParts[pathParts.length - 1];
      return getUserNickname(userId);
    }

    const titles: Record<string, string> = {
      member: '队员工作台',
      profile: '个人中心',
      messages: '消息中心',
      chat: '聊天',
      admin: '管理后台',
    };

    return titles[lastPart] || '赛搭';
  };

  // Generate breadcrumbs (logic kept, display removed per spec)
  generateBreadcrumbs();

  if (!currentUser) return null;

  const sidebarWidth = isMobile ? 0 : (collapsed ? 64 : 240);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      backgroundImage: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      {/* Dark gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(11,17,32,0.95) 0%, rgba(15,37,87,0.9) 50%, rgba(29,78,216,0.85) 100%)',
        zIndex: 0,
      }} />

      {/* Particle animation */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <ParticleBackground />
      </div>

      {/* App UI layer */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <div
          className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${isMobile && mobileOpen ? 'mobile-open' : ''}`}
          style={isMobile ? {
            background: 'rgba(11, 17, 32, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(148, 163, 184, 0.1)',
          } : {
            background: 'rgba(11, 17, 32, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(148, 163, 184, 0.1)',
          }}
        >
          {/* Logo Area */}
          <div className="app-sidebar-logo" onClick={() => navigate('/')}>
            <div className="app-sidebar-logo-icon">
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: 16,
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}>
                赛
              </div>
              <span className="app-sidebar-logo-text">赛搭</span>
            </div>
            <span className="app-sidebar-logo-subtitle">高校竞赛组队平台</span>
          </div>

          {/* Navigation */}
          <div className="app-sidebar-nav">
            {sidebarMenuItems.map(item => {
              const isActive = item.key === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.key);
              return (
                <div
                  key={item.key}
                  className={`app-sidebar-menu-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.key)}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="menu-icon">
                    {item.badge ? (
                      <Badge count={item.badge} size="small" offset={[2, -2]}>
                        <MessageOutlined />
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </span>
                  <span className="menu-label">{item.label}</span>
                </div>
              );
            })}
          </div>

          {/* Bottom User Card */}
          <div className="app-sidebar-user-card">
            <div className="user-card-avatar">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt=""
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                currentUser.nickname.charAt(0)
              )}
            </div>
            <div className="user-card-info">
              <span className="user-card-name">{currentUser.nickname}</span>
              <span className="user-card-role">
                {isAdmin ? '管理员' : selectedRole || currentUser.role}
              </span>
            </div>
          </div>

          {/* Collapse toggle (desktop only) */}
          {!isMobile && (
            <div
              className="app-sidebar-toggle"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
          )}
        </div>

        {/* Mobile overlay */}
        <div
          className="app-sidebar-overlay"
          style={{ display: isMobile && mobileOpen ? 'block' : 'none' }}
          onClick={() => setMobileOpen(false)}
        />

        {/* ── Top Bar ──────────────────────────────────────────────── */}
        <div
          className="app-topbar"
          style={{
            left: isMobile ? 0 : sidebarWidth,
            width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
            background: 'rgba(11, 17, 32, 0.6)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          }}
        >
          {/* Hamburger (mobile only) */}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                marginRight: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E2E8F0',
                fontSize: 18,
                borderRadius: 8,
              }}
            >
              <MenuFoldOutlined />
            </button>
          )}

          {/* Page title */}
          <Text className="app-topbar-page-title">
            {getPageTitle()}
          </Text>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Right side: notification + user */}
          <div className="app-topbar-right">
            {/* Notification bell */}
            {!isMobile && (
              <Badge count={unreadCount} size="small">
                <span className="app-topbar-notification">
                  <BellOutlined />
                </span>
              </Badge>
            )}

            {/* User avatar + dropdown */}
            <Dropdown menu={{ items: dropdownItems }} trigger={['click']}>
              <Space
                style={{
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 8,
                  transition: 'all 0.15s',
                }}
                className="hover:bg-[rgba(59,130,246,0.15)]"
              >
                <Avatar
                  style={{
                    backgroundColor: isAdmin ? '#F97316' : '#3B82F6',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                  size={32}
                  src={currentUser.avatar}
                >
                  {currentUser.avatar ? null : currentUser.nickname.charAt(0)}
                </Avatar>
                {!isMobile && (
                  <>
                    <Text style={{ color: '#E2E8F0', fontWeight: 500, fontSize: 13 }}>
                      {currentUser.nickname}
                    </Text>
                    {isAdmin && (
                      <Tag
                        color="orange"
                        style={{ marginRight: 0, fontSize: 11, lineHeight: '18px', padding: '0 5px' }}
                      >
                        管理员
                      </Tag>
                    )}
                  </>
                )}
              </Space>
            </Dropdown>
          </div>
        </div>

        {/* ── Content Area ─────────────────────────────────────────── */}
        <div
          className="app-content"
          style={{
            marginLeft: isMobile ? 0 : sidebarWidth,
            background: 'transparent',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          <div className="app-content-inner fade-up" style={{
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            height: '100%',
            overflowY: 'auto',
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
