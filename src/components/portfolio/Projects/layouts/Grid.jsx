const Grid = ({ projects }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))',
            gap: '1.5rem',
            justifyItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            {projects.map((project, index) => (
                <div
                    key={index}
                    className="grid-item"
                    style={{
                        width: '370px',
                        minHeight: '170px',
                        background: 'hsl(var(--card))',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        border: '1px solid hsl(var(--border))',
                        opacity: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
                        animation: `fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s forwards`,
                        


                    }}
                >
                    <h3 style={{
                        marginTop: 0,
                        color: 'hsl(var(--card-foreground))',
                        marginBottom: '0.5rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {project.title}
                    </h3>
                    <p style={{
                        color: 'hsl(var(--muted-foreground))',
                        marginBottom: '1rem',
                        flexGrow: 1,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                    }}>
                        {project.description}
                    </p>
                    {project.link && (
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-button"
                            style={{
                                display: 'inline-block',
                                padding: '0.5rem 1rem',
                                background: 'hsl(var(--accent))',
                                color: 'hsl(var(--accent-foreground))',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontWeight: '500',
                                width: 'fit-content',
                                minWidth: '320px',
                                textAlign: 'center'

                            }}
                        >
                            View Project
                        </a>
                    )}
                </div>
            ))}
        </div>
    );
};
export default Grid;