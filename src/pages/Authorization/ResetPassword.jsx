import { useEffect, useState } from 'react';
import AuthLayout from './AuthLayout';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import styles from '../../css/AuthForms.module.css';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [isRecovery, setIsRecovery] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsRecovery(true);
            }
        });

        supabase.auth.getSession().then(({ data }) => {
            if (data.session) setIsRecovery(true);
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    const validatePassword = (pw) => {
        const minLen = pw.length >= 8;
        const hasLetter = /[A-Za-z]/.test(pw);
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pw);
        return minLen && hasLetter && hasSymbol;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirm) {
            setError("Passwords don't match.");
            return;
        }
        if (!validatePassword(password)) {
            setError('Password must be ≥8 chars and include letters & symbols.');
            return;
        }

        setIsSubmitting(true);
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) {
            setError('Could not reset password. Try again.');
            setIsSubmitting(false);
            return;
        }

        alert('Password reset successful! Please log in with your new password.');
        navigate('/login');
    };

    if (!isRecovery) {
        return (
            <AuthLayout>
                <div className={styles.authForm}>
                    <h2 className={styles.formTitle}>Invalid or expired link</h2>
                    <p className={styles.formText}>Please request another password reset.</p>
                    <button 
                        className={styles.primaryButton}
                        onClick={() => navigate('/login')}
                    >
                        Back to Login
                    </button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <form className={styles.authForm} onSubmit={handleSubmit}>
                <h2 className={styles.formTitle}>Reset Your Password</h2>
                
                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>New Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        className={styles.formInput}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Confirm Password</label>
                    <input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Confirm new password"
                        className={styles.formInput}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </AuthLayout>
    );
}