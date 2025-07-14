import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import styles from '../css/Dashboard.module.css';
import logo from '../assets/Logo_128.png';


const AdminIcon = () => (
  <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 12a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 12v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


const SettingsIcon = () => (
  <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LogoutIcon = () => (
  <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BlogIcon = () => (
  <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 21v-8a2 2 0 00-2-2H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 7h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 11h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 15h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PricingIcon = () => (
  <svg className={styles.menuIcon}  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2v4m0 12v4M6 12H2m20 0h-4m1.078 7.078L16.25 16.25M19.078 5 16.25 7.828M4.922 19.078 7.75 16.25M4.922 5 7.75 7.828" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ firstName: '', lastName: '', role: '', banned: '' });
  const [portfolios, setPortfolios] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [loadingPortfolios, setLoadingPortfolios] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [portfolioToDelete, setPortfolioToDelete] = useState(null);
  const [showPlanExpired, setShowPlanExpired] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [showGeneratePopup, setShowGeneratePopup] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);



  useEffect(() => {
    const fetchProfile = async () => {

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          navigate('/login');
          return;
        }

        const userId = sessionData.session.user.id;

        const [
          { data: profile, error: profileError },
          { data: pfData },
          { data: resumesData }
        ] = await Promise.all([
          supabase
            .from('users')
            .select('first_name, last_name, role, banned, plan, plan_expires_at')
            .eq('id', userId)
            .single(),
          supabase
            .from('portfolios')
            .select('*')
            .eq('user_id', userId),
          supabase
            .from('resumes')
            .select('*')
            .eq('user_id', userId)
        ]);

        if (profileError) {
          console.error(profileError.message);
          navigate('/login');
          return;
        }

        if (
          profile.plan &&
          profile.plan !== 'free' &&
          profile.plan_expires_at &&
          new Date(profile.plan_expires_at) < new Date()
        ) {
          await supabase
            .from('users')
            .update({ plan: 'free', plan_expires_at: null })
            .eq('id', userId);
          setShowPlanExpired(true);
        }


        setUser({
          firstName: profile.first_name,
          lastName: profile.last_name,
          role: profile.role,
          banned: profile.banned,
        });

        setPortfolios(pfData || []);
        setResumes(resumesData || []);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoadingPortfolios(false);
        setLoadingResumes(false);
      }
    };

    fetchProfile();
  }, [navigate]);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  useEffect(() => {
    if (user.banned) {
      navigate('/banned');
    }
  }, [user.banned, navigate]);


  const pageReady = !loadingPortfolios && !loadingResumes;

  return (
    <div className={styles.container}>
      {showPlanExpired && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Plan Expired</h2>
            <p className={styles.modalText}>Your subscription has expired and you have been downgraded to the Free plan.</p>
            <button
              className={styles.modalButton}
              onClick={() => setShowPlanExpired(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <img
            src={logo}
            alt="Logo"
            width={32}
            height={32}
          />
          <span className={styles.siteName}>AI Portfolio Builder</span>
        </div>

        <div className={styles.userMenuContainer}>
          <div
            className={styles.userInfo}
            onClick={() => setShowMenu(!showMenu)}
          >
            <div className={styles.userInitials}>{initials}</div>
            <span className={styles.userName}>{user.firstName} {user.lastName}</span>
          </div>

          {showMenu && (
            <div className={styles.menuDropdown}>
              {user.role === 'admin' && (
                <div
                  className={styles.menuItem}
                  onClick={() => navigate('/admin')}
                >
                  <AdminIcon/>
                  Admin Panel
                </div>
              )}
              <div
                className={styles.menuItem}
                onClick={() => navigate('/settings')}
              >
                <SettingsIcon />
                Settings
              </div>
              <div
                className={styles.menuItem}
                onClick={() => navigate('/blog')}
              >
                <BlogIcon />
                Blog
              </div>
              <div
                className={styles.menuItem}
                onClick={() => navigate('/pricing')}
              >
                <PricingIcon/>
                Pricing
              </div>
              <div
                className={`${styles.menuItem} ${styles.logoutItem}`}
                onClick={handleLogout}
              >
                <LogoutIcon />
                Log Out
              </div>
            </div>
          )}
        </div>
      </header>

      <main className={styles.mainContent}>
        <main className={styles.mainContent}>
          <div className={styles.actionsContainer}>
            <button
              className={styles.generateButton}
              onClick={() => setShowGeneratePopup(true)}
            >
              Generate
            </button>
          </div>

          {showGeneratePopup && (
            <div className={styles.modalOverlay} onClick={() => setShowGeneratePopup(false)}>
              <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={styles.closeButton}
                  onClick={() => setShowGeneratePopup(false)}
                  aria-label="Close"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <h2 className={styles.modalTitle}>Create New Document</h2>
                <p className={styles.modalSubtitle}>Select what you'd like to generate</p>

                <div className={styles.modalOptions}>
                  <button
                    className={styles.modalOption}
                    onClick={() => {
                      setShowGeneratePopup(false);
                      navigate('/forumpage');
                    }}
                  >
                    <div className={styles.optionIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className={styles.optionContent}>
                      <h3>Portfolio</h3>
                      <p>Beautiful, customizable portfolio website</p>
                    </div>
                    <div className={styles.optionArrow}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>

                  <button
                    className={styles.modalOption}
                    onClick={() => {
                      setShowGeneratePopup(false);
                      navigate('/forumpage_resume');
                    }}
                  >
                    <div className={styles.optionIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H6C5.46957 3 4.96086 3.21071 4.58579 3.58579C4.21071 3.96086 4 4.46957 4 5V21M22 21H10M22 17H10M10 17H4M16 17H14M7 7H13M7 11H13M7 15H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className={styles.optionContent}>
                      <h3>Resume(DEMO)</h3>
                      <p>Professional resume/CV document</p>
                    </div>
                    <div className={styles.optionArrow}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
          {!pageReady ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
            </div>
          ) : (
            <>
              {!(loadingPortfolios || loadingResumes) && (
                <>
                  {/* Portfolios Section */}
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Your Portfolios</h2>
                    {portfolios.length > 0 ? (
                      <div className={styles.portfolioGrid}>
                        {portfolios.map((p) => (
                          <div className={styles.portfolioCard} key={p.id}>
                            <button
                              className={styles.deleteButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPortfolioToDelete(p.id);
                                setShowDeleteConfirm(true);
                              }}
                              title="Delete"
                            >
                              ×
                            </button>
                            <div className={styles.cardTitle}>
                              {p.content.sections.find(sec => sec.section === "Header")?.content?.firstName || 'Portfolio'} {p.content.sections.find(sec => sec.section === "Header")?.content?.lastName || ''}
                            </div>
                            <div className={styles.cardDate}>
                              Created: {p.content.createdAt ? new Date(p.content.createdAt).toLocaleDateString() : "No date"}
                            </div>
                            <div className={styles.cardTheme}>
                              Theme: {p.content.theme || "N/A"}
                            </div>
                            <button
                              className={styles.cardButton}
                              onClick={() => navigate(`/portfolio/${p.id}`)}
                            >
                              View
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyState}>
                        <p className={styles.emptyMessage}>You haven't created any portfolios yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Resumes Section */}
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Your Resumes</h2>
                    {resumes.length > 0 ? (
                      <div className={styles.portfolioGrid}>
                        {resumes.map((resume) => (
                          <div className={styles.portfolioCard} key={resume.id}>
                            <button
                              className={styles.deleteButton}
                              onClick={e => {
                                e.stopPropagation();
                                setResumeToDelete(resume.id);
                                setShowDeleteConfirm(true);
                              }}
                              title="Delete"
                            >
                              ×
                            </button>
                            <div className={styles.cardTitle}>
                              {resume.data?.name || "Unnamed Resume"}
                            </div>
                            <div className={styles.cardDate}>
                              Created: {resume.created_at ? new Date(resume.created_at).toLocaleDateString() : "No date"}
                            </div>
                            <div className={styles.cardTheme}>
                              Theme: {resume.theme || resume.data?.theme || "N/A"}
                            </div>
                            <button
                              className={styles.cardButton}
                              onClick={() => navigate(`/resume/view_resume/${resume.id}`)}
                            >
                              View
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyState}>
                        <p className={styles.emptyMessage}>You haven't created any resumes yet.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </main >

      {showDeleteConfirm && (
        <div className={styles.confirmationDialog}>
          <div className={styles.confirmationContent}>
            <h3 className={styles.confirmationTitle}>
              Delete {portfolioToDelete ? "Portfolio" : "Resume"}
            </h3>
            <p className={styles.confirmationMessage}>
              Are you sure you want to delete this {portfolioToDelete ? "portfolio" : "resume"}? This action cannot be undone.
            </p>
            <div className={styles.confirmationButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPortfolioToDelete(null);
                  setResumeToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className={styles.confirmButton}
                onClick={async () => {
                  try {
                    if (portfolioToDelete) {
                      await supabase.from('portfolios').delete().eq('id', portfolioToDelete);
                      setPortfolios(portfolios.filter(p => p.id !== portfolioToDelete));
                      setPortfolioToDelete(null);
                    }
                    if (resumeToDelete) {
                      await supabase.from('resumes').delete().eq('id', resumeToDelete);
                      setResumes(resumes.filter(r => r.id !== resumeToDelete));
                      setResumeToDelete(null);
                    }
                  } catch (error) {
                    console.error('Delete error:', error);
                  } finally {
                    setShowDeleteConfirm(false);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div >
  );
};

export default Dashboard;