const Split = ({ firstName, middleName, lastName, title }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2rem',
            opacity: 0,
            animation: 'fadeIn 0.5s ease forwards'
        }}>
            <div style={{
                color: 'hsl(var(--header-text))',
                fontSize: '1.8rem',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: "'Roboto Mono', monospace"
            }}>
                {firstName.split('').join(' ')}
            </div>
            
            <div style={{
                position: 'relative',
                textAlign: 'center',
                flexGrow: 1,
                padding: '0 2rem'
            }}>
                <div style={{
                    color: 'hsl(var(--header-subtext))',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    letterSpacing: '0.2em',
                    padding: '0.5rem 1rem',
                    borderTop: '2px solid hsl(var(--header-subtext) / 0.3)',
                    borderBottom: '2px solid hsl(var(--header-subtext) / 0.3)',
                    textTransform: 'uppercase'
                }}>
                    {title}
                </div>
            </div>
            
            <div style={{
                color: 'hsl(var(--header-text))',
                fontSize: '1.8rem',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: "'Roboto Mono', monospace"
            }}>
                {lastName.split('').join(' ')}
            </div>
        </div>
    );
};

export default Split;