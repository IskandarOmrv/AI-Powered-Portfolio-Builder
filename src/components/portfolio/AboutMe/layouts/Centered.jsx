import { useRef } from 'react';
import styles from '../AboutMeLayouts.module.css';

const Centered = ({ text }) => {
    const spansRef = useRef([]);

    // Helper: Animate all chars outward on hover
    const handleEnter = (idx) => {
        spansRef.current.forEach((span, i) => {
            if (!span) return;
            const distance = Math.abs(i - idx);
            // Farther = smaller movement, limit range
            let move = 14 - Math.min(distance, 8) * 3.2; // px
            if (i === idx) move = 24;
            span.classList.add(styles.animate, styles.active);
            span.style.transform = `translateY(-${move}px) scale(1.09)`;
            span.style.zIndex = 1 + (16 - distance);
        });
    };

    // Helper: Reset all chars
    const handleLeave = () => {
        spansRef.current.forEach((span) => {
            if (!span) return;
            span.classList.remove(styles.animate, styles.active);
            span.style.transform = '';
            span.style.zIndex = '';
        });
    };

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center'
        }}>
            <h2 style={{
                color: 'hsl(var(--section-heading))',
                marginBottom: '2rem',
                position: 'relative',
                display: 'inline-block'
            }}>
                <span style={{
                    position: 'relative',
                    display: 'inline-block',
                    padding: '0 1rem'
                }}>
                    About Me
                    <span style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '60%',
                        height: '2px',
                        background: 'hsl(var(--accent))'
                    }} />
                </span>
            </h2>
            <div style={{
                color: 'hsl(var(--section-text))',
                lineHeight: '1.8',
                fontSize: '1.1rem',
                textAlign: 'center'
            }}>
                {(text || 'No about me content provided.').split('').map((char, i) => (
                    <span
                        key={i}
                        ref={el => spansRef.current[i] = el}
                        className={styles.char}
                        onMouseEnter={() => handleEnter(i)}
                        onMouseLeave={handleLeave}
                    >
                        {char}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default Centered;
