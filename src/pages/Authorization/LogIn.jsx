import { useState, useEffect } from 'react';
import AuthLayout from './AuthLayout';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import styles from '../../css/AuthForms.module.css';

const STORAGE_KEY = "login_form";

const Login = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [showEmailPopup, setShowEmailPopup] = useState(false);
    const [emailInput, setEmailInput] = useState('');

    const [form, setForm] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : { email: '', password: '' };
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleForgotPassword = async () => {
        setShowEmailPopup(true);
    };

    const handleEmailSubmit = async () => {
        if (!emailInput) {
            displayPopup('Email is required for password reset.');
            setShowEmailPopup(false);
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(emailInput, {
            redirectTo: window.location.origin + '/resetpassword'
        });

        if (error) {
            displayPopup('Error sending password reset email. Please try again.');
        } else {
            displayPopup('Password reset email sent successfully. Please check your inbox.');
        }
        setShowEmailPopup(false);
        setEmailInput('');
    };

    const validatePassword = (password) => {
        const minLength = password.length >= 8;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return minLength && hasLetter && hasSymbol;
    };

    const displayPopup = (message) => {
        setPopupMessage(message);
        setShowPopup(true);
        setTimeout(() => {
            setShowPopup(false);
        }, 5000);
    };

    useEffect(() => {
        let mounted = true;
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session && mounted) navigate('/dashboard');
        });
        return () => { mounted = false; };
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const { email, password } = form;

        if (!validatePassword(password)) {
            setError('Password must be ≥8 chars and include letters & symbols.');
            setIsSubmitting(false);
            return;
        }

        const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (loginError) {
            setError('Invalid email or password. Please try again.');
            setIsSubmitting(false);
            return;
        }
        localStorage.removeItem(STORAGE_KEY);
        navigate('/dashboard');
    };

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    }, [form]);

    return (
        <AuthLayout>
            <form className={styles.authForm} onSubmit={handleSubmit}>
                <h2 className={styles.formTitle}>Welcome Back</h2>

                {showPopup && (
                    <div className={styles.popupMessage}>
                        <span>{popupMessage}</span>
                        <button
                            className={styles.popupClose}
                            onClick={() => setShowPopup(false)}
                        >
                            ×
                        </button>
                    </div>
                )}

                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className={styles.formInput}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className={styles.formInput}
                        required
                    />
                </div>

                <div className={styles.formOptions}>
                    <button
                        type="button"
                        className={styles.forgotPassword}
                        onClick={handleForgotPassword}
                    >
                        Forgot password?
                    </button>
                </div>

                <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Logging in..." : "Log In"}
                </button>

                <p className={styles.authLink}>
                    Don't have an account? <a href="/signup" className={styles.link}>Sign up</a>
                </p>

                {showEmailPopup && (
                    <div className={styles.emailPopupOverlay}>
                        <div className={styles.emailPopup}>
                            <h3 className={styles.popupTitle}>Reset Password</h3>
                            <p className={styles.popupText}>Please enter your email to reset your password:</p>
                            <input
                                type="email"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                placeholder="Your email"
                                className={styles.popupInput}
                            />
                            <div className={styles.popupButtons}>
                                <button
                                    type="button"
                                    className={styles.secondaryButton}
                                    onClick={() => setShowEmailPopup(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    onClick={handleEmailSubmit}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </AuthLayout>
    );
};

export default Login;