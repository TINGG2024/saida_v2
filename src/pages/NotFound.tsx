import { Button, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: -4,
            marginBottom: 16,
            background: 'linear-gradient(135deg, #60A5FA 0%, #93C5FD 50%, #F1F5F9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </div>
        <Title
          level={3}
          style={{
            color: '#F1F5F9',
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          页面不存在
        </Title>
        <Text
          type="secondary"
          style={{ display: 'block', marginBottom: 32, fontSize: 16, color: '#94A3B8' }}
        >
          您访问的页面不存在或已被删除
        </Text>
        <Button
          type="primary"
          size="large"
          icon={<HomeOutlined />}
          onClick={() => navigate('/')}
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            border: 'none',
            borderRadius: 10,
            height: 48,
            paddingInline: 36,
            fontWeight: 600,
            fontSize: 16,
            boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
          }}
        >
          返回首页
        </Button>
      </div>
    </div>
  );
}
