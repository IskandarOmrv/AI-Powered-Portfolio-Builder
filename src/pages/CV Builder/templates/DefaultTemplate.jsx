import "../../../css/./ResumePreview.css";

const themeStyles = {
    Light: { primary: "#333", secondary: "#555", accent: "#2196F3", background: "#fff" },
    Slate: { primary: "#28334A", secondary: "#7D8597", accent: "#70A1D7", background: "#F4F8FB" },
    Forest: { primary: "#20503B", secondary: "#547B6D", accent: "#8DD6A3", background: "#F5FFF7" },
    Sunset: { primary: "#FC7300", secondary: "#E2711D", accent: "#FA9905", background: "#FFF5E1" }
};

const DefaultTemplate = ({ data, theme }) => {
    const styles = themeStyles[theme] || themeStyles.Light;
    const hasContactInfo = data.contact?.email || data.contact?.phone || data.contact?.linkedin;

    return (
        <div className="resume-template" style={{ background: styles.background }}>
            {/* Header */}
            <div className="resume-header" style={{ color: styles.primary }}>
                <h1>{data.name}</h1>
                {data.title && <h2>{data.title}</h2>}
                {hasContactInfo && (
                    <div className="contact-info" style={{ color: styles.secondary }}>
                        {data.contact?.email && <span><b>Email:</b> {data.contact.email}</span>}
                        {data.contact?.phone && <span><b>Phone:</b> {data.contact.phone}</span>}
                        {data.contact?.linkedin && <span><b>LinkedIn:</b> {data.contact.linkedin}</span>}
                    </div>
                )}
            </div>

            <hr style={{ borderColor: styles.accent }} />

            {/* Main Content */}
            <div className="resume-content">
                {/* Summary */}
                {data.summary && (
                    <div className="section">
                        <h3 style={{ borderBottomColor: styles.accent, color: styles.primary }}>Summary</h3>
                        <p style={{ color: styles.secondary }}>{data.summary}</p>
                    </div>
                )}

                {/* Experience */}
                {data.experience && data.experience.length > 0 && (
                    <div className="section">
                        <h3 style={{ borderBottomColor: styles.accent, color: styles.primary }}>Experience</h3>
                        {data.experience.map((exp, i) => (
                            <div key={i} className="experience-item">
                                <div className="job-title" style={{ color: styles.primary }}>{exp.job_title}</div>
                                <div className="company" style={{ color: styles.secondary }}>{exp.company}</div>
                                <div className="dates" style={{ color: styles.secondary }}>
                                    {exp.start_date} - {exp.end_date || "Present"}
                                </div>
                                {exp.description && (
                                    <div className="description" style={{ color: styles.secondary }}>
                                        {exp.description}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Education */}
                {data.education && data.education.length > 0 && (
                    <div className="section">
                        <h3 style={{ borderBottomColor: styles.accent, color: styles.primary }}>Education</h3>
                        {data.education.map((edu, i) => (
                            <div key={i} className="education-item">
                                <div className="degree" style={{ color: styles.primary }}>{edu.degree}</div>
                                <div className="institution" style={{ color: styles.secondary }}>{edu.institution}</div>
                                <div className="years" style={{ color: styles.secondary }}>
                                    {edu.start_year} - {edu.end_year || "Present"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Skills */}
                {data.skills && data.skills.filter(s => s).length > 0 && (
                    <div className="section">
                        <h3 style={{ borderBottomColor: styles.accent, color: styles.primary }}>Skills</h3>
                        <div className="skills-list">
                            {data.skills.filter(s => s).map((s, i) => (
                                <span key={i} className="skill-tag" style={{ background: styles.accent, color: styles.secondary }}>
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certifications */}
                {data.certifications && data.certifications.filter(c => c).length > 0 && (
                    <div className="section">
                        <h3 style={{ borderBottomColor: styles.accent, color: styles.primary }}>Certifications</h3>
                        <div className="certifications-list">
                            {data.certifications.filter(c => c).map((c, i) => (
                                <span key={i} className="cert-tag" style={{ background: styles.accent, color: styles.secondary }}>
                                    {c}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Languages */}
                {data.languages && data.languages.filter(l => l).length > 0 && (
                    <div className="section">
                        <h3 style={{ borderBottomColor: styles.accent, color: styles.primary }}>Languages</h3>
                        <div className="languages-list">
                            {data.languages.filter(l => l).map((l, i) => (
                                <span key={i} className="lang-tag" style={{ background: styles.accent, color: styles.secondary }}>
                                    {l}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Custom Sections */}
                {data.custom_sections && data.custom_sections.length > 0 && data.custom_sections.map((sec, i) =>
                    sec.label && (
                        <div key={i} className="section">
                            <h3 style={{ borderBottomColor: styles.accent, color: styles.primary }}>{sec.label}</h3>
                            <div className="custom-items-list">
                                {sec.items && sec.items.map((item, j) => item && (
                                    <span key={j} className="custom-tag" style={{ background: styles.accent, color: styles.secondary }}>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default DefaultTemplate;