import styles from '../WorkExperience.module.css';

const Cards = ({ items }) => {
    if (!Array.isArray(items) || !items.length) return null;

    return (
        <div className={styles.cardsContainer}>
            <h2 className={styles.sectionTitle}>Professional Journey</h2>
            
            <div className={styles.cardsGrid}>
                {items.map((exp, idx) => (
                    <div key={idx} className={styles.experienceCard}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>{exp.title}</h3>
                            <span className={styles.cardDate}>
                                {exp.startDate && new Date(exp.startDate + "-01").toLocaleString('en-US', { month: "short", year: "numeric" })}
                                {" → "}
                                {exp.endDate === "Present" 
                                    ? "Now" 
                                    : (exp.endDate && new Date(exp.endDate + "-01").toLocaleString('en-US', { month: "short", year: "numeric" }))
                                }
                            </span>
                        </div>
                        <p className={styles.cardDescription}>{exp.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Cards;