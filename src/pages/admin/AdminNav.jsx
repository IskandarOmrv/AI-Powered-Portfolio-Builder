import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiUsers, FiFolder, FiBarChart2, FiArrowLeft } from "react-icons/fi";
import styles from "../../css/AdminNav.module.css";

const AdminNav = () => {
    const navigate = useNavigate();

    return (
        <div>
            <nav className={styles.navContainer}>
                <NavLink 
                    to="/admin/users" 
                    className={({ isActive }) => 
                        `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                    } 
                    title="Users"
                >
                    <FiUsers className={styles.icon} />
                </NavLink>
                <NavLink 
                    to="/admin/portfolios" 
                    className={({ isActive }) => 
                        `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                    } 
                    title="Portfolios"
                >
                    <FiFolder className={styles.icon} />
                </NavLink>
                <NavLink 
                    to="/admin/stats" 
                    className={({ isActive }) => 
                        `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                    } 
                    title="Stats"
                >
                    <FiBarChart2 className={styles.icon} />
                </NavLink>
                
                <div 
                    className={styles.backButton} 
                    onClick={() => navigate('/dashboard')}
                    title="Back to Dashboard"
                >
                    <FiArrowLeft className={styles.icon} />
                </div>
            </nav>
            <main className={styles.pageContainer}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminNav;