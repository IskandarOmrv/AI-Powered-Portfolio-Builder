const Masonry = ({ projects }) => {
    return (
        <div className="masonry-container">
            {projects.map((project, index) => (
                <div
                    key={index}
                    className="masonry-card" // Hover moved to CSS
                    style={{
                        position: 'relative',
                        borderRadius: '16px',
                        padding: '2rem',
                        minHeight: '200px',
                        background: `
                            radial-gradient(
                                circle at 75% 30%,
                                hsl(var(--accent)/0.15) 0%,
                                transparent 70%
                            ),
                            hsl(var(--card))
                        `,
                        border: '1px solid hsl(var(--border)/0.3)',
                        boxShadow: '0 4px 12px hsl(var(--border)/0.1)',
                        overflow: 'hidden',
                        transition: 'all 0.4s ease'
                    }}
                >
                    {/* Floating label */}
                    <span className="masonry-badge">
                        New
                    </span>

                    <h3 className="masonry-title">
                        {project.title}
                    </h3>

                    <p className="masonry-description">
                        {project.description}
                    </p>

                    {project.link && (
                        <a
                            href={project.link}
                            className="masonry-button"
                        >
                            View Project
                            <svg className="masonry-button-icon" viewBox="0 0 24 24">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </a>
                    )}
                </div>
            ))}
        </div>
    );
};
export default Masonry;