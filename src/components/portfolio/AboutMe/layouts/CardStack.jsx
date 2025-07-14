import { useState } from 'react';

const CardStack = ({ text }) => {
    const [hovered, setHovered] = useState(false);

    const textChunks = text ? text.split(/(?<=[.!?])\s+/) : ['No about me content provided.'];

    return (
        <div style={{
            maxWidth: '800px',
            margin: '2rem auto',
            position: 'relative',
            minHeight: '200px'
        }}>
            <h2 style={{
                color: 'hsl(var(--section-heading))',
                marginBottom: '2rem',
                textAlign: 'center',
                position: 'relative',
                zIndex: 3
            }}>
                About Me
            </h2>

            <div
                style={{
                    position: 'relative',
                    height: '100%',
                    cursor: 'pointer',
                    perspective: '1000px'
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {textChunks.map((chunk, index) => {
                    const rotation = hovered
                        ? `${index * 3 - (textChunks.length * 1.5)}deg`
                        : '0deg';
                    const zIndex = hovered
                        ? textChunks.length - index
                        : 1;

                    return (
                        <div
                            key={index}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                background: `hsl(var(--card-bg))`,
                                color: 'hsl(var(--card-text))',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px hsla(var(--shadow-color) / 0.2)',
                                border: '1px solid hsl(var(--border))',
                                transform: `rotate(${rotation})`,
                                transformOrigin: 'center bottom',
                                transition: 'all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                                zIndex,
                                opacity: hovered ? 1 : index === textChunks.length - 1 ? 1 : 0.7
                            }}
                        >
                            <p style={{
                                margin: 0,
                                lineHeight: '1.6',
                                fontSize: '1rem'
                            }}>
                                {chunk}
                            </p>
                            {hovered && index !== textChunks.length - 1 && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-8px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '80%',
                                    height: '8px',
                                    background: `hsl(var(--accent) / ${0.2 + (index * 0.1)})`,
                                    borderRadius: '0 0 8px 8px'
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CardStack;