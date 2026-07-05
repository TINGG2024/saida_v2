import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Typography, Card } from 'antd';
import { WarningOutlined, RestOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryComponent extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
          <Card className="text-center shadow-lg rounded-2xl max-w-md w-full">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <WarningOutlined className="text-red-500 text-3xl" />
            </div>
            <Title level={2} className="text-gray-800 mb-2">页面出错了</Title>
            <Text type="secondary" className="block mb-6">
              抱歉，页面加载时出现了问题，请尝试刷新重试
            </Text>
            {this.state.error && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <Text type="danger" className="text-sm">
                  {this.state.error.message}
                </Text>
              </div>
            )}
            <Button
              type="primary"
              icon={<RestOutlined />}
              onClick={this.handleRetry}
              className="bg-gradient-to-r from-blue-500 to-cyan-400 border-none h-12 px-8"
            >
              刷新重试
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryComponent>
      {children}
    </ErrorBoundaryComponent>
  );
}