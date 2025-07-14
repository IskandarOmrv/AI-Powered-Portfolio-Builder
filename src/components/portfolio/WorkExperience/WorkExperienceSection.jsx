import { useState, useEffect } from 'react';
import Timeline from './layouts/Timeline';
import Cards from './layouts/Cards';
import Compact from './layouts/Compact';
import styles from './WorkExperience.module.css';
import { FiChevronDown, FiChevronUp, FiPlus, FiTrash2 } from "react-icons/fi";

const WorkExperienceSection = ({
    layout,
    content = {},
    isEditing,
    onChange,
    onLayoutChange,
    onError
}) => {
    const [localContent, setLocalContent] = useState({
        items: Array.isArray(content.items) ? content.items : []
    });

    const [errors, setErrors] = useState([]);
    const [openIndexes, setOpenIndexes] = useState([0]);

    const validateExp = (exp) => {
        const errs = {};
        errs.title = !exp.title || exp.title.length < 5 || exp.title.length > 30
            ? "Title: 5–30 chars"
            : "";
        errs.description = !exp.description || exp.description.length < 5 || exp.description.length > 500
            ? "Description: 5–500 chars"
            : "";
        errs.startDate = !exp.startDate
            ? "Start required"
            : (exp.startDate > new Date().toISOString().slice(0, 7) ? "No future start" : "");

        errs.endDate = !exp.endDate
            ? "End required"
            : (
                exp.endDate !== "Present" && (
                    exp.endDate > new Date().toISOString().slice(0, 7)
                        ? "No future end"
                        : exp.startDate && exp.endDate < exp.startDate
                            ? "End before start"
                            : ""
                )
            );

        return errs;
    };



    const LAYOUTS = [
        { value: "Timeline", label: "Timeline" },
        { value: "Cards", label: "Cards" },
        { value: "Compact", label: "Compact" }
    ];

    useEffect(() => {
        setLocalContent({
            items: Array.isArray(content.items) ? content.items : []
        });
        setErrors([]);
    }, [content]);

    useEffect(() => {
        if (isEditing) {
            const errArr = localContent.items.map(validateExp);
            setErrors(errArr);
            const hasError = errArr.some(e => Object.values(e).some(Boolean));
            if (typeof onError === 'function') onError('WorkExperience', hasError);
        }
    }, [localContent, isEditing, onError]);

    const handleChange = (idx, field, value) => {
        setLocalContent((prev) => {
            const updated = prev.items.map((exp, i) =>
                i === idx ? { ...exp, [field]: value } : exp
            );
            onChange && onChange({ items: updated });
            return { items: updated };
        });
    };

    const handleToggle = (idx) => {
        setOpenIndexes((prev) =>
            prev.includes(idx)
                ? prev.filter(i => i !== idx)
                : [...prev, idx]
        );
    };



    const addExp = () => {
        if (localContent.items.length < 8) {
            setLocalContent((prev) => {
                const updated = [
                    ...prev.items,
                    { title: "", description: "", startDate: "", endDate: "" }
                ];
                onChange && onChange({ items: updated });
                return { items: updated };
            });
        }
    };

    const removeExp = (idx) => {
        if (localContent.items.length > 1) {
            setLocalContent((prev) => {
                const updated = prev.items.filter((_, i) => i !== idx);
                onChange && onChange({ items: updated });
                return { items: updated };
            });
        }
    };

    const handleLayoutSelect = (e) => {
        onLayoutChange && onLayoutChange(e.target.value);
    };

    const layoutMap = { Timeline, Cards, Compact };
    const LayoutComponent = layoutMap[layout] || Timeline;

    return (
        <section className={styles.sectionContainer}>
            {isEditing && (
                <div className={styles.editorContainer}>
                    <h3 className={styles.editorTitle}>Work Experience</h3>

                    <select
                        value={layout}
                        onChange={handleLayoutSelect}
                        className={styles.layoutSelect}
                    >
                        {LAYOUTS.map(l => (
                            <option key={l.value} value={l.value}>
                                {l.label}
                            </option>
                        ))}
                    </select>

                    {localContent.items.map((exp, idx) => (
                        <div key={idx} className={styles.experienceItem}>
                            <div className={styles.itemHeader}>
                                <button
                                    type="button"
                                    className={styles.collapseBtn}
                                    onClick={() => handleToggle(idx)}
                                    aria-label={openIndexes.includes(idx) ? "Collapse" : "Expand"}
                                >
                                    {openIndexes.includes(idx) ? <FiChevronUp /> : <FiChevronDown />}
                                </button>
                                <span className={styles.itemTitlePreview}>
                                    {exp.title ? exp.title : "Untitled Experience"}
                                </span>
                                {localContent.items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeExp(idx)}
                                        className={styles.removeButton}
                                        aria-label="Remove"
                                    >
                                        <FiTrash2 />
                                    </button>
                                )}
                            </div>
                            <div
                                className={`${styles.itemCollapse} ${openIndexes.includes(idx) ? styles.open : ''}`}
                            >
                                <div className={styles.inputGroup}>
                                    <div className={styles.inputField}>
                                        <label>Title*</label>
                                        <input
                                            type="text"
                                            value={exp.title}
                                            onChange={e => handleChange(idx, "title", e.target.value)}
                                            required
                                            minLength={5}
                                            maxLength={30}
                                            className={errors?.[idx]?.title ? styles.errorInput : ''}
                                            placeholder="Position Title"
                                        />
                                        {errors?.[idx]?.title && (
                                            <span className={styles.errorMessage}>{errors[idx].title}</span>
                                        )}
                                    </div>

                                    <div className={styles.inputField}>
                                        <label>Description*</label>
                                        <textarea
                                            value={exp.description}
                                            onChange={e => handleChange(idx, "description", e.target.value)}
                                            required
                                            minLength={5}
                                            maxLength={500}
                                            rows={2}
                                            className={errors?.[idx]?.description ? styles.errorInput : ''}
                                            placeholder="What did you do, achieve, learn?"
                                        />
                                        {errors?.[idx]?.description && (
                                            <span className={styles.errorMessage}>{errors[idx].description}</span>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.dateGroup}>
                                    <div className={styles.inputField}>
                                        <label>Start Date*</label>
                                        <input
                                            type="month"
                                            value={exp.startDate}
                                            max={new Date().toISOString().slice(0, 7)}
                                            onChange={e => handleChange(idx, "startDate", e.target.value)}
                                            required
                                            className={errors?.[idx]?.startDate ? styles.errorInput : ''}
                                        />
                                    </div>
                                    <div className={styles.inputField}>
                                        <label>End Date*</label>
                                        <div className={styles.endDateContainer}>
                                            {exp.endDate === "Present" ? (
                                                <input
                                                    type="text"
                                                    value="Present"
                                                    readOnly
                                                    className={styles.presentInput}
                                                />
                                            ) : (
                                                <input
                                                    type="month"
                                                    value={exp.endDate}
                                                    min={exp.startDate}
                                                    max={new Date().toISOString().slice(0, 7)}
                                                    onChange={e => handleChange(idx, "endDate", e.target.value)}
                                                    required
                                                    className={errors?.[idx]?.endDate ? styles.errorInput : ''}
                                                />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleChange(idx, "endDate", exp.endDate === "Present" ? "" : "Present")}
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
                                                {exp.endDate === "Present" ? "Unset Present" : "Mark as Present"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addExp}
                        className={styles.addButton}
                        disabled={localContent.items.length >= 8}
                    >
                        <FiPlus /> Add Experience
                    </button>
                </div>
            )}

            <div className={isEditing ? styles.previewContainer : ''}>
                <LayoutComponent items={localContent.items} />
            </div>
        </section>
    );
};

export default WorkExperienceSection;