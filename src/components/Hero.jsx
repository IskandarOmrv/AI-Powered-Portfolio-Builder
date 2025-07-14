import styles from '../css/Hero.module.css';
import CardsSection from './CardsSection';
import { useNavigate } from 'react-router-dom';
import video from '../assets/HeroVideo.mp4'

const Hero = () => {
    const navigate = useNavigate();
    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Build <span className={styles.highlight}>Professional Portfolios</span>
                        <br />Powered by AI
                    </h1>
                    <p className={styles.heroDescription}>
                        Create stunning, tailored portfolios in seconds. Our AI analyzes your skills and
                        experience to craft the perfect presentation of your work.
                    </p>
                    <div className={styles.ctaButtons}>
                        <button
                            className={styles.ctaPrimary}
                            onClick={() => navigate('/signup')}
                        >
                            Generate Your Portfolio →
                        </button>
                        <button
                            className={styles.ctaSecondary}
                            onClick={() => navigate('/blog')}
                        >
                            <span className={styles.playIcon}>▶</span> Visit Blog Page
                        </button>
                    </div>
                </div>
                <div className={styles.heroVisual}>
                    <div className={styles.gradientCircle}></div>
                    <div className={styles.videoContainer}>
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className={styles.heroVideo}
                        >
                            <source src={video} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            </section>
            <CardsSection />
        </main>
    );
};

export default Hero;