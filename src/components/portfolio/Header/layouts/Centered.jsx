const Centered = ({ firstName, middleName, lastName, title }) => {
    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '2rem 1rem',
            textAlign: 'center',
            opacity: 0,
            animation: 'fadeIn 0.5s ease forwards',
            animationDelay: '0.1s'
        }}>
            <div style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                margin: 0,
                color: 'hsl(var(--header-text))',
                fontWeight: '700',
                letterSpacing: '-0.025em',
                lineHeight: '1.2',
                textShadow: '1px 1px 2px hsla(var(--header-shadow) / 0.2)',
                fontFamily: "'Inter', sans-serif"
            }}>
                {firstName} 
                {middleName ? (<span style={{ 
                    fontWeight: '400',
                    color: 'hsl(var(--header-subtext) / 0.8)'
                }}> {middleName} </span>):(<span> </span>)}
                {lastName}
            </div>
            <div style={{
                height: '3px',
                width: '100px',
                background: 'hsl(var(--header-subtext))',
                margin: '1.5rem auto',
                borderRadius: '3px'
            }} />
            <h2 style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                margin: '0.5rem 0 0',
                color: 'hsl(var(--header-subtext))',
                fontWeight: '400',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                opacity: '0.9'
            }}>
                {title}
            </h2>
        </div>
    );
};

export default Centered;