import { useState, useEffect } from 'react';
import InlineLayout from './layouts/Inline';
import StackedLayout from './layouts/Stacked';
import CardsLayout from './layouts/Cards';
import styles from './ContactSection.module.css';
import { FiTrash2 } from "react-icons/fi";

const ContactSection = ({ layout, content, isEditing, onChange, onLayoutChange, onError, admin, premium }) => {
    const [activeTab, setActiveTab] = useState('emails');
    const [localContent, setLocalContent] = useState(content || {
        emails: [''],
        phones: [''],
        links: [{ title: '', url: '' }]
    });

    const [errors, setErrors] = useState({
        emails: [],
        phones: [],
        links: []
    });

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };


    const validateLinkUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };




    const handleChange = (type, index, field, value) => {
        const updated = { ...localContent };
        const newErrors = { ...errors };

        if (type === 'phones') {
            const cleaned = value.startsWith('+') ? '+' + value.slice(1).replace(/[^0-9]/g, '') : '+' + value.replace(/[^0-9]/g, '');
            if (cleaned.length > 13) return;
            updated[type][index] = cleaned;

            newErrors.phones[index] = cleaned.length < 13 ? ' {Phone must be 13 digits}' : '';
        }
        else if (type === 'links') {
            if (field === 'title') {
                if (value.length > 20) return;
                updated.links[index].title = value;

                newErrors.links[index] = {
                    ...newErrors.links[index],
                    title: value.length < 2 ? ' {Title must be at least 2 characters}' : ''
                };
            } else if (field === 'url') {
                updated.links[index].url = value;

                newErrors.links[index] = {
                    ...newErrors.links[index],
                    url: value && !validateLinkUrl(value) ? ' {Invalid URL format}' : ''
                };
            }
        }
        else if (type === 'emails') {
            updated[type][index] = value;

            // Email validation
            newErrors.emails[index] = value && !validateEmail(value) ? ' {Invalid email format}' : '';
        }
        else {
            updated[type][index] = value;
        }

        setLocalContent(updated);
        setErrors(newErrors);
        onChange(updated);
    };


    const addItem = (type) => {
        const limits = {
            emails: 2,
            phones: 2,
            links: 5
        };

        if (localContent[type].length >= limits[type]) return;

        const updated = { ...localContent };
        if (type === 'links') {
            updated.links.push({ title: '', url: '' });
        } else {
            updated[type].push('');
        }
        setLocalContent(updated);
        onChange(updated);
    };

    const removeItem = (type, index) => {
        if (activeTab === 'phones') {
            const updated = { ...localContent };
            updated[type].splice(index, 1);
            setLocalContent(updated);
            onChange(updated);
        }
        else if (localContent[type].length <= 1) return;
        const updated = { ...localContent };
        updated[type].splice(index, 1);
        setLocalContent(updated);
        onChange(updated);
    };
    const LayoutComponent = {
        inline: InlineLayout,
        stacked: StackedLayout,
        cards: CardsLayout
    }[layout] || InlineLayout;

    const LAYOUTS = [
        { value: "inline", label: "Inline Layout", premium: false },
        { value: "stacked", label: "Stacked Layout", premium: true },
        { value: "cards", label: "Cards Layout", premium: false },
    ];



    useEffect(() => {
        setLocalContent(content || {
            emails: [''],
            phones: [''],
            links: [{ title: '', url: '' }]
        });
    }, [content, isEditing]);

    useEffect(() => {
        const validEmails = localContent.emails.filter(e => validateEmail(e));
        const emailErrors = errors.emails.filter(Boolean);
        const emailSectionHasError = validEmails.length < 1 || emailErrors.length > 0;

        const linkSectionHasError = localContent.links.some((l, i) =>
            !l.title || l.title.length < 2 || l.title.length > 20 ||
            (l.url && !validateLinkUrl(l.url)) ||
            (errors.links[i] && (errors.links[i].title || errors.links[i].url))
        );

        const phoneSectionHasError = localContent.phones.some((p, i) =>
            p.trim() !== '' && errors.phones[i]
        );

        if (typeof onError === 'function') {
            onError('Contact', emailSectionHasError || linkSectionHasError || phoneSectionHasError);
        }
    }, [localContent, errors, onError]);


    return (
        <div className={styles.container}>
            {isEditing ? (
                <div className={styles.editorPanel}>
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        {['emails', 'phones', 'links'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: activeTab === tab ? 'hsl(var(--primary))' : 'transparent',
                                    color: activeTab === tab ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {localContent[activeTab].map((item, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center'
                            }}>
                                {
                                    activeTab === 'emails' && (
                                        <>
                                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                                <label style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                                                    Email
                                                    <span>                                                {errors.emails[index] && (
                                                        <span style={{ color: 'hsl(var(--destructive))', fontSize: '0.8rem' }}>
                                                            {errors.emails[index]}
                                                        </span>
                                                    )}</span>
                                                </label>
                                                <input
                                                    placeholder="your@email.com"
                                                    value={item}
                                                    onChange={(e) => handleChange(activeTab, index, '', e.target.value)}
                                                    style={{
                                                        ...inputStyle,
                                                        flex: 1,
                                                        borderColor: errors.emails[index] ? 'hsl(var(--destructive))' : 'hsl(var(--input-border))'
                                                    }}
                                                />

                                            </div>
                                        </>
                                    )
                                }

                                {
                                    activeTab === 'phones' && (
                                        <>
                                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <label style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                                                        Phone
                                                        <span style={{ marginLeft: '0.5rem', color: 'hsl(var(--muted))' }}>
                                                            {item.length}/13
                                                            {errors.phones[index] && (
                                                                <span style={{ color: 'hsl(var(--destructive))', fontSize: '0.8rem' }}>
                                                                    {errors.phones[index]}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </label>
                                                </div>
                                                <input
                                                    placeholder="+1234567890"
                                                    value={item}
                                                    onChange={(e) => handleChange(activeTab, index, '', e.target.value)}
                                                    style={{
                                                        ...inputStyle,
                                                        borderColor: errors.phones[index] ? 'hsl(var(--destructive))' : 'hsl(var(--input-border))'
                                                    }}
                                                    maxLength={13}
                                                />
                                            </div>
                                        </>
                                    )
                                }

                                {activeTab === 'links' && (
                                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <label style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                                                    Title
                                                    <span style={{ marginLeft: '0.5rem', color: 'hsl(var(--muted))' }}>
                                                        {item.title.length}/20
                                                        {errors.links[index]?.title && (
                                                            <span className={styles.errorMessage}>
                                                                {errors.links[index].title}
                                                            </span>
                                                        )}
                                                    </span>

                                                </label>
                                            </div>
                                            <input
                                                placeholder="Link title"
                                                value={item.title}
                                                onChange={(e) => handleChange('links', index, 'title', e.target.value)}
                                                style={{
                                                    ...inputStyle,
                                                    borderColor: errors.links[index]?.title ? 'hsl(var(--destructive))' : 'hsl(var(--input-border))'
                                                }}
                                                maxLength={20}
                                            />

                                        </div>
                                        <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                                            <label style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                                                URL
                                                <span>                                            {errors.links[index]?.url && (
                                                    <span className={styles.errorMessage}>
                                                        {errors.links[index].url}
                                                    </span>
                                                )}</span>
                                            </label>
                                            <input
                                                placeholder="https://example.com"
                                                value={item.url}
                                                onChange={(e) => handleChange('links', index, 'url', e.target.value)}
                                                style={{
                                                    ...inputStyle,
                                                    borderColor: errors.links[index]?.url ? 'hsl(var(--destructive))' : 'hsl(var(--input-border))'
                                                }}
                                            />

                                        </div>

                                    </div>
                                )}

                                <button
                                    onClick={() => removeItem(activeTab, index)}
                                    style={{
                                        position: 'sticky',
                                        background: 'none',
                                        border: 'none',
                                        color: 'hsl(var(--destructive))',
                                        cursor: 'pointer',
                                        alignSelf: 'flex-end',
                                        marginBottom: '14px',
                                    }}
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => addItem(activeTab)}
                            style={{
                                background: localContent[activeTab].length >=
                                    { emails: 2, phones: 2, links: 5 }[activeTab]
                                    ? 'hsl(var(--muted))' : 'hsl(var(--accent))',
                                color: 'hsl(var(--accent-foreground))',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.5rem',
                                cursor: localContent[activeTab].length >=
                                    { emails: 2, phones: 2, links: 5 }[activeTab]
                                    ? 'not-allowed' : 'pointer',
                                marginTop: '0.5rem'
                            }}
                            disabled={localContent[activeTab].length >=
                                { emails: 2, phones: 2, links: 5 }[activeTab]}
                        >
                            + Add {activeTab.slice(0, -1)}
                        </button>
                    </div>

                    <select
                        value={layout}
                        onChange={(e) => onLayoutChange(e.target.value)}
                        style={{
                            ...inputStyle,
                            marginTop: '1.5rem',
                            width: '100%'
                        }}
                    >
                        {LAYOUTS.map(l => (
                            <option
                                key={l.value}
                                value={l.value}
                                disabled={l.premium && !premium && !admin}
                                title={l.premium && !premium && !admin? "Upgrade to Premium for this layout" : ""}
                                style={l.premium && !premium && !admin? { color: "#888", fontStyle: "italic" } : {}}
                            >
                                {l.label}{l.premium ? " (Premium)" : ""}
                            </option>
                        ))}
                    </select>
                </div>
            ) : null}

            <div className={styles.layoutContainer}>
                <LayoutComponent content={localContent} />
            </div>
        </div>
    );
};

const inputStyle = {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid hsl(var(--input-border))',
    background: 'hsl(var(--input-bg))',
    color: 'hsl(var(--input-text))',
    fontSize: '1rem',
    flex: 1
};

export default ContactSection;