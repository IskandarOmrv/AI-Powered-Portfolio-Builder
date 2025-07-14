import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { improveAboutMe } from "../../lib/openai";
import ResumePreview from './ResumePreview';
import "../../css/ForumPageResume.css";

const STORAGE_KEY = "resumeFormData";
const templates = ["Default", "Split", "Wide Left"];
const themes = ["Light", "Slate", "Forest", "Sunset"];

const ForumPageCV = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState("Default");
    const [selectedTheme, setSelectedTheme] = useState("Light");
    const [improving, setIsImproving] = useState(false);
    const [status, setStatus] = useState({ message: "", type: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [editingResumeId, setEditingResumeId] = useState(null);

    const showConfirm = (message, onConfirm) => {
        setStatus({
            message: `${message}`,
            type: "confirm",
            onConfirm: () => {
                onConfirm();
                setStatus({ message: "", type: "" });
            },
            onCancel: () => setStatus({ message: "", type: "" })
        });
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                setUserId(data.session.user.id);
                const editingId = localStorage.getItem("editingResumeId");
                if (editingId) {
                    setIsEditing(true);
                    setEditingResumeId(editingId);
                    const savedTemplate = localStorage.getItem("resumeTemplate");
                    const savedTheme = localStorage.getItem("resumeTheme");
                    if (savedTemplate) setSelectedTemplate(savedTemplate);
                    if (savedTheme) setSelectedTheme(savedTheme);

                    localStorage.removeItem("editingResumeId");
                    localStorage.removeItem("resumeTemplate");
                    localStorage.removeItem("resumeTheme");
                }
            } else {
                navigate("/login");
            }
        });
    }, [navigate]);

    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : {
            name: "",
            title: "",
            contact: { email: "", phone: "", linkedin: "" },
            summary: "",
            experience: [{ job_title: "", company: "", start_date: "", end_date: "", description: "" }],
            education: [{ degree: "", institution: "", start_year: "", end_year: "" }],
            skills: [""],
            certifications: [""],
            languages: [""],
            custom_sections: [],
        };
    });

    const handleChange = (field, value) => setFormData(p => ({ ...p, [field]: value }));
    const handleContactChange = (field, value) => setFormData(p => ({ ...p, contact: { ...p.contact, [field]: value } }));
    const handleArrayChange = (field, idx, subfield, value) => setFormData(p => ({ ...p, [field]: p[field].map((it, i) => i === idx ? { ...it, [subfield]: value } : it) }));
    const addArrayField = (field, emptyObj) => setFormData(p => ({ ...p, [field]: [...p[field], emptyObj] }));
    const removeArrayField = (field, idx) => setFormData(p => ({ ...p, [field]: p[field].filter((_, i) => i !== idx) }));
    const handleStringArrayChange = (field, idx, value) => setFormData(p => ({ ...p, [field]: p[field].map((v, i) => i === idx ? value : v) }));
    const addStringArrayField = (field) => setFormData(p => ({ ...p, [field]: [...p[field], ""] }));
    const removeStringArrayField = (field, idx) => setFormData(p => ({ ...p, [field]: p[field].filter((_, i) => i !== idx) }));
    const handleCustomSectionLabel = (idx, value) => setFormData(p => ({ ...p, custom_sections: p.custom_sections.map((s, i) => i === idx ? { ...s, label: value } : s) }));
    const handleCustomSectionItem = (secIdx, itemIdx, value) => setFormData(p => ({ ...p, custom_sections: p.custom_sections.map((s, i) => i === secIdx ? { ...s, items: s.items.map((item, j) => j === itemIdx ? value : item) } : s) }));
    const addCustomSection = () => setFormData(p => ({ ...p, custom_sections: [...p.custom_sections, { label: "", items: [""] }] }));
    const removeCustomSection = (secIdx) => setFormData(p => ({ ...p, custom_sections: p.custom_sections.filter((_, i) => i !== secIdx) }));
    const addCustomSectionItem = (secIdx) => setFormData(p => ({ ...p, custom_sections: p.custom_sections.map((s, i) => i === secIdx ? { ...s, items: [...s.items, ""] } : s) }));
    const removeCustomSectionItem = (secIdx, itemIdx) => setFormData(p => ({ ...p, custom_sections: p.custom_sections.map((s, i) => i === secIdx ? { ...s, items: s.items.filter((_, j) => j !== itemIdx) } : s) }));


    const handleImproveSummary = async () => {
        if (!formData.summary.trim() || formData.summary.length < 20) {
            setStatus({
                message: "Summary must be at least 20 characters long.",
                type: "error"
            });
            return;
        }

        if (improving) return;

        setIsImproving(true);
        setStatus({ message: "", type: "" });
        try {
            const improved = await improveAboutMe(formData.summary);
            if (improved) {
                setFormData(p => ({ ...p, summary: improved }));
                setStatus({
                    message: "Summary improved successfully!",
                    type: "success"
                });
            } else {
                setStatus({
                    message: "Could not improve summary. Try again.",
                    type: "error"
                });
            }
        } catch (error) {
            setStatus({
                message: "Error improving summary: "+error,
                type: "error"
            });
        } finally {
            setIsImproving(false);
        }
    };


    const PopupMessage = () => {
        if (!status.message) return null;

        if (status.type === "confirm") {

            return (
                <div className="popupOverlay">
                    <div className="popupMessage confirm">
                        <span style={{ color: "black", marginRight: "40px" }}>{status.message}</span>
                        <div>
                            <button className="popupButton confirm" onClick={status.onConfirm}>
                                Yes
                            </button>
                            <button className="popupButton cancel" onClick={status.onCancel}>
                                No
                            </button>
                        </div>
                    </div>
                </div>
            );

        }
    };

    const clearForm = () => {
        showConfirm("Are you sure you want to clear all data?", () => {
            setFormData({
                name: "",
                title: "",
                contact: { email: "", phone: "", linkedin: "" },
                summary: "",
                experience: [{ job_title: "", company: "", start_date: "", end_date: "", description: "" }],
                education: [{ degree: "", institution: "", start_year: "", end_year: "" }],
                skills: [""],
                certifications: [""],
                languages: [""],
                custom_sections: [],
            });
            setStatus({
                message: "Form cleared successfully",
                type: "success"
            });
        });
    };

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        showConfirm(
            isEditing ? "Are you sure you want to update this resume?" : "Are you sure you want to save this resume?",
            async () => {
                if (!userId) {
                    setStatus({
                        message: "User not loaded, please try again.",
                        type: "error"
                    });
                    return;
                }

                if (isEditing && editingResumeId) {
                    const { error } = await supabase.from("resumes")
                        .update({
                            data: formData,
                            template: selectedTemplate,
                            theme: selectedTheme,
                        })
                        .eq("id", editingResumeId);

                    if (error) {
                        setStatus({
                            message: "Failed to update resume: " + error.message,
                            type: "error"
                        });
                    } else {
                        setStatus({
                            message: "Resume updated successfully!",
                            type: "success"
                        });
                        navigate("/dashboard");
                    }
                } else {
                    // Create new resume
                    const { error } = await supabase.from("resumes").insert({
                        user_id: userId,
                        data: formData,
                        template: selectedTemplate,
                        theme: selectedTheme
                    });

                    if (error) {
                        setStatus({
                            message: "Failed to save resume: " + error.message,
                            type: "error"
                        });
                    } else {
                        setStatus({
                            message: "Resume saved successfully!",
                            type: "success"
                        });
                        navigate("/dashboard");
                    }
                }
            }
        );
    };


    return (
        <div className="forum-container">
            <div className="form-section">
                <h2>Resume Builder</h2>

                <div className="controls">
                    <div className="control-group">
                        <label>Template:</label>
                        <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}>
                            {templates.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="control-group">
                        <label>Theme:</label>
                        <select value={selectedTheme} onChange={e => setSelectedTheme(e.target.value)}>
                            {themes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <button type="button" onClick={clearForm} className="clear-btn">
                        Clear All
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Personal Info Section */}
                    <div className="form-group">
                        <label>Name:</label>
                        <input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Title:</label>
                        <input value={formData.title} onChange={(e) => handleChange("title", e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input value={formData.contact.email} onChange={(e) => handleContactChange("email", e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Phone:</label>
                        <input value={formData.contact.phone} onChange={(e) => handleContactChange("phone", e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>LinkedIn:</label>
                        <input value={formData.contact.linkedin} onChange={(e) => handleContactChange("linkedin", e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Summary:</label>
                        <textarea value={formData.summary} onChange={(e) => handleChange("summary", e.target.value)} />
                        <button type="button" onClick={handleImproveSummary} disabled={improving} className="ai-btn">
                            {improving ? "Improving..." : "Improve Summary with AI"}
                        </button>
                    </div>

                    {/* Experience Section */}
                    <div className="section">
                        <h3>Experience</h3>
                        {formData.experience.map((exp, i) => (
                            <div key={i} className="array-item">
                                <div className="form-group">
                                    <label>Job Title</label>
                                    <input value={exp.job_title} onChange={(e) => handleArrayChange("experience", i, "job_title", e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Company</label>
                                    <input value={exp.company} onChange={(e) => handleArrayChange("experience", i, "company", e.target.value)} />
                                </div>
                                <div className="date-group">
                                    <div className="form-group">
                                        <label>Start Date</label>
                                        <input type="date" value={exp.start_date} onChange={(e) => handleArrayChange("experience", i, "start_date", e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>End Date</label>
                                        <input type="date" value={exp.end_date} onChange={(e) => handleArrayChange("experience", i, "end_date", e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea value={exp.description} onChange={(e) => handleArrayChange("experience", i, "description", e.target.value)} />
                                </div>
                                <button type="button" onClick={() => removeArrayField("experience", i)} className="remove-btn">
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addArrayField("experience", { job_title: "", company: "", start_date: "", end_date: "", description: "" })} className="add-btn">
                            Add Experience
                        </button>
                    </div>

                    {/* Education Section */}
                    <div className="section">
                        <h3>Education</h3>
                        {formData.education.map((edu, i) => (
                            <div key={i} className="array-item">
                                <div className="form-group">
                                    <label>Degree</label>
                                    <input value={edu.degree} onChange={(e) => handleArrayChange("education", i, "degree", e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Institution</label>
                                    <input value={edu.institution} onChange={(e) => handleArrayChange("education", i, "institution", e.target.value)} />
                                </div>
                                <div className="date-group">
                                    <div className="form-group">
                                        <label>Start Date</label>
                                        <input
                                            type="date"
                                            value={edu.start_year}
                                            onChange={(e) => handleArrayChange("education", i, "start_year", e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>End Date</label>
                                        <input
                                            type="date"
                                            value={edu.end_year}
                                            onChange={(e) => handleArrayChange("education", i, "end_year", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button type="button" onClick={() => removeArrayField("education", i)} className="remove-btn">
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addArrayField("education", { degree: "", institution: "", start_year: "", end_year: "" })} className="add-btn">
                            Add Education
                        </button>
                    </div>

                    {/* Skills Section */}
                    <div className="section">
                        <h3>Skills</h3>
                        {formData.skills.map((s, i) => (
                            <div key={i} className="array-item">
                                <input value={s} onChange={(e) => handleStringArrayChange("skills", i, e.target.value)} />
                                <button type="button" onClick={() => removeStringArrayField("skills", i)} className="remove-btn">
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addStringArrayField("skills")} className="add-btn">
                            Add Skill
                        </button>
                    </div>

                    {/* Certifications Section */}
                    <div className="section">
                        <h3>Certifications</h3>
                        {formData.certifications.map((c, i) => (
                            <div key={i} className="array-item">
                                <input value={c} onChange={(e) => handleStringArrayChange("certifications", i, e.target.value)} />
                                <button type="button" onClick={() => removeStringArrayField("certifications", i)} className="remove-btn">
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addStringArrayField("certifications")} className="add-btn">
                            Add Certification
                        </button>
                    </div>

                    {/* Languages Section */}
                    <div className="section">
                        <h3>Languages</h3>
                        {formData.languages.map((l, i) => (
                            <div key={i} className="array-item">
                                <input value={l} onChange={(e) => handleStringArrayChange("languages", i, e.target.value)} />
                                <button type="button" onClick={() => removeStringArrayField("languages", i)} className="remove-btn">
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addStringArrayField("languages")} className="add-btn">
                            Add Language
                        </button>
                    </div>

                    {/* Custom Sections */}
                    <div className="section">
                        <h3>Custom Sections</h3>
                        {formData.custom_sections.map((sec, secIdx) => (
                            <div key={secIdx} className="array-item">
                                <div className="form-group">
                                    <label>Section Label</label>
                                    <input value={sec.label} onChange={(e) => handleCustomSectionLabel(secIdx, e.target.value)} required />
                                </div>
                                {sec.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="array-item">
                                        <input value={item} onChange={(e) => handleCustomSectionItem(secIdx, itemIdx, e.target.value)} />
                                        <button type="button" onClick={() => removeCustomSectionItem(secIdx, itemIdx)} className="remove-btn">
                                            Remove Item
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addCustomSectionItem(secIdx)} className="add-btn">
                                    Add Item
                                </button>
                                <button type="button" onClick={() => removeCustomSection(secIdx)} className="remove-btn">
                                    Remove Section
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addCustomSection} className="add-btn">
                            Add Custom Section
                        </button>
                    </div>

                    <button type="submit" className="submit-btn">{isEditing ? "Update Resume" : "Save Resume"}</button>
                </form>
            </div>

            <div className="preview-section">
                <ResumePreview data={formData} template={selectedTemplate} theme={selectedTheme} />
            </div>
            <PopupMessage />
            {status.message && status.type !== "confirm" && (
                <div className="popupOverlay">
                    <div className={`popupMessage ${status.type}`}>
                        <span style={{ color: "black", marginRight: "40px" }}>{status.message}</span>
                        <button
                            className="popupClose"
                            onClick={() => setStatus({ message: "", type: "" })}

                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForumPageCV;