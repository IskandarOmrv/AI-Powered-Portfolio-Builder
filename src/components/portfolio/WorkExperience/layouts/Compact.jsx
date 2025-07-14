import styles from '../WorkExperience.module.css';

const Compact = ({ items }) => {
    if (!Array.isArray(items) || !items.length) return null;

    return (
        <div className={styles.compactContainer}>
            <h2 className={styles.sectionTitle}>Work History</h2>
            
            <div className={styles.compactList}>
                {items.map((exp, idx) => (
                    <div key={idx} className={styles.compactItem}>
                        <div className={styles.compactPeriod}>
                            {exp.startDate && new Date(exp.startDate + "-01").toLocaleString('en-US', { year: "numeric" })}
                            {" - "}
                            {exp.endDate === "Present" 
                                ? "Present" 
                                : (exp.endDate && new Date(exp.endDate + "-01").toLocaleString('en-US', { year: "numeric" }))
                            }
                        </div>
                        <div className={styles.compactDetails}>
                            <h3 className={styles.compactTitle}>{exp.title}</h3>
                            <p className={styles.compactDescription}>{exp.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Compact;