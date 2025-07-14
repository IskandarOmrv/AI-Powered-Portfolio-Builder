import styles from '../WorkExperience.module.css';

const Timeline = ({ items }) => {
    if (!Array.isArray(items) || !items.length) return null;

    return (
        <div className={styles.timelineContainer}>
            <h2 className={styles.sectionTitle}>Work Experience</h2>
            
            <ul className={styles.timelineList}>
                {items.map((exp, idx) => (
                    <li key={idx} className={styles.timelineItem}>
                        <div className={styles.timelineMarker}></div>
                        {idx !== items.length - 1 && <div className={styles.timelineLine}></div>}
                        
                        <div className={styles.timelineContent}>
                            <div className={styles.timelineHeader}>
                                <h3 className={styles.timelineTitle}>{exp.title}</h3>
                                <span className={styles.timelineDate}>
                                    {exp.startDate && new Date(exp.startDate + "-01").toLocaleString('en-US', { month: "short", year: "numeric" })}
                                    {" – "}
                                    {exp.endDate === "Present" 
                                        ? "Present" 
                                        : (exp.endDate && new Date(exp.endDate + "-01").toLocaleString('en-US', { month: "short", year: "numeric" }))
                                    }
                                </span>
                            </div>
                            <p className={styles.timelineDescription}>{exp.description}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Timeline;