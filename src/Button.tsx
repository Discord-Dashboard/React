'use client';

import React, { useState } from 'react';

interface ButtonProps {
    initialCount?: number;
}

const Button: React.FC<ButtonProps> = ({ initialCount = 0 }) => {
    const [count, setCount] = useState(initialCount);

    const handleClick = () => {
        setCount(count + 1);
    };

    return (
        <button
            onClick={handleClick}
            style={{
                padding: '10px 20px',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
            }}
        >
            Clicked {count} times
        </button>
    );
};

export default Button;
