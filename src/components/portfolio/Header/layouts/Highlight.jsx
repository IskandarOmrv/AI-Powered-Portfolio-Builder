const HighlightLayout = ({ firstName, middleName, lastName, title }) => {
    return (
        <div style={{
            display: 'flex',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '3rem 2rem',
            position: 'relative'
        }}>
            <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '1rem',
                background: 'hsl(var(--accent))',
                borderRadius: '0 4px 4px 0'
            }} />
            
            <div style={{
                flex: 1,
                paddingLeft: '2rem'
            }}>
                <h1 style={{
                    fontSize: 'clamp(2rem, 6vw, 4rem)',
                    margin: 0,
                    color: 'hsl(var(--header-text))',
                    fontWeight: '800',
                    lineHeight: '1.1',
                    letterSpacing: '-0.03em'
                }}>
                    <span style={{
                        display: 'block',
                        color: 'hsl(var(--accent))',
                        fontSize: '0.7em',
                        fontWeight: '600'
                    }}>
                        {title}
                    </span>
                    {firstName} {lastName}
                </h1>
            </div>
            
            {middleName && (
                <div style={{
                    alignSelf: 'flex-end',
                    padding: '0.5rem 1rem',
                    background: 'hsl(var(--accent) / 0.2)',
                    borderRadius: '4px',
                    fontStyle: 'italic'
                }}>
                    {middleName}
                </div>
            )}
        </div>
    );
};

export default HighlightLayout;