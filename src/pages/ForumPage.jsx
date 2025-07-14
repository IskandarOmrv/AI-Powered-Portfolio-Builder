import { useState, useEffect } from 'react';
import { generatePortfolio, improveAboutMe } from '../lib/openai';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../css/ForumPage.module.css';

const STORAGE_KEY = "portfolioFormData";

const ForumPage = () => {
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);
    const [user, setUser] = useState({ role: '', plan: '' });

    const [userId, setUserId] = useState(null);
    useEffect(() => {
        supabase.auth.getSession().then(async ({ data }) => {
            if (data.session) {
                const _userId = data.session.user.id;
                setUserId(_userId);
                const { data: userData } = await supabase
                    .from('users')
                    .select('role, plan')
                    .eq('id', _userId)
                    .single();
                if (userData) setUser({ role: userData.role, plan: userData.plan });
                else setUser({ role: '', plan: '' });
            } else {
                navigate('/login');
            }
        });
    }, [navigate]);


    // --- Form State ---
    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved
            ? JSON.parse(saved)
            : {
                profileImage: null,
                firstName: '',
                middleName: '',
                lastName: '',
                title: '',
                aboutMe: '',
                emails: [''],
                phones: [''],
                links: [{ title: '', url: '' }],
                workExperience: [
                    {
                        title: "",
                        description: "",
                        startDate: "",
                        endDate: "",
                        collapsed: false
                    }
                ],
                projects: [{
                    title: '',
                    description: '',
                    link: ''
                }]
            };
    });


    const [validationErrors, setValidationErrors] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        title: '',
        projects: [''],
        phones: [{}],
        workExperience: [{}]
    });
    const [showErrors, setShowErrors] = useState(false);


    const [imageSettings, setImageSettings] = useState({
        scale: 1,
        position: { x: 0, y: 0 },
        isDragging: false,
        startPosition: { x: 0, y: 0 }
    });


    const [improving, setImproving] = useState(false);

    const handleImproveText = async () => {
        setImproving(true);
        const improved = await improveAboutMe(formData.aboutMe);
        setImproving(false);
        if (improved) {
            setFormData(prev => ({ ...prev, aboutMe: improved }));
        } else {
            alert("Could not improve text. Try again.");
        }
    };



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const handleArrayChange = (arr, idx, val) => {
        setFormData((p) => ({
            ...p,
            [arr]: p[arr].map((it, i) => {
                if (arr === 'links') {
                    return i === idx ? { ...it, ...val } : it;
                }
                return i === idx ? val : it;
            })
        }));
    };


    const addField = (arr, max) => {
        if (formData[arr].length < max) {
            if (arr === 'links') {
                setFormData((p) => ({ ...p, links: [...p.links, { title: '', url: '' }] }));
            } else {
                setFormData((p) => ({ ...p, [arr]: [...p[arr], ''] }));
            }
        }
    };

    const removeField = (arr, idx) => {
        if (formData[arr].length > 1) {
            if (arr === 'links') {
                setFormData((p) => ({
                    ...p,
                    links: p.links.filter((_, i) => i !== idx)
                }));
            } else {
                setFormData((p) => ({
                    ...p,
                    [arr]: p[arr].filter((_, i) => i !== idx)
                }));
            }
        }
    };


    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () =>
            setFormData((p) => ({ ...p, profileImage: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setFormData((p) => ({ ...p, profileImage: null }));
        setImageSettings({ scale: 1, position: { x: 0, y: 0 }, isDragging: false, startPosition: { x: 0, y: 0 } });
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        setImageSettings((p) => ({
            ...p,
            isDragging: true,
            startPosition: { x: e.clientX - p.position.x, y: e.clientY - p.position.y }
        }));
    };
    const handleMouseMove = (e) => {
        if (!imageSettings.isDragging) return;
        e.preventDefault();
        setImageSettings((p) => ({
            ...p,
            position: { x: e.clientX - p.startPosition.x, y: e.clientY - p.startPosition.y }
        }));
    };
    const handleMouseUp = () =>
        setImageSettings((p) => ({ ...p, isDragging: false }));


    const handleProjectChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.map((p, i) =>
                i === index ? { ...p, [field]: value } : p
            )
        }));
    };

    const addProject = () => {
        if (formData.projects.length < 10) {
            setFormData(prev => ({
                ...prev,
                projects: [
                    ...prev.projects,
                    { title: '', description: '', link: '' }
                ]
            }));
        }
    };

    const removeProject = (index) => {
        if (formData.projects.length > 1) {
            setFormData(prev => ({
                ...prev,
                projects: prev.projects.filter((_, i) => i !== index)
            }));
        }
    };

    const handleExperienceChange = (idx, field, value) => {
        setFormData((p) => ({
            ...p,
            workExperience: p.workExperience.map((exp, i) =>
                i === idx ? { ...exp, [field]: value } : exp
            )
        }));
    };

    const addExperience = () => {
        setFormData((p) => ({
            ...p,
            workExperience: [...(p.workExperience || []), {
                title: "",
                description: "",
                startDate: "",
                endDate: "",
                collapsed: false
            }]
        }));
    };

    const removeExperience = (idx) => {
        if (formData.workExperience.length > 0) {
            setFormData((p) => ({
                ...p,
                workExperience: p.workExperience.filter((_, i) => i !== idx)
            }));
        }
    };


    const validateTitle = (value) => {
        if (value.length < 4) return 'At least 4 characters';
        if (value.length > 30) return 'Up to 30 characters';
        return '';
    };
    const validateName = (name, value) => {
        if (name === 'middleName' && !value) return '';
        if (!value) return 'Required field';
        if (!/^[A-Za-z]{2,20}$/.test(value)) {
            return '2-20 English letters only';
        }
        return '';
    };

    const validateAboutMe = (value) => {
        if (!value.trim()) return 'Required field';
        if (value.length < 15) return 'Minimum 15 characters';
        if (value.length > 3000) return 'Maximum 3000 characters';
        return '';
    };


    const validateEmail = (email) => {
        const trimmed = (email || '').trim();
        if (!trimmed) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) return 'Invalid email format';
        return '';
    };


    const validateProjectTitle = (value) => {
        if (!value.trim()) return 'Required field';
        if (value.length < 4) return 'Minimum 4 characters';
        if (value.length > 30) return 'Maximum 30 characters';
        return '';
    };

    const validateProjectDescription = (value) => {
        if (!value.trim()) return 'Required field';
        if (value.length > 200) return 'Maximum 200 characters';
        return '';
    };

    const validatePhone = (value) => {
        if (!value) return '';
        if (!value.startsWith('+')) return 'Must start with +';
        if (!/^\+[0-9]{13}$/.test(value)) return '13 digits including +';
        return '';
    };

    const validateLinkTitle = (value) => {
        if (!value.trim()) return 'Required field';
        if (value.length < 2) return 'Minimum 2 characters';
        if (value.length > 20) return 'Maximum 20 characters';
        return '';
    };


    const validateProject = (project) => {
        const errors = {};
        errors.title = validateProjectTitle(project.title);
        errors.description = validateProjectDescription(project.description);
        if (project.link && !/^https?:\/\/.+\..+/.test(project.link)) {
            errors.link = 'Invalid URL format';
        }
        return errors;
    };

    const validateLink = (link) => {
        const errors = {};
        errors.title = validateLinkTitle(link.title);
        if (link.url.trim() && !/^https?:\/\/.+\..+/.test(link.url)) {
            errors.url = 'Invalid URL format';
        }
        return errors;
    };


    const validateExperience = (exp) => {
        const errs = {};
        errs.title = exp.title.length < 5 || exp.title.length > 30 ? "Title 5-30 chars" : "";
        errs.description = exp.description.length < 5 || exp.description.length > 500 ? "Description 5-500 chars" : "";
        if (!exp.startDate) errs.startDate = "Start required";
        // Optionally, require endDate or allow "Present"
        if (!exp.endDate) errs.endDate = "End required";
        else if (exp.endDate !== "Present" && new Date(exp.startDate) > new Date(exp.endDate)) errs.endDate = "End before start";
        return errs;
    };


    const validateForm = () => {
        const errs = {
            firstName: validateName('firstName', formData.firstName),
            middleName: validateName('middleName', formData.middleName),
            lastName: validateName('lastName', formData.lastName),
            aboutMe: validateAboutMe(formData.aboutMe),
            title: validateTitle(formData.title),
            projects: formData.projects.map(validateProject),
            phones: formData.phones.map(validatePhone),
            links: formData.links.map(validateLink),
            emails: formData.emails.map(validateEmail),
            workExperience: formData.workExperience.map(validateExperience),
        };
        setValidationErrors(errs);

        const hasProjectErrors = errs.projects.some(p =>
            Object.values(p).some(e => e)
        );

        const hasLinkErrors = errs.links.some(l =>
            Object.values(l).some(e => e)
        );

        const hasExperienceErrors = errs.workExperience.some(e =>
            Object.values(e).some(val => val)
        );

        const fieldErrors = [
            errs.firstName,
            errs.middleName,
            errs.lastName,
            errs.aboutMe,
            errs.title,
            ...errs.phones
        ];
        return (
            fieldErrors.every(e => !e) &&
            !hasProjectErrors &&
            !hasLinkErrors && !hasExperienceErrors
        );
    };

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, [formData]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowErrors(true);
        if (isGenerating) return;

        if (!validateForm()) return;

        if (
            !formData.firstName ||
            !formData.lastName ||
            !formData.title ||
            formData.projects.some(p => !p.title.trim() || !p.description.trim())
        ) {
            return;
        }
        setIsGenerating(true);

        const aiInput = { title: formData.title, aboutMe: formData.aboutMe, role: user.role, plan: user.plan };
        let aiResult = null;
        try {
            aiResult = await generatePortfolio(aiInput);
        } catch {
            alert("AI layout generation failed. Try again.");
            setIsGenerating(false);
            return;
        }

        const finalPortfolio = {
            userId,
            createdAt: new Date().toISOString(),
            theme: aiResult.theme,
            sections: [
                {
                    section: "Header",
                    layout: aiResult.layouts.Header,
                    content: {
                        firstName: formData.firstName,
                        middleName: formData.middleName,
                        lastName: formData.lastName,
                        title: formData.title,
                    },
                },
                ...(formData.profileImage
                    ? [{
                        section: "ProfileImage",
                        layout: aiResult.layouts.ProfileImage,
                        content: {
                            imageUrl: formData.profileImage
                        },
                    }]
                    : []),
                ...(formData.aboutMe.trim()
                    ? [{
                        section: "AboutMe",
                        layout: aiResult.layouts.AboutMe,
                        content: {
                            text: formData.aboutMe
                        },
                    }]
                    : []),
                ...(formData.workExperience &&
                    formData.workExperience.some(e => e.title.trim() && e.description.trim()) ? [{
                        section: "WorkExperience",
                        layout: aiResult.layouts.WorkExperience,
                        content: {
                            items: formData.workExperience
                                .filter(e => e.title.trim() && e.description.trim())
                                .map(e => ({
                                    title: e.title.trim(),
                                    description: e.description.trim(),
                                    startDate: e.startDate,
                                    endDate: e.endDate
                                }))
                        }
                    }] : []),
                {
                    section: "Projects",
                    layout: aiResult.layouts.Projects,
                    content: {
                        items: formData.projects
                            .filter(p => p.title.trim() && p.description.trim())
                            .map(p => ({
                                title: p.title,
                                description: p.description,
                                link: p.link.trim() || null
                            }))
                    },
                },
                {
                    section: "Contact",
                    layout: aiResult.layouts.Contact,
                    content: {
                        emails: formData.emails.filter(e => e.trim()),
                        phones: formData.phones.filter(p => p.trim()),
                        links: formData.links
                            .filter(link => link.title.trim() && link.url.trim())
                            .map(link => ({
                                title: link.title.trim(),
                                url: link.url.trim()
                            })),
                    },
                },
            ],
        };
        console.log("Final Portfolio sent to preview:", finalPortfolio);
        setIsGenerating(false);
        localStorage.removeItem(STORAGE_KEY);
        navigate('/portfolio-preview', { state: finalPortfolio });
    };

    return (
        <>
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        className={styles.loadingOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className={styles.spinner}
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        />
                        <motion.span
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{ color: 'blue' }}
                        >
                            Generating portfolio...
                        </motion.span>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className={styles.container}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ filter: isGenerating ? 'blur(4px)' : 'none' }}
            >
                <motion.h1
                    className={styles.title}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    Build Your Portfolio
                </motion.h1>

                <form onSubmit={handleSubmit}>
                    {/* Profile Image Upload */}
                    <motion.div
                        className={styles.profileSection}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <label className={styles.sectionLabel}>Profile Image</label>
                        <div className={styles.imageUploadContainer}>
                            <motion.div
                                className={styles.imagePreviewWrapper}
                                whileHover={{ scale: 1.02 }}
                            >
                                {formData.profileImage ? (
                                    <>
                                        <div
                                            className={styles.imagePreview}
                                            onMouseDown={handleMouseDown}
                                            onMouseMove={handleMouseMove}
                                            onMouseUp={handleMouseUp}
                                            onMouseLeave={handleMouseUp}
                                        >
                                            <img
                                                src={formData.profileImage}
                                                alt="Profile"
                                                style={{
                                                    transform: `translate(-50%, -50%) scale(${imageSettings.scale}) translate(${imageSettings.position.x}px, ${imageSettings.position.y}px)`,
                                                    width: '80%',
                                                    height: '80%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </div>
                                        <div className={styles.imageControls}>
                                            <div className={styles.zoomControls}>
                                                <button
                                                    type="button"
                                                    className={styles.controlButton}
                                                    onClick={() => setImageSettings(prev => ({
                                                        ...prev,
                                                        scale: Math.max(0.5, prev.scale - 0.1)
                                                    }))}
                                                >
                                                    -
                                                </button>
                                                <span>{Math.round(imageSettings.scale * 100)}%</span>
                                                <button
                                                    type="button"
                                                    className={styles.controlButton}
                                                    onClick={() => setImageSettings(prev => ({
                                                        ...prev,
                                                        scale: Math.min(2, prev.scale + 0.1)
                                                    }))}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.removeImageButton}
                                                onClick={handleRemoveImage}
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className={styles.uploadPrompt}>
                                        <UserIcon className={styles.uploadIcon} />
                                        <span style={{ color: "black" }}>Upload your photo</span>
                                        <input
                                            type="file"
                                            id="profileImage"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Personal Information Section */}
                    <motion.div
                        className={styles.section}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <label className={styles.sectionLabel}>Personal Information</label>
                        <div className={styles.nameFields}>
                            <div className={styles.inputGroup}>
                                <label>First Name*</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                    required
                                    className={showErrors && validationErrors.firstName ? styles.error : ''}
                                />
                                {showErrors && validationErrors.firstName && (
                                    <span className={styles.errorMessage}>{validationErrors.firstName}</span>
                                )}
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Middle Name</label>
                                <input
                                    type="text"
                                    name="middleName"
                                    value={formData.middleName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Last Name*</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                    required
                                    className={showErrors && validationErrors.lastName ? styles.error : ''}
                                />
                                {showErrors && validationErrors.lastName && (
                                    <span className={styles.errorMessage}>{validationErrors.lastName}</span>
                                )}
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Professional Title*</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                    className={showErrors && validationErrors.title ? styles.error : ''}
                                />
                                {showErrors && validationErrors.title && (
                                    <span className={styles.errorMessage}>{validationErrors.title}</span>
                                )}
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>About Me*</label>
                            <textarea
                                name="aboutMe"
                                value={formData.aboutMe}
                                onChange={handleChange}
                                rows="5"
                                required
                                className={showErrors && validationErrors.aboutMe ? styles.error : ''}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 2, }}>
                                <button
                                    type="button"
                                    className={styles.aiButton}
                                    style={{
                                        color: '#2563eb',
                                        background: 'none',
                                        border: 'none',
                                        fontSize: 14,
                                        cursor: improving ? "not-allowed" : "pointer",
                                        opacity: improving ? 0.5 : 1,
                                        paddingRight: 4
                                    }}
                                    onClick={handleImproveText}
                                    disabled={improving}
                                >
                                    {improving ? "Improving..." : "Improve Text with AI"}
                                </button>
                            </div>
                            {showErrors && validationErrors.aboutMe && (
                                <span className={styles.errorMessage}>{validationErrors.aboutMe}</span>
                            )}
                        </div>
                    </motion.div>

                    {/* Contact Information Section */}
                    <motion.div
                        className={styles.section}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <label className={styles.sectionLabel}>Contact Information</label>

                        <div className={styles.contactGroup}>
                            <h3 style={{ color: 'black' }}>Emails*</h3>
                            {formData.emails.map((email, index) => (
                                <motion.div
                                    key={`email-${index}`}
                                    className={styles.arrayField}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => handleArrayChange('emails', index, e.target.value)}
                                        required={index === 0}
                                        className={showErrors && validationErrors.emails[index] ? styles.error : ''}
                                        placeholder="@myemail.com"
                                    />
                                    {index === 0 ? (
                                        <motion.button
                                            type="button"
                                            className={styles.addButton}
                                            onClick={formData.emails.length < 2 ? () => addField('emails', 2) : undefined}
                                            disabled={formData.emails.length >= 2}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <PlusIcon />
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={() => removeField('emails', index)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <MinusIcon />
                                        </motion.button>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        <div className={styles.contactGroup}>
                            <h3 style={{ color: 'black' }}>Phone Numbers*</h3>
                            {formData.phones.map((phone, index) => (
                                <motion.div
                                    key={`phone-${index}`}
                                    className={styles.arrayField}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => {
                                            const newPhones = [...formData.phones];
                                            newPhones[index] = e.target.value;
                                            setFormData(prev => ({ ...prev, phones: newPhones }));
                                        }}
                                        className={showErrors && validationErrors.phones[index] ? styles.error : ''}
                                        placeholder="+995"
                                    />
                                    {showErrors && validationErrors.phones[index] && (
                                        <span className={styles.errorMessage}>{validationErrors.phones[index]}</span>
                                    )}
                                    {index === 0 ? (
                                        <motion.button
                                            type="button"
                                            className={styles.addButton}
                                            onClick={formData.phones.length < 2 ? () => addField('phones', 2) : undefined}
                                            disabled={formData.phones.length >= 2}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <PlusIcon />
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={() => removeField('phones', index)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <MinusIcon />
                                        </motion.button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Links Section */}
                    <motion.div
                        className={styles.section}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <label className={styles.sectionLabel}>Social Links</label>
                        {formData.links.map((link, index) => (
                            <motion.div
                                key={`link-${index}`}
                                className={styles.linkField}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className={styles.linkInputs}>
                                    <input
                                        type="text"
                                        value={link.title || ''}
                                        onChange={(e) => handleArrayChange('links', index, { title: e.target.value })}
                                        placeholder="Title"
                                        className={showErrors && validationErrors.links[index]?.title ? styles.error : ''}
                                    />
                                    <input
                                        type="url"
                                        value={link.url || ''}
                                        onChange={(e) => handleArrayChange('links', index, { url: e.target.value })}
                                        placeholder="https://example.com"
                                        className={showErrors && validationErrors.links[index]?.url ? styles.error : ''}
                                    />
                                </div>
                                {index === 0 ? (
                                    <motion.button
                                        type="button"
                                        className={styles.addButton}
                                        onClick={formData.links.length < 5 ? () => addField('links', 5) : undefined}
                                        disabled={formData.links.length >= 5}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <PlusIcon />
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        type="button"
                                        className={styles.removeButton}
                                        onClick={() => removeField('links', index)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <MinusIcon />
                                    </motion.button>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Wokring Experience section*/}

                    <motion.div
                        className={styles.section}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <label className={styles.sectionLabel}>Work Experience</label>
                        <div className={styles.experienceContainer}>
                            {(formData.workExperience || []).map((exp, idx) => (
                                <motion.div
                                    key={`exp-${idx}`}
                                    className={styles.experienceCard}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ y: -2 }}
                                >
                                    <div className={styles.experienceHeader}>
                                        <h3>Experience {idx + 1}</h3>
                                        <div className={styles.experienceActions}>
                                            <button
                                                type="button"
                                                className={styles.toggleButton}
                                                onClick={() => {
                                                    const newExp = [...formData.workExperience];
                                                    newExp[idx].collapsed = !newExp[idx].collapsed;
                                                    setFormData(prev => ({ ...prev, workExperience: newExp }));
                                                }}
                                            >
                                                {exp.collapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
                                            </button>
                                            {idx > -1 && (
                                                <button
                                                    type="button"
                                                    className={styles.removeButton}
                                                    onClick={() => removeExperience(idx)}
                                                >
                                                    <TrashIcon />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.experienceField}>
                                        <input
                                            type="text"
                                            value={exp.title}
                                            onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)}
                                            placeholder="Job Title*"
                                            required
                                            className={showErrors && validationErrors.workExperience?.[idx]?.title ? styles.error : ''}
                                        />
                                        {showErrors && validationErrors.workExperience?.[idx]?.title && (
                                            <span className={styles.errorMessage}>{validationErrors.workExperience[idx].title}</span>
                                        )}
                                    </div>

                                    {!exp.collapsed && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className={styles.dateFields}>
                                                <div className={styles.dateField}>
                                                    <label>Start Date*</label>
                                                    <input
                                                        type="month"
                                                        value={exp.startDate}
                                                        max={new Date().toISOString().slice(0, 7)} // Disallow future months
                                                        onChange={e => handleExperienceChange(idx, "startDate", e.target.value)}
                                                        required
                                                        className={showErrors && validationErrors.workExperience?.[idx]?.startDate ? styles.error : ''}
                                                    />
                                                    {showErrors && validationErrors.workExperience?.[idx]?.startDate && (
                                                        <span className={styles.errorMessage}>{validationErrors.workExperience[idx].startDate}</span>
                                                    )}
                                                </div>

                                                {/* --- End Date (or Present) --- */}
                                                <div className={styles.dateField}>
                                                    <label>End Date*</label>
                                                    {exp.endDate === "Present" ? (
                                                        <input
                                                            type="text"
                                                            value="Present"
                                                            readOnly
                                                            className={styles.presentField}
                                                            style={{ color: "#16a34a", background: "#f0fdf4" }}
                                                        />
                                                    ) : (
                                                        <input
                                                            type="month"
                                                            value={exp.endDate}
                                                            min={exp.startDate} // Cannot be before start date
                                                            max={new Date().toISOString().slice(0, 7)} // Disallow future
                                                            onChange={e => handleExperienceChange(idx, "endDate", e.target.value)}
                                                            required
                                                            className={showErrors && validationErrors.workExperience?.[idx]?.endDate ? styles.error : ''}
                                                        />
                                                    )}
                                                    {showErrors && validationErrors.workExperience?.[idx]?.endDate && (
                                                        <span className={styles.errorMessage}>{validationErrors.workExperience[idx].endDate}</span>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className={styles.presentButton}
                                                        onClick={() => handleExperienceChange(idx, 'endDate', exp.endDate === 'Present' ? '' : 'Present')}
                                                        style={{
                                                            marginLeft: 6,
                                                            background: exp.endDate === "Present" ? "#16a34a" : "#f1f5f9",
                                                            color: exp.endDate === "Present" ? "#fff" : "#111",
                                                            borderRadius: 6,
                                                            border: "none",
                                                            padding: "6px 10px",
                                                            fontWeight: 500,
                                                            cursor: "pointer"
                                                        }}
                                                    >
                                                        {exp.endDate === 'Present' ? "Unset Present" : "Mark as Present"}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className={styles.experienceField}>
                                                <textarea
                                                    value={exp.description}
                                                    onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                                                    placeholder="Job Description*"
                                                    required
                                                    rows="4"
                                                    className={showErrors && validationErrors.workExperience?.[idx]?.description ? styles.error : ''}
                                                />
                                                {showErrors && validationErrors.workExperience?.[idx]?.description && (
                                                    <span className={styles.errorMessage}>{validationErrors.workExperience[idx].description}</span>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}

                            <motion.button
                                type="button"
                                className={styles.addExperienceButton}
                                onClick={addExperience}
                                disabled={formData.workExperience?.length >= 8}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                + Add Experience
                            </motion.button>
                        </div>
                    </motion.div>


                    {/* Projects Section */}
                    <motion.div
                        className={styles.section}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <label className={styles.sectionLabel}>Projects</label>
                        <div className={styles.projectsContainer}>
                            {formData.projects.map((project, index) => (
                                <motion.div
                                    key={`project-${index}`}
                                    className={styles.projectCard}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -2 }}
                                >
                                    <div className={styles.projectHeader}>
                                        <h3>Project {index + 1}</h3>
                                        <div className={styles.projectActions}>
                                            <button
                                                type="button"
                                                className={styles.toggleButton}
                                                onClick={() => {
                                                    const newProjects = [...formData.projects];
                                                    newProjects[index].collapsed = !newProjects[index].collapsed;
                                                    setFormData(prev => ({ ...prev, projects: newProjects }));
                                                }}
                                            >
                                                {project.collapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
                                            </button>
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    className={styles.removeButton}
                                                    onClick={() => removeProject(index)}
                                                >
                                                    <TrashIcon />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.projectField}>
                                        <input
                                            type="text"
                                            value={project.title}
                                            onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                                            placeholder="Project title*"
                                            required
                                            className={showErrors && validationErrors.projects[index]?.title ? styles.error : ''}
                                        />
                                        {showErrors && validationErrors.projects[index]?.title && (
                                            <span className={styles.errorMessage}>{validationErrors.projects[index].title}</span>
                                        )}
                                    </div>

                                    {!project.collapsed && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className={styles.projectField}>
                                                <textarea
                                                    value={project.description}
                                                    onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                                                    placeholder="Project description*"
                                                    required
                                                    rows="3"
                                                    className={showErrors && validationErrors.projects[index]?.description ? styles.error : ''}
                                                />
                                                {showErrors && validationErrors.projects[index]?.description && (
                                                    <span className={styles.errorMessage}>{validationErrors.projects[index].description}</span>
                                                )}
                                            </div>

                                            <div className={styles.projectField}>
                                                <input
                                                    type="url"
                                                    value={project.link}
                                                    onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                                                    placeholder="Project URL (optional)"
                                                    className={showErrors && validationErrors.projects[index]?.link ? styles.error : ''}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        <motion.button
                            type="button"
                            className={styles.addProjectButton}
                            onClick={addProject}
                            disabled={formData.projects.length >= 10}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            + Add Project
                        </motion.button>
                    </motion.div>

                    <motion.div
                        className={styles.submitContainer}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <motion.button
                            type="submit"
                            className={styles.submitButton}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Generate Portfolio
                        </motion.button>
                    </motion.div>
                </form>
            </motion.div>
        </>
    );
};

const PlusIcon = () => <span>+</span>;
const MinusIcon = () => <span>-</span>;
const TrashIcon = () => <span>🗑️</span>;
const ChevronDownIcon = () => <span>▼</span>;
const ChevronUpIcon = () => <span>▲</span>;
const UserIcon = () => <span>👤</span>;

export default ForumPage;