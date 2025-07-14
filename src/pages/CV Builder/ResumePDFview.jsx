import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import ResumePreview from "./ResumePreview";
import html2pdf from "html2pdf.js";

const ResumePDFView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const componentRef = useRef();

    useEffect(() => {
        const fetchResume = async () => {
            const { data, error } = await supabase.from("resumes").select("*").eq("id", id).single();
            if (error || !data) {
                alert("Resume not found.");
                navigate("/dashboard");
            } else {
                setResume(data);
            }
            setLoading(false);
        };
        fetchResume();
    }, [id, navigate]);

    const handleDownload = () => {
        if (componentRef.current) {
            html2pdf()
                .from(componentRef.current)
                .set({
                    margin: 0,
                    filename: `Resume-${resume?.data?.name || "CV"}.pdf`,
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: "pt", format: "a4", orientation: "portrait" }
                })
                .save();
        }
    };

    const handleEdit = () => {
        if (resume?.data) {
            localStorage.setItem("resumeFormData", JSON.stringify(resume.data));
            localStorage.setItem("editingResumeId", id);
            localStorage.setItem("resumeTemplate", resume.template);
            localStorage.setItem("resumeTheme", resume.theme);
            navigate("/forumpage_resume");
        }
    };

    const handleDelete = async () => {
        const { error } = await supabase.from("resumes").delete().eq("id", id);
        if (error) {
            alert("Error deleting resume: " + error.message);
        } else {
            navigate("/dashboard");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "2rem" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
                <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                    flexWrap: "wrap",
                    gap: "1rem"
                }}>
                    <button
                        onClick={() => navigate("/dashboard")}
                        style={{
                            padding: "0.5rem 1.5rem",
                            background: "#fff",
                            color: "#333",
                            border: "1px solid #ccc",
                            borderRadius: 4,
                            cursor: "pointer"
                        }}
                    >
                        Back to Dashboard
                    </button>
                    
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button
                            onClick={handleEdit}
                            style={{
                                padding: "0.5rem 1.5rem",
                                background: "#fff",
                                color: "#333",
                                border: "1px solid #ccc",
                                borderRadius: 4,
                                cursor: "pointer"
                            }}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            style={{
                                padding: "0.5rem 1.5rem",
                                background: "#f44336",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer"
                            }}
                        >
                            Delete
                        </button>
                        <button
                            onClick={handleDownload}
                            style={{
                                padding: "0.5rem 1.5rem",
                                background: "#2196F3",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer"
                            }}
                        >
                            Download PDF
                        </button>
                    </div>
                </div>

                {showDeleteConfirm && (
                    <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: "white",
                            padding: "2rem",
                            borderRadius: "8px",
                            maxWidth: "400px",
                            width: "90%"
                        }}>
                            <h3 style={{ marginTop: 0 }}>Delete Resume</h3>
                            <p>Are you sure you want to delete this resume? This action cannot be undone.</p>
                            <div style={{ 
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "1rem",
                                marginTop: "1.5rem"
                            }}>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    style={{
                                        padding: "0.5rem 1.5rem",
                                        background: "#f1f1f1",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    style={{
                                        padding: "0.5rem 1.5rem",
                                        background: "#f44336",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* PDF content */}
                <div ref={componentRef}>
                    <ResumePreview
                        data={resume?.data || {}}
                        template={resume?.template}
                        theme={resume?.theme}
                    />
                </div>
            </div>
        </div>
    );
};

export default ResumePDFView;