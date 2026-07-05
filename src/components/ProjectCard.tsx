import React from 'react';
import { Card, Tag, Progress, Typography, Space } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import type { Project } from '../types';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

interface ProjectCardProps {
  project: Project;
  matchRate?: number;
  extraTags?: React.ReactNode;
}

const getStatusStyle = (status: string): React.CSSProperties => {
  switch (status) {
    case '招募中':
      return { background: 'rgba(234, 179, 8, 0.15)', color: '#EAB308', borderRadius: 8, fontWeight: 600, border: 'none' };
    case '已组队':
      return { background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', borderRadius: 8, fontWeight: 600, border: 'none' };
    case '已结束':
      return { background: 'rgba(100, 116, 139, 0.15)', color: '#94A3B8', borderRadius: 8, fontWeight: 600, border: 'none' };
    default:
      return { background: 'rgba(100, 116, 139, 0.15)', color: '#94A3B8', borderRadius: 8, fontWeight: 600, border: 'none' };
  }
};

const getProgressColor = (status: string): string => {
  switch (status) {
    case '招募中':
      return '#EAB308';
    case '已组队':
      return '#22C55E';
    default:
      return '#22C55E';
  }
};

export default function ProjectCard({ project, matchRate, extraTags }: ProjectCardProps) {
  const navigate = useNavigate();
  const currentMembers = project.teamMembers?.length || 0;
  const requiredMembers = project.requiredMembers || 1;
  const progress = Math.round((currentMembers / requiredMembers) * 100);

  return (
    <Card
      hoverable
      onClick={() => navigate(`/project/${project.id}`)}
      style={{
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid rgba(148, 163, 184, 0.08)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        background: 'rgba(255, 255, 255, 0.05)',
      }}
      styles={{ body: { padding: 20 } }}
    >
      <div
        style={{
          height: 140,
          marginBottom: 16,
          position: 'relative',
          borderRadius: 10,
          overflow: 'hidden',
          background: project.coverImage
            ? `url(${project.coverImage}) center/cover`
            : 'linear-gradient(135deg, #1E3A5F, #1D4ED8)',
        }}
      >
        {/* Decorative overlay circles for depth */}
        <div style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.08)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -15,
          left: -15,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.06)',
        }} />

        {!project.coverImage && (
          <div
            className="flex items-center justify-center"
            style={{ position: 'absolute', inset: 0 }}
          >
            <TeamOutlined style={{ color: '#93C5FD', fontSize: 40, opacity: 0.6 }} />
          </div>
        )}
        <div
          className="flex gap-1.5"
          style={{ position: 'absolute', top: 12, right: 12 }}
        >
          <Tag style={getStatusStyle(project.status)}>
            {project.status}
          </Tag>
          {extraTags}
        </div>
      </div>

      <Title
        level={4}
        className="mb-2 line-clamp-1"
        style={{ color: '#F1F5F9', fontWeight: 600, margin: 0, marginBottom: 12, fontSize: 16 }}
      >
        {project.title}
      </Title>

      <div className="flex items-center justify-between mb-3">
        <Tag style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', borderRadius: 8, fontWeight: 600, border: 'none' }}>
          {project.competitionType}
        </Tag>
        <Text type="secondary" style={{ fontSize: 14, color: '#94A3B8' }}>
          {currentMembers}/{requiredMembers} 人
        </Text>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Text type="secondary" style={{ fontSize: 12, color: '#64748B' }}>队长：</Text>
        <Text style={{ fontSize: 12, color: '#94A3B8' }}>{project.captainName || '未知队长'}</Text>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {(project.requiredSkills || []).slice(0, 3).map(skill => (
          <Tag
            key={skill}
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              color: '#94A3B8',
              borderRadius: 8,
              fontSize: 12,
              padding: '2px 10px',
              border: '1px solid rgba(148, 163, 184, 0.08)',
            }}
          >
            {skill}
          </Tag>
        ))}
        {(project.requiredSkills || []).length > 3 && (
          <Tag
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              color: '#94A3B8',
              borderRadius: 8,
              fontSize: 12,
              padding: '2px 10px',
              border: '1px solid rgba(148, 163, 184, 0.08)',
            }}
          >
            +{project.requiredSkills.length - 3}
          </Tag>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <Progress
          percent={Math.min(progress, 100)}
          strokeColor={getProgressColor(project.status)}
          showInfo={false}
          size="small"
          trailColor="rgba(51, 65, 85, 0.5)"
        />
      </div>

      {matchRate !== undefined && matchRate > 0 && (
        <div
          className="flex items-center gap-2"
          style={{ paddingTop: 12, borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}
        >
          <Text type="secondary" style={{ fontSize: 14, color: '#94A3B8' }}>匹配度</Text>
          <Space.Compact>
            <Progress
              percent={Math.round(matchRate)}
              strokeColor="#3B82F6"
              showInfo={false}
              size="small"
              style={{ width: 80 }}
              trailColor="rgba(51, 65, 85, 0.5)"
            />
            <Text style={{ fontSize: 14, fontWeight: 600, color: '#3B82F6' }}>
              {Math.round(matchRate)}%
            </Text>
          </Space.Compact>
        </div>
      )}
    </Card>
  );
}
