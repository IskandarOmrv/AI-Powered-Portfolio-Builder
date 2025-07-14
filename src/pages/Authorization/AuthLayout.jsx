import { useNavigate } from 'react-router-dom';
import styles from '../../css/AuthLayout.module.css';
import logo from '../../assets/Logo_128.png';

const AuthLayout = ({ children }) => {
    const navigate = useNavigate();
    return (
        <div className={styles.authLayout}>
            <button className={styles.backButton} onClick={() => navigate('/')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to Main
            </button>
            <div className={styles.authContainer}>
                <div className={styles.authHeader}>
                    <img src={logo} alt="Logo" width={40} height={40} className={styles.logo} />
                    <h1 className={styles.title}>AI Portfolio Builder</h1>
                </div>
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;