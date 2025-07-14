import styles from '../css/AboutPage.module.css';

const AboutPage = () => (
    <div className={styles.aboutContainer}>
        <header className={styles.aboutHeader}>
            <h1 className={styles.aboutTitle}>About AI Portfolio Builder</h1>
            <p className={styles.aboutSubtitle}>
                Empowering students, developers, and creatives to showcase their skills with AI-powered portfolios
            </p>
        </header>

        <section className={styles.aboutSection}>
            <p className={styles.aboutText}>
                AI Portfolio Builder is a revolutionary web application designed to help users create stunning, 
                personalized portfolios in minutes. Our intelligent platform eliminates the need for advanced 
                web development skills while delivering professional results.
            </p>
            <p className={styles.aboutText}>
                We believe everyone deserves a beautiful digital presence to showcase their achievements and 
                accelerate their career growth.
            </p>
        </section>

        <section className={styles.aboutSection}>
            <h2 className={styles.sectionTitle}>Key Features</h2>
            <div className={styles.featuresGrid}>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>✨</div>
                    <h3 className={styles.featureTitle}>AI-Powered Design</h3>
                    <p>Smart layouts and themes tailored to your content and preferences</p>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>⚡</div>
                    <h3 className={styles.featureTitle}>Real-Time Editing</h3>
                    <p>Instant previews as you build with our intuitive editor</p>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>📁</div>
                    <h3 className={styles.featureTitle}>Comprehensive Sections</h3>
                    <p>Projects, experience, education, skills, and contact sections</p>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>🎨</div>
                    <h3 className={styles.featureTitle}>Customization</h3>
                    <p>Colors, fonts, and layouts to match your personal brand</p>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>📱</div>
                    <h3 className={styles.featureTitle}>Mobile Ready</h3>
                    <p>Perfectly responsive designs that work on all devices</p>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>🚀</div>
                    <h3 className={styles.featureTitle}>Premium Options</h3>
                    <p>Advanced features and exclusive templates</p>
                </div>
            </div>
        </section>

        <section className={`${styles.aboutSection} ${styles.teamSection}`}>
            <h2 className={styles.sectionTitle}>Our Team</h2>
            <p className={styles.aboutText}>
                Developed by passionate university students in Georgia, AI Portfolio Builder combines 
                technical innovation with user-friendly design. We're committed to continuous improvement 
                and welcome collaboration opportunities.
            </p>
            <a href="/contact" className={styles.ctaButton}>
                Get In Touch
            </a>
        </section>
    </div>
);

export default AboutPage;