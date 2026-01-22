import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Counter from './index'; // 假设你有这个组件

describe('集成测试: Counter组件', () => {
  it('点击按钮数字应该增加', async () => {
    // 1. 渲染组件
    render(<Counter />);
    
    // 2. 模拟用户行为 (集成测试的核心)
    const button = screen.getByRole('button', { name: /add/i });
    await userEvent.click(button);
    
    // 3. 断言 UI 变化
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});
