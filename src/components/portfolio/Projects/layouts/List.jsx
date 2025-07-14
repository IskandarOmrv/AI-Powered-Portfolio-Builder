import { motion, AnimatePresence } from 'framer-motion';

const List = ({ projects }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxWidth: '1350px',
        margin: '0 auto',
        maxHeight: '600px',
        overflowY: projects.length > 5 ? 'auto' : 'visible',
        paddingRight: '8px',
      }}
    >
      <AnimatePresence>
        {projects.map((project, index) => (
          <motion.div
            key={index}
            className="list-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            style={{
              background: 'hsl(var(--card))',
              borderRadius: '8px',
              padding: '1.5rem',
              border: '1px solid hsl(var(--border))',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '140px', 
              display: 'flex',
              alignItems: 'center',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '4px',
                background: `linear-gradient(to bottom, hsl(var(--accent)), hsl(var(--primary)))`,
                opacity: 0.8,
              }}
            />
            <div style={{ paddingLeft: '1rem', flex: 1 }}>
              <h3
                style={{
                  marginTop: 0,
                  color: 'hsl(var(--card-foreground))',
                  marginBottom: '0.5rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {project.title || project.link || 'Untitled Project'}
              </h3>

              <p
                style={{
                  color: 'hsl(var(--muted-foreground))',
                  marginBottom: '1rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '2.5em',
                }}
              >
                {project.description || 'No description provided.'}
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
                    minWidth: '120px',
                    textAlign: 'center',
                  }}
                >
                  View Project
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default List;
