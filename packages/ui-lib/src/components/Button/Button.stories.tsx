import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button'; // 引入你的组件

// 1. 定义元数据 (Meta)
const meta = {
    title: 'UI-Lib/Button', // 在侧边栏显示的层级
    component: Button,
    parameters: {
        // 居中显示组件
        layout: 'centered',
    },
    tags: ['autodocs'], // 自动生成文档页
    // 配置控件 (Controls)，允许在页面上动态修改 Props
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary'],
        },
        style: { control: 'object' },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 2. 定义具体的 Story (用例)

// 默认形态
export const Primary: Story = {
    args: {
        variant: 'primary',
        children: 'Primary Button',
    },
};

// 次要形态
export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Secondary Button',
    },
};