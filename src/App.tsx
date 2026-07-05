import { createClient } from '@supabase/supabase-js';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AppProvider, requestNotificationPermission } from './context/AppContext';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import AnimatedPage from './components/AnimatedPage';
import Home from './pages/Home';
import Admin from './pages/Admin';

import ProjectDetail from './pages/ProjectDetail';
import UserDetail from './pages/UserDetail';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SelectRole from './pages/SelectRole';
import NotFound from './pages/NotFound';
import { useEffect } from 'react';

const supabase = createClient('https://vkuhgdxnblshlvwkmwni.supabase.co', 'sb_publishable_5k9JgLr8RWCVQO_P0tvplA_HU0lLewM');

const theme = {
  token: {
    colorPrimary: '#3B82F6',
    colorInfo: '#3B82F6',
    colorSuccess: '#22C55E',
    colorWarning: '#EAB308',
    colorError: '#EF4444',
    colorBgBase: '#0B1120',
    colorBgContainer: 'rgba(15, 23, 42, 0.6)',
    colorBorder: 'rgba(148, 163, 184, 0.15)',
    colorBorderSecondary: 'rgba(148, 163, 184, 0.08)',
    colorText: '#F1F5F9',
    colorTextSecondary: '#94A3B8',
    colorTextTertiary: '#64748B',
    borderRadius: 8,
    wireframe: false,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    fontSize: 14,
    fontSizeHeading1: 30,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontWeightStrong: 600,
    colorBgLayout: '#0B1120',
  },
  components: {
    Layout: {
      headerBg: 'rgba(15, 23, 42, 0.8)',
      bodyBg: '#0B1120',
      siderBg: 'rgba(15, 23, 42, 0.85)',
    },
    Menu: {
      itemBg: 'transparent',
      horizontalItemSelectedColor: '#93C5FD',
      itemSelectedColor: '#93C5FD',
      itemSelectedBg: 'rgba(59, 130, 246, 0.15)',
      itemHoverColor: '#93C5FD',
      itemHoverBg: 'rgba(59, 130, 246, 0.15)',
    },
    Button: {
      primaryColor: '#3B82F6',
      primaryShadow: '0 1px 3px rgba(59, 130, 246, 0.3)',
      defaultBorderColor: 'rgba(148, 163, 184, 0.2)',
      defaultColor: '#E2E8F0',
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
    },
    Card: {
      headerBg: 'rgba(15, 23, 42, 0.7)',
      borderRadiusLG: 16,
      paddingLG: 20,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      activeBorderColor: '#3B82F6',
      activeShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
      optionSelectedBg: 'rgba(59, 130, 246, 0.15)',
      optionActiveBg: 'rgba(59, 130, 246, 0.15)',
    },
    Modal: {
      borderRadiusLG: 20,
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Badge: {
      dotSize: 8,
    },
    Breadcrumb: {
      separatorColor: '#64748B',
      linkColor: '#94A3B8',
      lastItemColor: '#F1F5F9',
    },
    Statistic: {
      titleFontSize: 13,
      contentFontSize: 28,
    },
    Table: {
      headerBg: 'rgba(15, 23, 42, 0.7)',
      headerColor: '#CBD5E1',
      headerSortActiveBg: 'rgba(15, 23, 42, 0.7)',
      headerSortHoverBg: 'rgba(59, 130, 246, 0.1)',
      rowHoverBg: 'rgba(59, 130, 246, 0.08)',
      borderColor: 'rgba(148, 163, 184, 0.1)',
    },
  },
};

export default function App() {
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.from('users').select('*');
        if (error) {
          console.error('Error fetching users:', error);
        } else {
          console.log('Success! Users data:', data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };
    fetchUsers();
  }, []);

  return (
    <ConfigProvider theme={theme} locale={zhCN}>
      <AntdApp>
        <AppProvider>
          <ErrorBoundary>
            <Router>
              <Routes>
                <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
                <Route path="/register" element={<AnimatedPage><RegisterPage /></AnimatedPage>} />
                <Route path="/select-role" element={
                  <ProtectedRoute>
                    <AnimatedPage><SelectRole /></AnimatedPage>
                  </ProtectedRoute>
                } />
                <Route path="/*" element={
                  <ProtectedRoute>
                    <Layout>
                      <AnimatedPage>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/project/:id" element={<ProjectDetail />} />
                          <Route path="/user/:id" element={<UserDetail />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/messages" element={<Messages />} />
                          <Route path="/chat/:projectId/:userId" element={<ChatPage />} />
                          <Route path="/admin" element={<Admin />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AnimatedPage>
                    </Layout>
                  </ProtectedRoute>
                } />
              </Routes>
            </Router>
          </ErrorBoundary>
        </AppProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
