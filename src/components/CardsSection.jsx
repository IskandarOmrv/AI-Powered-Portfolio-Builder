import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/CardsSection.module.css';
import img1 from '../assets/cardsection/por1.png'
import img2 from '../assets/cardsection/por2.png'
import img3 from '../assets/cardsection/por3.png'
const cards = [
    {
        id: 'portfolio1',
        label: 'Dark Elegant AI Engineer Portfolio',
        image: img1,
        description: "A bold, dark-themed layout with a centered circular profile image and striking purple accent colors. The About Me section appears in a prominent, rounded card with a colored dot, clear section title, and an in-depth personal summary—perfect for highlighting advanced skills and professionalism.",
        url: '/portfolio/18848200-0f60-46fd-bd7c-22f64e2c9d4b'
    },
    {
        id: 'portfolio2',
        label: 'Modern Side-Card Web Developer Portfolio',
        image: img2,
        description: "This design features a left-aligned header for the name and a right-aligned professional title. The About Me section sits inside a pastel-colored card, visually separated from the header, emphasizing tech skills and personality. Projects are displayed in wide, easy-to-read cards for quick browsing.",
        url: '/portfolio/0d8479dc-3325-46bd-875f-948fa44dd6e1'
    },
    {
        id: 'portfolio3',
        label: 'Elegant Minimal Data Science Portfolio',
        image: img3,
        description: "A crisp, vertical layout with the name and professional title at the top, followed by a modern polaroid-style profile image. The About Me section uses a subtle card with a slight shadow and rounded corners, creating a clean, modern feel that is both approachable and professional.",
        url: '/portfolio/4902346e-1ed0-4f28-85ee-3da89c0d8aa9'
    },
    // {
    //     id: 'portfolio4',
    //     label: 'Academic Portfolio',
    //     image: '/img/academic-portfolio.jpg',
    //     description: "Structured academic portfolio presenting research, publications, and educational achievements.",
    //     url: '/templates/academic'
    // }
];

const AUTO_ADVANCE_TIME = 5000;

const CardsSection = () => {
    const [activeIdx, setActiveIdx] = useState(0);
    const [descVisible, setDescVisible] = useState(true);
    const timer = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        timer.current = setTimeout(() => {
            setDescVisible(false);
            setTimeout(() => {
                setActiveIdx(idx => (idx + 1) % cards.length);
                setDescVisible(true);
            }, 300);
        }, AUTO_ADVANCE_TIME);
        return () => clearTimeout(timer.current);
    }, [activeIdx]);

    const handleCardChange = (idx) => {
        if (idx !== activeIdx) {
            setDescVisible(false);
            setTimeout(() => {
                setActiveIdx(idx);
                setDescVisible(true);
            }, 300);
        }
    };

    const handleViewPortfolio = (url) => {
        navigate(url);
    };

    return (
        <section className={styles.cardsSection}>
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>AI-Generated Portfolio Examples</h2>
                <p className={styles.sectionSubtitle}>See what our AI can create for you</p>
                
                <div className={styles.cardGrid}>
                    <div className={styles.cardContent}>
                        <div className={`${styles.cardDescription} ${descVisible ? styles.fadeIn : styles.fadeOut}`}>
                            <h3 className={styles.cardLabel}>{cards[activeIdx].label}</h3>
                            <p>{cards[activeIdx].description}</p>
                            <button 
                                className={styles.viewButton}
                                onClick={() => handleViewPortfolio(cards[activeIdx].url)}
                            >
                                View Full Portfolio →
                            </button>
                        </div>
                    </div>
                    
                    <div className={styles.cardVisual}>
                        <div className={styles.cardCarousel}>
                            {cards.map((card, idx) => (
                                <div
                                    key={card.id}
                                    className={`${styles.card} ${idx === activeIdx ? styles.active : ''}`}
                                    onClick={() => handleCardChange(idx)}
                                >
                                    <div className={styles.cardImageContainer}>
                                        <img
                                            src={card.image}
                                            alt={card.label}
                                            className={styles.cardImage}
                                            onError={e => { e.target.src = '/img/portfolio-placeholder.jpg'; }}
                                        />
                                        <div className={styles.cardOverlay}></div>
                                        <button 
                                            className={styles.mobileViewButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewPortfolio(card.url);
                                            }}
                                        >
                                            View
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className={styles.navigationDots}>
                            {cards.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={`${styles.dot} ${activeIdx === idx ? styles.activeDot : ''}`}
                                    onClick={() => handleCardChange(idx)}
                                    aria-label={`Show ${cards[idx].label} portfolio`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CardsSection;