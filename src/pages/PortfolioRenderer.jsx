import { useState, useEffect, useCallback, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import HeaderSection from '../components/portfolio/Header/HeaderSection';
import AboutMeSection from '../components/portfolio/AboutMe/AboutMeSection';
import ProfileImageSection from '../components/portfolio/ProfileImage/ProfileImageSection';
import ProjectsSection from '../components/portfolio/Projects/ProjectsSection';
import ContactSection from '../components/portfolio/Contact/ContactSection';
import WorkExperienceSection from '../components/portfolio/WorkExperience/WorkExperienceSection';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import styles from '../css/PortfolioRenderer.module.css';
import { applyTheme } from '../lib/themes';
import { FaSave, FaEdit, FaTrash, FaTimes, FaArrowLeft, FaSun, FaMoon, FaUserSlash, FaBriefcase } from 'react-icons/fa';


const componentMap = {
    Header: HeaderSection,
    AboutMe: AboutMeSection,
    ProfileImage: ProfileImageSection,
    WorkExperience: WorkExperienceSection,
    Projects: ProjectsSection,
    Contact: ContactSection,
};


const Modal = ({ isOpen, onClose, children, type = 'info' }) => {
    if (!isOpen) return null;

    const modalStyles = {
        info: styles.infoModal,
        confirm: styles.confirmModal,
        error: styles.errorModal,
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.modal} ${modalStyles[type]}`}>
                <div className={styles.modalContent}>
                    {children}
                </div>
                <div className={styles.modalActions}>
                    <button onClick={onClose} className={styles.modalButton}>
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};


const ConfirmModal = ({ isOpen, onConfirm, onCancel, message }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.modal} ${styles.confirmModal}`}>
                <div className={styles.modalContent}>
                    {message}
                </div>
                <div className={styles.modalActions}>
                    <button onClick={onCancel} className={`${styles.modalButton} ${styles.cancelButton}`}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} className={`${styles.modalButton} ${styles.confirmButton}`}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const PortfolioRenderer = ({ initialPortfolio }) => {
    const navigate = useNavigate();
    const {
        isEditing,
        setIsEditing,
        darkMode,
        themes,
        currentTheme,
        setTheme
    } = usePortfolio();

    const [portfolio, setPortfolio] = useState({
        ...initialPortfolio,
        theme: initialPortfolio.theme,
        darkMode: initialPortfolio.darkMode
    });
    const [draft, setDraft] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, message: '', type: 'info' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [currentUserPlan, setCurrentUserPlan] = useState(null);
    const [userPortfolios, setUserPortfolios] = useState([]);
    const [visible, setVisible] = useState(true);
    const [hovering, setHovering] = useState(false);
    const timeoutRef = useRef(null);
    const [isSaving, setIsSaving] = useState(false);
    const [ownerStatus, setOwnerStatus] = useState({
    plan: null,
    plan_expires_at: null,
    isExpired: false,
    isOwner: false,
    isAdmin: false, 
});




    const handleMouseEnter = () => {
        setHovering(true);
        setVisible(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleMouseLeave = () => {
        setHovering(false);
        timeoutRef.current = setTimeout(() => setVisible(false), 3000);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            const fromBottom = window.innerHeight - e.clientY;
            if (fromBottom <= 100 && !hovering) setVisible(true);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [hovering]);

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {

            if (session?.user?.id) {
                setCurrentUserId(session.user.id);
                const { data, error } = await supabase
                    .from('users')
                    .select('role, plan')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.error(error.message);
                    setModal({
                        isOpen: true,
                        message: "Error occured while connecting to database. Please close the page and enter again. if error persists wait 1-2 hours",
                        type: 'error'
                    });
                    return;
                }
                setCurrentUserRole(data?.role || null);
                setCurrentUserPlan(data?.plan || null);
            }
        });
    }, []);

    useEffect(() => {
        if (!currentUserId) return;
        const fetchPortfolios = async () => {
            const { data, error } = await supabase
                .from('portfolios')
                .select('id')
                .eq('user_id', currentUserId);

            if (!error) setUserPortfolios(data || []);
        };
        fetchPortfolios();
    }, [currentUserId]);

    const isOwner = portfolio.userId === currentUserId;

    useEffect(() => {
    async function fetchOwnerStatus() {
        if (!portfolio?.userId) return;
        const isOwner = currentUserId && portfolio.userId && String(currentUserId) === String(portfolio.userId);
        const { data, error } = await supabase
            .from('users')
            .select('plan, plan_expires_at, role')
            .eq('id', portfolio.userId)
            .single();

        let isExpired = false, plan = null, plan_expires_at = null, isAdmin = false;
        if (!error && data) {
            plan = data.plan;
            plan_expires_at = data.plan_expires_at;
            isAdmin = data.role === "admin";
            const now = new Date();
            const expires = plan_expires_at ? new Date(plan_expires_at) : null;
            isExpired = !!expires && expires < now && plan !== 'free' && !isAdmin;
        }
        setOwnerStatus({
            plan,
            plan_expires_at,
            isExpired,
            isOwner,
            isAdmin,
        });
    }
    fetchOwnerStatus();
    // eslint-disable-next-line
}, [portfolio?.userId, currentUserId]);


    const handleEditToggle = () => {
        if (!isEditing) {
            setDraft(JSON.parse(JSON.stringify({
                ...portfolio,
                theme: portfolio.theme || currentTheme.name,
                darkMode: portfolio.darkMode !== undefined ? portfolio.darkMode : darkMode
            })));
            setIsEditing(true);
        } else {
            setIsEditing(false);
            setDraft(null);
        }
    };

    const handleSectionChange = (sectionName, newContent) => {
        setDraft((prev) => ({
            ...prev,
            sections: prev.sections.map((sec) =>
                sec.section === sectionName ? { ...sec, content: newContent } : sec
            ),
        }));
    };

    const handleLayoutChange = (sectionName, newLayout) => {
        setDraft((prev) => ({
            ...prev,
            sections: prev.sections.map((sec) =>
                sec.section === sectionName ? { ...sec, layout: newLayout } : sec
            ),
        }));
    };
    const [sectionErrors, setSectionErrors] = useState({
        Header: false,
        Projects: false,
        Contact: false
    });

    const handleSectionError = useCallback((sectionName, hasError) => {
        setSectionErrors(prev => ({
            ...prev,
            [sectionName]: hasError
        }));
    }, []);

    const handleSave = async () => {
        const hasErrors = Object.values(sectionErrors).some(error => error);
        if (hasErrors) {
            setModal({
                isOpen: true,
                message: "Please fix all validation errors before saving",
                type: 'error'
            });
            return;
        }

        if (currentUserRole !== "admin" && currentUserPlan === "free") {
            setModal({
                isOpen: true,
                message: (
                    <>
                        Please purchase <b>Simple</b> or <b>Premium</b> plans to save your portfolio.<br />
                        <a href="/pricing" style={{ color: '#007bff', textDecoration: 'underline' }}>
                            Go to Subscription Page
                        </a>
                    </>
                ),
                type: 'error'
            });
            return;
        }

        if (
            currentUserRole !== "admin" &&
            currentUserPlan === "simple" &&
            !portfolio.id &&
            userPortfolios.length >= 6
        ) {
            setModal({
                isOpen: true,
                message: (
                    <>
                        Simple plan allows up to <b>6 portfolios</b>.<br />
                        <a href="/pricing" style={{ color: '#007bff', textDecoration: 'underline' }}>
                            Upgrade to Premium
                        </a>
                    </>
                ),
                type: 'error'
            });
            return;
        }

        if (isSaving) return;
        setIsSaving(true);

        let error, msg;
        if (!portfolio.id) {
            const { data, error: insertError } = await supabase
                .from('portfolios')
                .insert({ user_id: portfolio.userId, content: draft })
                .select('id')
                .single();
            error = insertError;
            if (!error && data?.id) {
                setPortfolio({ ...draft, id: data.id });
            }
        } else {
            const { error: updateError } = await supabase
                .from('portfolios')
                .update({ content: draft })
                .eq('id', portfolio.id);
            error = updateError;
            if (!error) setPortfolio({ ...draft, id: portfolio.id });
        }
        if (error) {
            { portfolio.id ? msg = "Failed to update portfolio:" : msg = "Failed to save portfolio:" }
            setModal({
                isOpen: true,
                message: `${msg} + ${error.message}`,
                type: 'error'
            });
        } else {
            { portfolio.id ? msg = "Portfolio updated successfully!" : msg = "Portfolio saved successfully!" }
            setIsEditing(false);
            setDraft(null);
            setModal({
                isOpen: true,
                message: `${msg}`,
                type: 'info'
            });
        }
        setIsSaving(false);
    };


    const handleDelete = async () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setShowDeleteConfirm(false);
        const { error } = await supabase
            .from('portfolios')
            .delete()
            .eq('id', portfolio.id);

        if (error) {
            setModal({
                isOpen: true,
                message: `Failed to delete portfolio: ${error.message}`,
                type: 'error'
            });
        } else {
            setModal({
                isOpen: true,
                message: 'Portfolio deleted.',
                type: 'info',
                onClose: () => navigate('/dashboard')
            });
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const closeModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
        if (modal.onClose) {
            modal.onClose();
        }
    };

    const toRender = isEditing && draft ? draft : portfolio;
    const themeName = (toRender.theme || (currentTheme && currentTheme.name)).trim();

    useEffect(() => {
        const savedTheme = toRender.theme || currentTheme.name;
        const savedDarkMode = typeof toRender.darkMode !== 'undefined' ? toRender.darkMode : darkMode;
        const themeObj = themes.find(t => t.name === savedTheme) || themes[0];

        applyTheme(themeObj, savedDarkMode);
    }, [toRender.theme, toRender.darkMode, setTheme, currentTheme.name, darkMode, themes]);


    const IsAdmin= currentUserRole==='admin'

    return (
        <div className="portfolio-container" data-theme={themeName.toLowerCase()}>
            {ownerStatus.isExpired && !ownerStatus.isAdmin  &&(
                <div className={styles.suspendedBanner}>
                    {ownerStatus.isOwner ? (
                        <>
                            <h2>Your subscription has expired!</h2>
                            <p>Renew your plan to re-activate your portfolios. <a href="/pricing" style={{ color: '#007bff', textDecoration: 'underline' }}>Go to Pricing</a></p>
                        </>
                    ) : (
                        <>
                            <h2>This portfolio is suspended.</h2>
                            <p>The owner's subscription has expired.</p>
                        </>
                    )}
                </div>
            )}
            {ownerStatus.isOwner && !ownerStatus.isAdmin &&
                ownerStatus.plan === "simple" &&
                userPortfolios.length > 6 && (
                    <div className={styles.suspendedBanner}>
                        <h2>Portfolio Limit Exceeded</h2>
                        <p>
                            You currently have <b>{userPortfolios.length}</b> portfolios, but the Simple plan allows only 6.<br />
                            Please delete <b>{userPortfolios.length - 6}</b> portfolio{userPortfolios.length - 6 > 1 ? 's' : ''} to access your portfolios again.<br />
                            <a href="/dashboard" style={{ color: '#007bff', textDecoration: 'underline' }}>
                                Go to Dashboard
                            </a>
                        </p>
                    </div>
                )}
                
            {ownerStatus.isExpired && !ownerStatus.isAdmin ? null
                : ownerStatus.isOwner && ownerStatus.plan === "simple" && userPortfolios.length > 6 && !IsAdmin
                    ? null
                    : (
                        <>
                            {toRender.sections.map((sec, index) => {
                                const Component = componentMap[sec.section];
                                return (
                                    Component && (
                                        <Component
                                            key={index}
                                            layout={sec.layout}
                                            content={sec.content}
                                            isEditing={isEditing}
                                            onChange={(content) => handleSectionChange(sec.section, content)}
                                            onLayoutChange={(layout) => handleLayoutChange(sec.section, layout)}
                                            onError={handleSectionError}
                                            admin={currentUserRole === 'admin' ? true : false}
                                            premium={currentUserPlan === 'premium' ? true : false}
                                        />
                                    )
                                );
                            })}
                            <Modal
                                isOpen={modal.isOpen}
                                onClose={closeModal}
                                type={modal.type}
                            >
                                {modal.message}
                            </Modal>
                            <ConfirmModal
                                isOpen={showDeleteConfirm}
                                message="Are you sure you want to delete this portfolio?  This cannot be undone."
                                onConfirm={confirmDelete}
                                onCancel={cancelDelete}
                            />

                            {isOwner && (
                                <div
                                    className={`${styles.floatingBar} ${visible ? styles.visible : styles.hidden}`}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {isEditing ? (
                                        <>
                                            <select
                                                value={draft.theme}
                                                onChange={e => setDraft(prev => ({ ...prev, theme: e.target.value }))}
                                                className={styles.themeSelect}
                                            >
                                                {themes.map(theme => (
                                                    <option key={theme.name} value={theme.name}>{theme.name} Theme</option>
                                                ))}
                                            </select>

                                            <button
                                                className={styles.iconButton}
                                                onClick={() => setDraft(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                                            >
                                                {draft.darkMode ? <FaSun /> : <FaMoon />}
                                            </button>

                                            <button
                                                className={styles.iconButton}
                                                onClick={() => {
                                                    setDraft(prev => {
                                                        const hasProfile = prev.sections.some(s => s.section === "ProfileImage");
                                                        let newSections = [...prev.sections];
                                                        if (hasProfile) {
                                                            const removed = newSections.filter(s => s.section === "ProfileImage")[0];
                                                            return {
                                                                ...prev,
                                                                sections: newSections.filter(s => s.section !== "ProfileImage"),
                                                                lastProfileImageSection: removed || prev.lastProfileImageSection,
                                                            };
                                                        } else {
                                                            let insertIndex = newSections.findIndex(s => s.section === "Header") + 1;
                                                            if (insertIndex <= 0) insertIndex = 0;
                                                            const profileSection = prev.lastProfileImageSection || {
                                                                section: "ProfileImage",
                                                                layout: "Circle",
                                                                content: { imageUrl: null, scale: 1, position: { x: 0, y: 0 } },
                                                            };
                                                            newSections.splice(insertIndex, 0, profileSection);
                                                            return { ...prev, sections: newSections };
                                                        }
                                                    });
                                                }}
                                            >
                                                <FaUserSlash />
                                            </button>
                                            <button
                                                className={styles.iconButton}
                                                title="Show/Hide Work Experience"
                                                onClick={() => {
                                                    setDraft(prev => {
                                                        const hasWork = prev.sections.some(s => s.section === "WorkExperience");
                                                        let newSections = [...prev.sections];
                                                        if (hasWork) {
                                                            const removed = newSections.filter(s => s.section === "WorkExperience")[0];
                                                            return {
                                                                ...prev,
                                                                sections: newSections.filter(s => s.section !== "WorkExperience"),
                                                                lastWorkExperienceSection: removed || prev.lastWorkExperienceSection,
                                                            };
                                                        } else {
                                                            let insertIndex = newSections.findIndex(s => s.section === "AboutMe");
                                                            if (insertIndex < 0) insertIndex = newSections.findIndex(s => s.section === "Header");
                                                            if (insertIndex < 0) insertIndex = 0;

                                                            const defaultSection = {
                                                                section: "WorkExperience",
                                                                layout: "Timeline",
                                                                content: {
                                                                    items: [
                                                                        {
                                                                            title: "Work 1",
                                                                            description: "Description 1",
                                                                            startDate: "2025-07",
                                                                            endDate: "Present"
                                                                        }
                                                                    ]
                                                                }
                                                            };
                                                            const workSection = prev.lastWorkExperienceSection || defaultSection;
                                                            newSections.splice(insertIndex + 1, 0, workSection);

                                                            return { ...prev, sections: newSections };
                                                        }
                                                    });
                                                }}
                                            >
                                                <FaBriefcase />
                                            </button>

                                            <button className={styles.primaryButton} onClick={handleSave} disabled={isSaving}>
                                                <FaSave /> Save Portfolio
                                            </button>

                                            <button className={styles.secondaryButton} onClick={handleEditToggle}>
                                                <FaTimes /> Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className={styles.primaryButton} onClick={handleEditToggle}>
                                                <FaEdit /> Edit Portfolio
                                            </button>

                                            {portfolio.id ? (
                                                <button className={styles.dangerButton} onClick={handleDelete}>
                                                    <FaTrash /> Delete
                                                </button>
                                            ) : (
                                                <button className={styles.dangerButton} onClick={() => navigate('/dashboard')}>
                                                    <FaTrash /> Discard
                                                </button>
                                            )}

                                            {portfolio.id && (
                                                <button className={styles.secondaryButton} onClick={() => navigate('/dashboard')}>
                                                    <FaArrowLeft /> Go Back
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>)}
                        </>)}
        </div>
    );
};

export default PortfolioRenderer;