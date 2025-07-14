import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import styles from '../css/AccountSettings.module.css';

const BackIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CrossIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const AccountSettings = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({ first_name: '', last_name: '', email: '' });
    const [loading, setLoading] = useState(true);

    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [deletePassword, setDeletePassword] = useState('');

    const [profileStatus, setProfileStatus] = useState({ message: '', type: '' });
    const [emailStatus, setEmailStatus] = useState({ message: '', type: '' });
    const [passwordStatus, setPasswordStatus] = useState({ message: '', type: '' });
    const [deleteStatus, setDeleteStatus] = useState({ message: '', type: '' });
    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function loadUser() {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }
            setUser(session.user);

            const { data, error } = await supabase
                .from('users')
                .select('first_name, last_name, email, plan, plan_expires_at')
                .eq('id', session.user.id)
                .single();

            if (error) {
                setProfileStatus({ message: 'Failed to load profile', type: 'error' });
            } else {
                setProfile(data);
                setNewFirstName(data.first_name || '');
                setNewLastName(data.last_name || '');
                setNewEmail(data.email || '');
            }
            setLoading(false);
        }
        loadUser();
    }, [navigate]);

    const validateName = (name) => {
        if (name.length < 2) return 'Must be at least 2 characters';
        if (!/^[a-zA-Z]+$/.test(name)) return 'Only English letters allowed';
        return '';
    };

    const validateEmail = (email) => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
        return '';
    };

    const validatePassword = (password) => {
        const rules = {
            length: password.length >= 8,
            letter: /[a-zA-Z]/.test(password),
            symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            number: /[0-9]/.test(password)
        };

        if (!rules.length) return 'Must be at least 8 characters';
        if (!rules.letter) return 'Must contain at least one letter';
        if (!rules.symbol) return 'Must contain at least one symbol';
        if (!rules.number) return 'Must contain at least one number';
        return '';
    };

    const getPasswordStrength = (password) => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[a-zA-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;
        return strength;
    };

    const handleFirstNameChange = (e) => {
        const value = e.target.value;
        setNewFirstName(value);
        setErrors({ ...errors, firstName: validateName(value) });
    };

    const handleLastNameChange = (e) => {
        const value = e.target.value;
        setNewLastName(value);
        setErrors({ ...errors, lastName: validateName(value) });
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setNewEmail(value);
        setErrors({ ...errors, email: validateEmail(value) });
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);
        setErrors({ ...errors, password: validatePassword(value) });

        if (confirmPassword && value !== confirmPassword) {
            setErrors({ ...errors, password: errors.password, confirmPassword: 'Passwords do not match' });
        } else {
            setErrors({ ...errors, password: errors.password, confirmPassword: '' });
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);

        if (newPassword !== value) {
            setErrors({ ...errors, confirmPassword: 'Passwords do not match' });
        } else {
            setErrors({ ...errors, confirmPassword: '' });
        }
    };

    const hasProfileChanges = () => {
        return newFirstName !== profile.first_name || newLastName !== profile.last_name;
    };

    const hasEmailChanges = () => {
        return newEmail !== profile.email;
    };

    const showStatusMessage = (setter, message, type = 'info') => {
        setter({ message, type });
        setTimeout(() => setter({ message: '', type: '' }), 4000);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (!hasProfileChanges()) return;

        showStatusMessage(setProfileStatus, 'Updating profile...');
        const { error } = await supabase
            .from('users')
            .update({ first_name: newFirstName, last_name: newLastName })
            .eq('id', user.id);

        if (error) {
            showStatusMessage(setProfileStatus, 'Failed to update profile', 'error');
        } else {
            setProfile({ ...profile, first_name: newFirstName, last_name: newLastName });
            showStatusMessage(setProfileStatus, 'Profile updated successfully!', 'success');
        }
    };

    const prepareEmailUpdate = (e) => {
        e.preventDefault();
        if (!hasEmailChanges()) return;

        setPendingEmail(newEmail);
        setShowConfirmation(true);
    };

    const confirmEmailUpdate = async () => {
        setShowConfirmation(false);
        showStatusMessage(setEmailStatus, 'Updating email...');

        const { error } = await supabase.auth.updateUser({ email: pendingEmail });
        if (error) {
            showStatusMessage(setEmailStatus, `Failed to update email: ${error.message}`, 'error');
        } else {
            setProfile({ ...profile, email: pendingEmail });
            showStatusMessage(setEmailStatus, 'Email update requested. Please check your inbox to confirm.', 'success');
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (!newPassword || !oldPassword || errors.password || errors.confirmPassword) return;

        showStatusMessage(setPasswordStatus, 'Checking password...');
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email: profile.email,
            password: oldPassword,
        });

        if (loginError) {
            showStatusMessage(setPasswordStatus, 'Incorrect current password.', 'error');
            return;
        }

        showStatusMessage(setPasswordStatus, 'Updating password...');
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            showStatusMessage(setPasswordStatus, `Failed to update password: ${error.message}`, 'error');
        } else {
            showStatusMessage(setPasswordStatus, 'Password updated successfully!', 'success');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        if (!deletePassword) return;

        showStatusMessage(setDeleteStatus, 'Checking password...');
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email: profile.email,
            password: deletePassword,
        });

        if (loginError) {
            showStatusMessage(setDeleteStatus, 'Incorrect password!', 'error');
            return;
        }

        showStatusMessage(setDeleteStatus, 'Deleting account...');
        await supabase.from('users').delete().eq('id', user.id);
        await supabase.auth.signOut();
        showStatusMessage(setDeleteStatus, 'Account deleted. Logging out...', 'success');
        setTimeout(() => navigate('/'), 1500);
    };

    if (loading) return <div className={styles.loading}>Loading your settings...</div>;




    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <h1 className={styles.header}>Account Settings</h1>
                <button className={styles.backButton} onClick={() => navigate('/dashboard')}>
                    <BackIcon />
                    Back
                </button>
            </div>

            {/* Profile Section */}
            {profile?.plan && profile.plan !== "free" && (
                <div style={{
                    margin: "1.5rem 0 1rem 0",
                    padding: "1rem 1.2rem",
                    border: "1px solid #e0e7ef",
                    borderRadius: 12,
                    background: "#f7fafc"
                }}>
                    <h4 style={{ margin: 0, color: "#3b82f6", fontWeight: 700 }}>Subscription Info</h4>
                    <div style={{ marginTop: 6 }}>
                        <span style={{ fontWeight: 500, color: "#222" }}>
                            Plan:&nbsp;
                        </span>
                        <span
                            style={{
                                textTransform: "capitalize",
                                color: "#2563eb",
                                fontWeight: 600,
                                cursor: "pointer",
                                textDecoration: "underline"
                            }}
                            onClick={() => navigate('/pricing')}
                            title="See pricing/upgrade options"
                        >
                            {profile.plan}
                        </span>
                    </div>
                    {profile.plan_expires_at && (
                        <div style={{ marginTop: 2, color: "#6b7280" }}>
                            Expiration:&nbsp;
                            <b>
                                {new Date(profile.plan_expires_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </b>
                        </div>
                    )}
                    <div style={{ marginTop: 12, color: "#6b7280", fontSize: 14 }}>
                        To cancel or manage your subscription, visit your&nbsp;
                        <a
                            href="https://www.paypal.com/myaccount/autopay/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#2563eb", textDecoration: "underline" }}
                        >
                            PayPal Subscriptions
                        </a>
                        &nbsp;page.
                    </div>
                </div>
            )}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Profile Information</h2>
                <form onSubmit={handleProfileUpdate}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>First Name</label>
                        <input
                            className={styles.input}
                            value={newFirstName}
                            onChange={handleFirstNameChange}
                            required
                        />
                        {errors.firstName && <div className={styles.errorText}>{errors.firstName}</div>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Last Name</label>
                        <input
                            className={styles.input}
                            value={newLastName}
                            onChange={handleLastNameChange}
                            required
                        />
                        {errors.lastName && <div className={styles.errorText}>{errors.lastName}</div>}
                    </div>

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={!hasProfileChanges() || errors.firstName || errors.lastName}
                    >
                        Save Profile
                    </button>

                    {profileStatus.message && (
                        <div className={`${styles.sectionStatus} ${styles[`section${profileStatus.type.charAt(0).toUpperCase() + profileStatus.type.slice(1)}`]}`}>
                            {profileStatus.message}
                        </div>
                    )}
                </form>
            </div>

            {/* Email Section */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Email Address</h2>
                <form onSubmit={prepareEmailUpdate}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            className={styles.input}
                            value={newEmail}
                            onChange={handleEmailChange}
                            required
                        />
                        {errors.email && <div className={styles.errorText}>{errors.email}</div>}
                    </div>

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={!hasEmailChanges() || errors.email}
                    >
                        Update Email
                    </button>
                    <p className={styles.note}>A confirmation email will be sent to the new address.</p>

                    {emailStatus.message && (
                        <div className={`${styles.sectionStatus} ${styles[`section${emailStatus.type.charAt(0).toUpperCase() + emailStatus.type.slice(1)}`]}`}>
                            {emailStatus.message}
                        </div>
                    )}
                </form>
            </div>

            {/* Password Section */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Change Password</h2>
                <form onSubmit={handlePasswordUpdate}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Current Password</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>New Password</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={newPassword}
                            onChange={handlePasswordChange}
                            required
                            minLength={8}
                        />
                        {newPassword && ( 
                            <>
                                <div className={styles.passwordStrength}>
                                    <div
                                        className={styles.passwordStrengthBar}
                                        style={{ width: `${getPasswordStrength(newPassword)}%` }}
                                    />
                                </div>
                                <div className={styles.passwordRules}>
                                    <div className={`${styles.passwordRule} ${newPassword.length >= 8 ? styles.ruleValid : styles.ruleInvalid}`}>
                                        {newPassword.length >= 8 ? <CheckIcon /> : <CrossIcon />}
                                        <span>At least 8 characters</span>
                                    </div>
                                    <div className={`${styles.passwordRule} ${/[a-zA-Z]/.test(newPassword) ? styles.ruleValid : styles.ruleInvalid}`}>
                                        {/[a-zA-Z]/.test(newPassword) ? <CheckIcon /> : <CrossIcon />}
                                        <span>Contains letters</span>
                                    </div>
                                    <div className={`${styles.passwordRule} ${/[0-9]/.test(newPassword) ? styles.ruleValid : styles.ruleInvalid}`}>
                                        {/[0-9]/.test(newPassword) ? <CheckIcon /> : <CrossIcon />}
                                        <span>Contains numbers</span>
                                    </div>
                                    <div className={`${styles.passwordRule} ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? styles.ruleValid : styles.ruleInvalid}`}>
                                        {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? <CheckIcon /> : <CrossIcon />}
                                        <span>Contains symbols</span>
                                    </div>
                                </div>
                            </>
                        )}
                        {errors.password && <div className={styles.errorText}>{errors.password}</div>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Confirm New Password</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            required
                            minLength={8}
                        />
                        {errors.confirmPassword && <div className={styles.errorText}>{errors.confirmPassword}</div>}
                    </div>

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={!newPassword || !oldPassword || !confirmPassword || errors.password || errors.confirmPassword}
                    >
                        Update Password
                    </button>

                    {passwordStatus.message && (
                        <div className={`${styles.sectionStatus} ${styles[`section${passwordStatus.type.charAt(0).toUpperCase() + passwordStatus.type.slice(1)}`]}`}>
                            {passwordStatus.message}
                        </div>
                    )}
                </form>
            </div>

            {/* Delete Account Section */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Delete Account</h2>
                <form onSubmit={handleDeleteAccount}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Enter your password to confirm</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`${styles.button} ${styles.deleteButton}`}
                        disabled={!deletePassword}
                    >
                        Delete Account
                    </button>
                    <p className={styles.warningNote}>
                        This will permanently remove your account and all associated data. This action cannot be undone.
                    </p>

                    {deleteStatus.message && (
                        <div className={`${styles.sectionStatus} ${styles[`section${deleteStatus.type.charAt(0).toUpperCase() + deleteStatus.type.slice(1)}`]}`}>
                            {deleteStatus.message}
                        </div>
                    )}
                </form>
            </div>

            {/* Email Change Confirmation Modal */}
            {showConfirmation && (
                <div className={styles.confirmationModal}>
                    <div className={styles.confirmationContent}>
                        <h3 className={styles.confirmationTitle}>Confirm Email Change</h3>
                        <p className={styles.confirmationText}>
                            Are you sure you want to change your email to <strong>{pendingEmail}</strong>?
                        </p>
                        <p className={styles.confirmationText}>
                            A confirmation email will be sent to this address. You'll need to verify the new email address to complete the change.
                        </p>
                        <div className={styles.confirmationButtons}>
                            <button
                                className={styles.button}
                                onClick={() => setShowConfirmation(false)}
                                style={{ background: '#f0f0f0', color: '#333' }}
                            >
                                Cancel
                            </button>
                            <button
                                className={`${styles.button} ${styles.deleteButton}`}
                                onClick={confirmEmailUpdate}
                            >
                                Confirm Change
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountSettings;