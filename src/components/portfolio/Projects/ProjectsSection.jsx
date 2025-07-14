import { useState, useEffect } from 'react';
import Grid from './layouts/Grid';
import List from './layouts/List';
import Cards from './layouts/Masonry';
import './ProjectsAnimation.css'
import { FiChevronDown, FiChevronUp, FiPlus, FiTrash2 } from "react-icons/fi";

const ProjectsSection = ({ layout, content, isEditing, onChange, onLayoutChange, onError, admin, premium }) => {
    const [localProjects, setLocalProjects] = useState(content?.items || []);
    const [expandedProject, setExpandedProject] = useState(null);
    const [errors, setErrors] = useState({});
    const [showMaxProjectsTooltip, setShowMaxProjectsTooltip] = useState(false);

    const validateField = (field, value) => {
        if (field === 'title') {
            if (value.length < 4) return 'Title must be at least 4 characters';
            if (value.length > 30) return 'Title cannot exceed 30 characters';
        }
        if (field === 'description' && value.length > 200) {
            return 'Description cannot exceed 200 characters';
        }
        if (field === 'link' && value && !/^https?:\/\/.+\..+/.test(value)) {
            return 'Please enter a valid URL (e.g., https://example.com)';
        }
        return '';
    };

    const handleChange = (index, field, value) => {
        if (field === 'title' && value.length > 30) return;
        if (field === 'description' && value.length > 200) return;

        const error = validateField(field, value);
        setErrors(prev => ({
            ...prev,
            [`${index}-${field}`]: error
        }));

        const updated = [...localProjects];
        updated[index] = { ...updated[index], [field]: value };
        setLocalProjects(updated);
        onChange({ items: updated });
    };

    const addProject = () => {
        if (localProjects.length >= 20) return;
        const updated = [...localProjects, { title: '', description: '', link: '' }];
        setLocalProjects(updated);
        onChange({ items: updated });
        setExpandedProject(updated.length - 1);
    };


    const removeProject = (index) => {
        const updated = localProjects.filter((_, i) => i !== index);
        setLocalProjects(updated);
        onChange({ items: updated });
        if (expandedProject === index) setExpandedProject(null);
    };

    const toggleExpand = (index) => {
        setExpandedProject(expandedProject === index ? null : index);
    };

    useEffect(() => {
        setLocalProjects(content?.items || []);
    }, [content, isEditing]);

    const LAYOUTS = [
        { value: "Grid", label: "Grid Layout", premium: false },
        { value: "List", label: "List Layout", premium: true },
        { value: "Cards", label: "Card Stack", premium: false },
    ];



    useEffect(() => {
        const hasProjects = localProjects.length > 0;
        const hasProjectError = localProjects.some((project, idx) => {
            if (!project.title || project.title.length < 5 || project.title.length > 30)
                return true;
            if (project.description && project.description.length > 200)
                return true;
            if (project.link && !/^https?:\/\/.+\..+/.test(project.link))
                return true;
            if (
                errors[`${idx}-title`] ||
                errors[`${idx}-description`] ||
                errors[`${idx}-link`]
            )
                return true;
            return false;
        });

        if (typeof onError === 'function') {
            onError('Projects', !hasProjects || hasProjectError);
        }
    }, [localProjects, errors, onError]);


    return (
        <section style={{
            padding: '2rem',
            background: 'hsl(var(--projects-bg))',
            transition: 'background 0.3s ease',
            paddingBottom: '100px',
            paddingTop: '100px'
        }}>
            <h2 style={{
                textAlign: 'center',
                marginBottom: '2rem',
                color: 'hsl(var(--card-foreground))'
            }}>
                My Projects
            </h2>
            {isEditing && (
                <div style={{
                    background: 'hsl(var(--editor-bg))',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    border: '1px solid hsl(var(--border))'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <select
                            value={layout}
                            onChange={(e) => onLayoutChange(e.target.value)}
                            style={{
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid hsl(var(--border))',
                                background: 'hsl(var(--input-bg))',
                                color: 'hsl(var(--input-text))'
                            }}
                        >
                            {LAYOUTS.map(l => (
                                <option
                                    key={l.value}
                                    value={l.value}
                                    disabled={l.premium && !premium && !admin}
                                    title={l.premium && !premium && !admin? "Upgrade to Premium for this layout" : ""}
                                    style={l.premium && !premium && !admin? { color: "#888", fontStyle: "italic" } : {}}
                                >
                                    {l.label}{l.premium ? " (Premium)" : ""}
                                </option>
                            ))}
                        </select>

                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={addProject}
                                disabled={localProjects.length >= 20}
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: localProjects.length >= 20
                                        ? 'hsl(var(--muted))'
                                        : 'hsl(var(--accent))',
                                    color: 'hsl(var(--accent-foreground))',
                                    border: 'none',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: localProjects.length >= 20 ? 'not-allowed' : 'pointer',
                                    opacity: localProjects.length >= 20 ? 0.7 : 1
                                }}
                                onMouseEnter={() => localProjects.length >= 20 && setShowMaxProjectsTooltip(true)}
                                onMouseLeave={() => setShowMaxProjectsTooltip(false)}
                            >
                                <FiPlus /> Add Project
                            </button>
                            {showMaxProjectsTooltip && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    background: 'hsl(var(--destructive))',
                                    color: 'hsl(var(--destructive-foreground))',
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    marginTop: '0.5rem',
                                    whiteSpace: 'nowrap'
                                }}>
                                    Maximum 20 projects reached
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {localProjects.map((project, index) => (
                            <div key={index} style={{
                                background: 'hsl(var(--card))',
                                borderRadius: '8px',
                                border: `1px solid ${errors[`${index}-title`] ? 'hsl(var(--destructive))' : 'hsl(var(--border))'}`,
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    cursor: 'pointer',
                                    background: 'hsl(var(--card))'
                                }} onClick={() => toggleExpand(index)}>
                                    <h3 style={{
                                        margin: 0,
                                        color: 'hsl(var(--card-foreground))'
                                    }}>
                                        {project.title || `Project ${index + 1}`}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleExpand(index);
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'hsl(var(--muted-foreground))',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {expandedProject === index ? <FiChevronUp /> : <FiChevronDown />}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeProject(index);
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'hsl(var(--destructive))',
                                                cursor: 'pointer'

                                            }}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                                {expandedProject === index && (
                                    <div style={{
                                        padding: '1rem',
                                        borderTop: '1px solid hsl(var(--border))',
                                        background: 'hsl(var(--card))'
                                    }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '0.5rem',
                                                    color: 'hsl(var(--muted-foreground))'
                                                }}>Title</label>
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    color: project.title.length > 30 ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))'
                                                }}>
                                                    {project.title.length}/30
                                                </span>
                                            </div>
                                            <input
                                                value={project.title}
                                                onChange={(e) => handleChange(index, 'title', e.target.value)}
                                                maxLength={30}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${errors[`${index}-title`] ? 'hsl(var(--destructive))' : 'hsl(var(--border))'}`,
                                                    background: 'hsl(var(--input-bg))',
                                                    color: 'hsl(var(--input-text))'
                                                }}
                                            />
                                            {errors[`${index}-title`] && (
                                                <p style={{ color: 'hsl(var(--destructive))', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                                    {errors[`${index}-title`]}
                                                </p>
                                            )}
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '0.5rem',
                                                    color: 'hsl(var(--muted-foreground))'
                                                }}>Description</label>
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    color: project.description.length > 200 ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))'
                                                }}>
                                                    {project.description.length}/200
                                                </span>
                                            </div>
                                            <textarea
                                                value={project.description}
                                                onChange={(e) => handleChange(index, 'description', e.target.value)}
                                                maxLength={200}
                                                style={{
                                                    width: '100%',
                                                    minHeight: '100px',
                                                    padding: '0.75rem',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${errors[`${index}-description`] ? 'hsl(var(--destructive))' : 'hsl(var(--border))'}`,
                                                    background: 'hsl(var(--input-bg))',
                                                    color: 'hsl(var(--input-text))'
                                                }}
                                            />
                                            {errors[`${index}-description`] && (
                                                <p style={{ color: 'hsl(var(--destructive))', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                                    {errors[`${index}-description`]}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                color: 'hsl(var(--muted-foreground))'
                                            }}>Link (optional)</label>
                                            <input
                                                value={project.link || ''}
                                                onChange={(e) => handleChange(index, 'link', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${errors[`${index}-link`] ? 'hsl(var(--destructive))' : 'hsl(var(--border))'}`,
                                                    background: 'hsl(var(--input-bg))',
                                                    color: 'hsl(var(--input-text))'
                                                }}
                                                placeholder="https://example.com"
                                            />
                                            {errors[`${index}-link`] && (
                                                <p style={{ color: 'hsl(var(--destructive))', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                                    {errors[`${index}-link`]}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {localProjects.length > 0 ? (
                <div style={{ opacity: isEditing ? 0.7 : 1, transition: 'opacity 0.3s' }}>
                    {layout === 'Grid' && <Grid projects={localProjects} />}
                    {layout === 'List' && <List projects={localProjects} />}
                    {layout === 'Cards' && <Cards projects={localProjects} />}
                </div>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'hsl(var(--muted-foreground))'
                }}>
                    No projects added yet
                </div>
            )}
        </section>
    );
};

export default ProjectsSection;