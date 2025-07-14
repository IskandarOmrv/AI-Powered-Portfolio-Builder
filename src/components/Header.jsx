import styles from '../css/Header.module.css';
import { useNavigate } from 'react-router-dom';
import image from '../assets/Logo_128.png';

const Header = () => {
    const navigate = useNavigate();
    return (
        <header className={styles.header}>
            <div className={styles.logoContainer} onClick={() => navigate('/')}>
                <img
                    src={image}
                    alt="AI Portfolio Builder logo"
                    width={36}
                    height={36}
                />
                <span className={styles.siteName}>AI Portfolio Builder</span>
            </div>
            <div className={styles.authButtons}>
                <button 
                    className={styles.loginBtn} 
                    onClick={() => navigate('/login')}
                >
                    Log in
                </button>
                <button 
                    className={styles.signupBtn} 
                    onClick={() => navigate('/signup')}
                >
                    Get Started
                </button>
            </div>
        </header>
    );
};

export default Header;