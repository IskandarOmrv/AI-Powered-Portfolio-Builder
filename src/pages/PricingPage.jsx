import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import styles from '../css/PricingPage.module.css';

const plans = {
    simple: {
        title: "Simple",
        monthlyPrice: 2,
        annualPrice: 20,
        features: [
            "Save up to 6 portfolios",
            "Access to all basic layouts",
            "Standard support"
        ],
        highlight: false
    },
    premium: {
        title: "Premium",
        monthlyPrice: 5,
        annualPrice: 48,
        features: [
            "Unlimited portfolios",
            "All layouts, including premium",
            "Priority support",
            "Early access to new features"
        ],
        highlight: true
    }
};

function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}
function addYears(date, years) {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
}
function formatExpiryDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

const PricingPage = () => {
    const [currentUserPlan, setCurrentUserPlan] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [planExpiresAt, setPlanExpiresAt] = useState(null);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [modal, setModal] = useState({ isOpen: false, message: '', type: '' });
    const [showPayment, setShowPayment] = useState(false);
    const [paymentFor, setPaymentFor] = useState(null);
    const [isPaying, setIsPaying] = useState(false);

    const [card, setCard] = useState({
        number: '',
        name: '',
        expiry: '',
        cvc: ''
    });
    const [cardError, setCardError] = useState('');

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user?.id) {
                setCurrentUserId(session.user.id);
                const { data, error } = await supabase
                    .from('users')
                    .select('plan, plan_expires_at')
                    .eq('id', session.user.id)
                    .single();
                if (error) {
                    setModal({
                        isOpen: true,
                        message: "Error occurred while connecting to database. Please refresh the page.",
                        type: 'error'
                    });
                    return;
                }
                setCurrentUserPlan(data?.plan || null);
                setPlanExpiresAt(data?.plan_expires_at || null);
            }
        });
    }, []);

    const validateCard = () => {
        const { number, name, expiry, cvc } = card;

        if (!/^\d{16}$/.test(number.replace(/\s/g, ''))) {
            return "Card number must be 16 digits.";
        }

        if (!/^[a-zA-Z ]{2,}$/.test(name)) {
            return "Cardholder name required.";
        }
        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            return "Expiry format MM/YY.";
        }
        const [month, year] = expiry.split('/');
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        if (parseInt(month) < 1 || parseInt(month) > 12) {
            return "Invalid month.";
        }

        if (parseInt(year) < currentYear ||
            (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
            return "Card has expired.";
        }

        if (!/^\d{3}$/.test(cvc)) {
            return "CVC must be 3 digits.";
        }

        return "";
    };

    async function upgradePlan(plan, cycle) {
        let expires;
        const now = new Date();
        if (cycle === "monthly") expires = addMonths(now, 1);
        if (cycle === "annual") expires = addYears(now, 1);

        const { error } = await supabase
            .from('users')
            .update({ plan, plan_expires_at: expires.toISOString() })
            .eq('id', currentUserId);

        return error;
    }

    const handleCheckout = (planKey) => {
        if (currentUserPlan === 'premium' && planKey === 'simple') {
            setModal({
                isOpen: true,
                message: "You already have Premium plan which includes all Simple plan features.",
                type: 'error'
            });
            return;
        }
        if (currentUserPlan === planKey) {
            setModal({
                isOpen: true,
                message: `You already have the ${planKey} plan.`,
                type: 'error'
            });
            return;
        }
        setPaymentFor(planKey);
        setShowPayment(true);
    };

    const handlePayment = async () => {
        setCardError('');
        const err = validateCard();
        if (err) {
            setCardError(err);
            return;
        }
        setIsPaying(true);
        setTimeout(async () => {
            const error = await upgradePlan(paymentFor, billingCycle);
            setIsPaying(false);
            setShowPayment(false);
            setCard({ number: '', name: '', expiry: '', cvc: '' });
            if (error) {
                setModal({
                    isOpen: true,
                    message: "Failed to update plan. Please try again.",
                    type: 'error'
                });
            } else {
                setCurrentUserPlan(paymentFor);
                setModal({
                    isOpen: true,
                    message: "Payment successful! Your plan is now active.",
                    type: 'success'
                });
            }
        }, 1400);
    };

    return (
        <div className={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={styles.wrapper}
            >
                <div className={styles.header}>
                    <h1 className={styles.title}>Pricing Plans</h1>
                    <p className={styles.subtitle}>Choose the plan that fits your needs</p>
                </div>
                {/* Billing toggle */}
                <div className={styles.billingToggle}>
                    <div className={styles.toggleGroup}>
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`${styles.toggleButton} ${billingCycle === 'monthly' ? styles.toggleButtonActive : ''}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('annual')}
                            className={`${styles.toggleButton} ${billingCycle === 'annual' ? styles.toggleButtonActive : ''}`}
                        >
                            Annual (20% off)
                        </button>
                    </div>
                </div>

                {/* Plans */}
                <div className={styles.plansGrid}>
                    {Object.entries(plans).map(([key, plan]) => (
                        <motion.div
                            key={key}
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className={`${styles.planCard} ${plan.highlight ? styles.planCardHighlight : ''}`}
                        >
                            <div className={styles.planContent}>
                                <h3 className={`${styles.planTitle} ${plan.highlight ? styles.planTitleHighlight : ''}`}>
                                    {plan.title}
                                </h3>
                                <div className={styles.priceContainer}>
                                    <span className={`${styles.price} ${plan.highlight ? styles.priceHighlight : ''}`}>
                                        ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                                    </span>
                                    <span className={styles.pricePeriod}>
                                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                                    </span>
                                </div>
                                <ul className={styles.featuresList}>
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className={styles.featureItem}>
                                            <svg className={styles.featureIcon} width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#10b981">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                {/* Current plan */}
                                {currentUserPlan === key && planExpiresAt ? (
                                    <div className={styles.currentPlan}>
                                        <p className={styles.currentPlanTitle}>Your current plan</p>
                                        <p className={styles.currentPlanExpiry}>Expires on {formatExpiryDate(planExpiresAt)}</p>
                                    </div>
                                ) : (
                                    <div className={styles.currentPlanPlaceholder}></div>
                                )}

                                <div className={styles.buttonContainer}>
                                    {currentUserPlan === key ? (
                                        <button className={`${styles.planButton} ${styles.planButtonDisabled}`} disabled>
                                            Purchased
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                className={`${styles.planButton} ${plan.highlight ? styles.planButtonPrimary : styles.planButtonSecondary}`}
                                                onClick={() => handleCheckout(key)}
                                            >
                                                {`Subscribe (${billingCycle === 'monthly' ? 'Monthly' : 'Annually'})`}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
                {/* Payment Modal */}
                {showPayment && (
                    <div className={styles.modalOverlay}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={styles.paymentModal}
                        >
                            <div className={styles.paymentHeader}>
                                <h3 className={styles.paymentTitle}>Payment Details</h3>
                                <button
                                    className={styles.paymentClose}
                                    onClick={() => {
                                        setShowPayment(false);
                                        setCardError('');
                                        setCard({ number: '', name: '', expiry: '', cvc: '' });
                                    }}
                                    disabled={isPaying}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Card Preview */}
                            <div className={styles.cardPreview}>
                                <div className={styles.cardChip}></div>
                                <img
                                    src="https://www.svgrepo.com/show/333620/visa.svg"
                                    alt="Visa"
                                    className={styles.cardLogo}
                                />
                                <div className={styles.cardNumber}>
                                    {card.number ? card.number : '•••• •••• •••• ••••'}
                                </div>
                                <div className={styles.cardDetails}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Card Holder</div>
                                        <div>{card.name ? card.name : 'YOUR NAME'}</div>
                                    </div>
                                    <div className={styles.cardExpiry}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Expires</div>
                                            <div>{card.expiry ? card.expiry : 'MM/YY'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>CVC</div>
                                            <div>{card.cvc ? '•••' : '•••'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.paymentForm}>
                                <div className={styles.paymentInputGroup}>
                                    <label className={styles.paymentLabel}>Card Number</label>
                                    <input
                                        type="text"
                                        className={styles.paymentInput}
                                        maxLength={19}
                                        inputMode="numeric"
                                        autoComplete="cc-number"
                                        placeholder="1234 5678 9012 3456"
                                        value={card.number}
                                        onChange={e => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            let formatted = value.replace(/(\d{4})/g, '$1 ').trim();
                                            if (formatted.length > 19) formatted = formatted.substring(0, 19);
                                            setCard(c => ({ ...c, number: formatted }));
                                        }}
                                    />
                                </div>

                                <div className={styles.paymentInputGroup}>
                                    <label className={styles.paymentLabel}>Cardholder Name</label>
                                    <input
                                        type="text"
                                        className={styles.paymentInput}
                                        placeholder="John Doe"
                                        value={card.name}
                                        onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
                                    />
                                </div>

                                <div className={styles.paymentRow}>
                                    <div className={styles.paymentHalf}>
                                        <label className={styles.paymentLabel}>Expiry Date</label>
                                        <input
                                            type="text"
                                            className={styles.paymentInput}
                                            maxLength={5}
                                            placeholder="MM/YY"
                                            value={card.expiry}
                                            onChange={e => {
                                                let value = e.target.value.replace(/[^0-9/]/g, '');
                                                if (value.length === 2 && !value.includes('/')) {
                                                    value = value + '/';
                                                }
                                                if (value.length > 5) value = value.substring(0, 5);

                                                if (value.length >= 2) {
                                                    const month = parseInt(value.substring(0, 2));
                                                    if (month > 12) {
                                                        value = '12' + value.substring(2);
                                                    }
                                                }

                                                setCard(c => ({ ...c, expiry: value }));
                                            }}
                                        />
                                    </div>
                                    <div className={styles.paymentHalf}>
                                        <label className={styles.paymentLabel}>CVC</label>
                                        <input
                                            type="text"
                                            className={styles.paymentInput}
                                            maxLength={3}
                                            inputMode="numeric"
                                            placeholder="123"
                                            value={card.cvc}
                                            onChange={e => setCard(c => ({ ...c, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                                        />
                                    </div>
                                </div>

                                {cardError && <div className={styles.paymentError}>{cardError}</div>}

                                <div className={styles.paymentActions}>
                                    <button
                                        className={`${styles.paymentButton} ${styles.paymentButtonSecondary}`}
                                        onClick={() => {
                                            setShowPayment(false);
                                            setCardError('');
                                            setCard({ number: '', name: '', expiry: '', cvc: '' });
                                        }}
                                        disabled={isPaying}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={`${styles.paymentButton} ${styles.paymentButtonPrimary}`}
                                        onClick={handlePayment}
                                        disabled={isPaying}
                                    >
                                        {isPaying ? (
                                            <>
                                                <span className={styles.spinner}></span> Processing...
                                            </>
                                        ) : (
                                            `Pay $${billingCycle === 'monthly'
                                                ? plans[paymentFor].monthlyPrice
                                                : plans[paymentFor].annualPrice}`
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
                {/* Modal */}
                {modal.isOpen && (
                    <div className={styles.modalOverlay}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={styles.modalContent}
                        >
                            <div className={styles.modalHeader}>
                                {modal.type === 'error' ? (
                                    <>
                                        <svg className={`${styles.modalIcon} ${styles.modalIconError}`} width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <h3 className={styles.modalTitle}>Error</h3>
                                    </>
                                ) : (
                                    <>
                                        <svg className={`${styles.modalIcon} ${styles.modalIconSuccess}`} width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <h3 className={styles.modalTitle}>Success</h3>
                                    </>
                                )}
                            </div>
                            <p className={styles.modalMessage}>{modal.message}</p>
                            <button
                                onClick={() => setModal({ ...modal, isOpen: false })}
                                className={styles.modalButton}
                            >
                                Close
                            </button>
                        </motion.div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default PricingPage;
