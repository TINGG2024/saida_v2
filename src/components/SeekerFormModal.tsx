import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, Button, Space } from 'antd';
import type { SeekerRequirement } from '../types';

const { TextArea } = Input;
const { Option } = Select;

interface SeekerFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (req: Omit<SeekerRequirement, 'id' | 'userId'>) => void;
  initialData?: SeekerRequirement;
}

export default function SeekerFormModal({ 
  open, 
  onCancel, 
  onSuccess, 
  initialData 
}: SeekerFormModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          targetCompetition: initialData.targetCompetition,
          expectSkills: initialData.expectSkills.join(', '),
          description: initialData.description
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialData, form]);

  const handleOk = () => {
    form.validateFields().then(values => {
      const expectSkills = values.expectSkills
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s);
      
      onSuccess({
        targetCompetition: values.targetCompetition,
        expectSkills,
        description: values.description,
        active: true
      });
    });
  };

  return (
    <Modal
      title={initialData ? "修改寻队需求" : "发布寻队需求"}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          保存
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          targetCompetition: '互联网+',
          description: ''
        }}
      >
        <Form.Item
          name="targetCompetition"
          label="目标比赛类型"
          rules={[{ required: true, message: '请选择比赛类型' }]}
        >
          <Select placeholder="请选择比赛类型">
            <Option value="互联网+">互联网+</Option>
            <Option value="挑战杯">挑战杯</Option>
            <Option value="数学建模">数学建模</Option>
            <Option value="大创">大创</Option>
            <Option value="ACM">ACM</Option>
            <Option value="其他">其他</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="expectSkills"
          label="期望技能"
          rules={[{ required: true, message: '请输入期望技能' }]}
          help="多个技能用逗号分隔，如：Python, 数据分析, UI设计"
        >
          <Input placeholder="请输入期望技能" />
        </Form.Item>

        <Form.Item
          name="description"
          label="补充说明"
        >
          <TextArea 
            rows={4} 
            placeholder="请简单介绍一下你自己和你对团队的期望"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
