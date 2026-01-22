import type { Meta, StoryObj } from '@storybook/react';
import Feturbulence from './index';

const meta = {
    title: 'UI-Lib/FeTurbulence',
    component: Feturbulence,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        id: { control: 'text' },
        baseFrequency: { control: 'text' },
    },
} satisfies Meta<typeof Feturbulence>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        id: 'turbulence',
        baseFrequency: '0.015 0.1',
        children: 'Primary Button',
    },
};