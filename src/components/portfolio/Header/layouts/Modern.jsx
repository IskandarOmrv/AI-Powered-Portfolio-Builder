const Modern = ({ firstName, middleName, lastName, title }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            maxWidth: '1450px',
            margin: '0 auto',
            padding: '2rem',
            opacity: 0,
            animation: 'fadeIn 0.5s ease forwards',
            animationDelay: '0.2s'
        }}>
            <div>
                <div style={{
                    color: 'hsl(var(--header-text))',
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: '700',
                    margin: 0,
                    lineHeight: '1',
                    letterSpacing: '-0.05em'
                }}>
                    {firstName} {lastName}
                </div>
                {middleName && <p style={{
                    color: 'hsl(var(--header-subtext) / 0.7)',
                    margin: '0.5rem 0 0',
                    fontStyle: 'italic'
                }}>{middleName}</p>}
            </div>
            
            <div style={{
                color: 'hsl(var(--header-subtext))',
                fontSize: '1rem',
                fontWeight: '600',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                paddingBottom: '0.25rem',
                borderBottom: '3px solid hsl(var(--header-subtext))',
                marginLeft: '2rem',
                marginBottom:'25px'
            }}>
                {title}
            </div>
        </div>
    );
};

export default Modern;