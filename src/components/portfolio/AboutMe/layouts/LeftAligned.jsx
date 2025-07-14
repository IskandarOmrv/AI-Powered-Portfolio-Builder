import styles from '../AboutMeLayouts.module.css';

const LeftAligned = ({ text }) => {
    return (
        <div style={{
            maxWidth: '1350px',
            margin: '0 auto',
            textAlign: 'left'
        }}>
            <h2
                className={styles.shinyText}
                style={{
                    fontSize: 'clamp(1.4rem, 2.9vw, 2.4rem)',
                    marginBottom: '1.5rem',
                    borderBottom: '2px solid hsl(var(--accent))',
                    paddingBottom: '0.5rem',
                    display: 'inline-block',
                    // No color here because shiny animation overrides it
                }}>
                About Me
            </h2>
            <p style={{
                color: 'hsl(var(--section-text))',
                lineHeight: '1.8',
                fontSize: '1.1rem'
            }}>
                {text || 'No about me content provided.'}
            </p>
        </div>
    );
};

export default LeftAligned;
