import { useEffect, useState } from 'react';

const Interactive = ({ text }) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!text) {
            setDisplayText('No about me content provided.');
            return;
        }

        const timeout = setTimeout(() => {
            if (currentIndex < text.length) {
                setDisplayText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }
        }, 30);

        return () => clearTimeout(timeout);
    }, [currentIndex, text]);

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '2rem',
            background: 'hsla(var(--accent) / 0.1)',
            borderRadius: '12px',
            borderLeft: '4px solid hsl(var(--accent))'
        }}>
            <h2 style={{
                color: 'hsl(var(--section-heading))',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <span style={{
                    display: 'inline-block',
                    width: '24px',
                    height: '24px',
                    background: 'hsl(var(--accent))',
                    borderRadius: '50%'
                }} />
                About Me
            </h2>
            <p style={{
                color: 'hsl(var(--section-text))',
                lineHeight: '1.8',
                fontSize: '1.1rem',
                minHeight: '120px'
            }}>
                {displayText}
                <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '1.2rem',
                    background: 'hsl(var(--accent))',
                    marginLeft: '4px',
                    animation: 'blink 1s infinite'
                }} />
            </p>
        </div>
    );
};

export default Interactive;