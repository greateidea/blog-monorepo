// 定义 Props 接口
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}

export const Button = ({ variant = 'primary', style, ...props }: ButtonProps) => {
    const baseStyle: React.CSSProperties = {
        padding: '8px 16px',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: variant === 'primary' ? '#0070f3' : '#eaeaea',
        color: variant === 'primary' ? '#fff' : '#000',
        ...style
    };

    return <button style={baseStyle} {...props} />;
};