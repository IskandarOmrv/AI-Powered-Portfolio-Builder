import { useState, useEffect } from 'react';
import AuthLayout from './AuthLayout';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import styles from '../../css/AuthForms.module.css';

const STORAGE_KEY = "signup_form";

const SignUp = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : {
            firstName: '',
            lastName: '',
            email: '',
            password: ''
        };
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');

    const validateName = (name) => {
        const regex = /^[A-Za-z]{2,20}$/;
        return regex.test(name);
    };

    const validatePassword = (password) => {
        const minLength = password.length >= 8;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return minLength && hasLetter && hasSymbol;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const displayPopup = (message) => {
        setPopupMessage(message);
        setShowPopup(true);
        setTimeout(() => {
            setShowPopup(false);
        }, 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const { email, password, firstName, lastName } = form;

        if (!validateName(firstName) || !validateName(lastName)) {
            setError('First and last names must be 2-20 letters, English alphabet only.');
            setIsSubmitting(false);
            return;
        }

        if (!validatePassword(password)) {
            setError('Password must be ≥8 chars and include letters & symbols.');
            setIsSubmitting(false);
            return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signUpError) {
            if (signUpError.message.toLowerCase().includes('already registered')) {
                setError('Email already in use. Please try another.');
            } else {
                setError('Signup failed. Please try again.');
            }
            setIsSubmitting(false);
            return;
        }

        const userId = data.user.id;

        const { error: dbError } = await supabase.from('users').insert([
            {
                id: userId,
                email,
                first_name: firstName,
                last_name: lastName,
                role: 'user',
            }
        ]);

        if (dbError) {
            setError('Email already in use. Please try another');
            setIsSubmitting(false);
            return;
        }

        displayPopup('Sign up successful! Please check your email to confirm your account.');
        localStorage.removeItem(STORAGE_KEY);
        navigate('/login');
    };

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    }, [form]);

    return (
        <AuthLayout>
            <form className={styles.authForm} onSubmit={handleSubmit}>
                <h2 className={styles.formTitle}>Create Account</h2>

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

                <div className={styles.nameFields}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            onChange={handleChange}
                            value={form.firstName}
                            placeholder="Enter your first name"
                            className={styles.formInput}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            onChange={handleChange}
                            value={form.lastName}
                            placeholder="Enter your last name"
                            className={styles.formInput}
                            required
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email</label>
                    <input
                        type="email"
                        name="email"
                        onChange={handleChange}
                        value={form.email}
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
                        onChange={handleChange}
                        value={form.password}
                        placeholder="Create a password"
                        className={styles.formInput}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Creating account..." : "Sign Up"}
                </button>

                <p className={styles.authLink}>
                    Already have an account? <a href="/login" className={styles.link}>Log in</a>
                </p>
            </form>
        </AuthLayout>
    );
};

export default SignUp;