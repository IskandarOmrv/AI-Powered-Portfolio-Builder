import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import styles from "../../css/PortfolioManagement.module.css";

const PortfolioManagement = () => {
    const [portfolios, setPortfolios] = useState([]);
    const [filteredPortfolios, setFilteredPortfolios] = useState([]);
    const [status, setStatus] = useState({ message: "", type: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        plan: "",
        startDate: "",
        endDate: ""
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState({
        show: false,
        portfolioId: null
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchPortfolios();
    }, []);

    useEffect(() => {
        filterPortfolios();
    }, [portfolios, searchTerm, filters]);

    async function fetchPortfolios() {
        setStatus({ message: "Loading Portfolios...", type: "info" });
        const { data, error } = await supabase
            .from("portfolios")
            .select("id, user_id, created_at, content, users: user_id (first_name, last_name, email, plan)")
            .order("created_at", { ascending: false });

        if (error) {
            setStatus({ message: "Failed to load portfolios", type: "error" });
        } else {
            setPortfolios(data);
            setStatus(data.length ?
                { message: "", type: "" } :
                { message: "No portfolios found", type: "info" }
            );
        }
    }

    async function deletePortfolio(id) {
        setStatus({ message: "Deleting...", type: "warning" });
        const { error } = await supabase.from("portfolios").delete().eq("id", id);

        if (error) {
            setStatus({ message: "Delete failed", type: "error" });
        } else {
            setPortfolios(pfs => pfs.filter(p => p.id !== id));
            setStatus({ message: "Deleted!", type: "success" });
            setTimeout(() => setStatus({ message: "", type: "" }), 3000);
        }
        setShowDeleteConfirm({ show: false, portfolioId: null });
    }

    function filterPortfolios() {
        let result = [...portfolios];

        // Search by username or email
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(p => {
                const header = p.content.sections?.find(sec => sec.section === "Header")?.content || {};
                const username = `${header.firstName || p.users?.first_name} ${header.lastName || p.users?.last_name}`.toLowerCase();
                const email = p.users?.email.toLowerCase();
                return username.includes(term) || email.includes(term);
            });
        }

        // Filter by plan
        if (filters.plan) {
            result = result.filter(p => p.users?.plan === filters.plan);
        }

        // Filter by date range
        if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
            result = result.filter(p => {
                const createdAt = new Date(p.created_at);
                return createdAt >= start && createdAt <= end;
            });
        }

        setFilteredPortfolios(result);
    }

    function getUsername(p) {
        const header = p.content.sections?.find(sec => sec.section === "Header")?.content || {};
        return `${header.firstName || p.users?.first_name} ${header.lastName || p.users?.last_name}`;
    }

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={styles.header}
                >
                    Portfolio Management
                </motion.h2>

                {status.message && (
                    <div className={styles.popupOverlay}>
                        <div className={`${styles.popupMessage} ${styles[status.type]}`}>
                            <span>{status.message}</span>
                            <button
                                className={styles.popupClose}
                                onClick={() => setStatus({ message: "", type: "" })}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* Search and Filter Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className={styles.filterSection}
                >
                    <div className={styles.filterGrid}>
                        <div>
                            <label className={styles.filterLabel}>Search by Username or Email</label>
                            <input
                                type="text"
                                placeholder="Search portfolios..."
                                className={styles.filterInput}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className={styles.filterLabel}>Plan</label>
                            <select
                                className={styles.filterSelect}
                                value={filters.plan}
                                onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
                            >
                                <option value="">All Plans</option>
                                <option value="free">Free</option>
                                <option value="simple">Simple</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>

                        <div>
                            <label className={styles.filterLabel}>Date Range</label>
                            <div className={styles.dateRangeGrid}>
                                <input
                                    type="date"
                                    className={styles.filterInput}
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                />
                                <input
                                    type="date"
                                    className={styles.filterInput}
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Portfolios Table */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={styles.tableContainer}
                >
                    <div style={{ overflowX: "auto" }}>
                        <table className={styles.table}>
                            <thead className={styles.tableHead}>
                                <tr>
                                    <th className={styles.tableHeader}>Portfolio Username</th>
                                    <th className={styles.tableHeader}>Email</th>
                                    <th className={styles.tableHeader}>Plan</th>
                                    <th className={styles.tableHeader}>Created</th>
                                    <th className={styles.tableHeader}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {status === "Loading portfolios..." ? (
                                        <tr>
                                            <td colSpan={5}>
                                                <div className={styles.spinner}></div>
                                            </td>
                                        </tr>
                                    ) : filteredPortfolios.length > 0 ? (
                                        filteredPortfolios.map((p) => (
                                            <motion.tr
                                                key={p.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className={styles.tableRow}
                                            >
                                                <td className={styles.tableCell}>
                                                    <div className={styles.userAvatar}>
                                                        <div className={styles.avatar}>
                                                            {getUsername(p).charAt(0)}
                                                        </div>
                                                        <div className={styles.userName}>
                                                            {getUsername(p)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={styles.tableCell}>{p.users?.email}</td>
                                                <td className={styles.tableCell}>{p.users?.plan}</td>
                                                <td className={styles.tableCell}>
                                                    {new Date(p.created_at).toLocaleDateString()}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    <div className={styles.actionsCell}>
                                                        <button
                                                            onClick={() => navigate(`/portfolio/${p.id}`)}
                                                            className={`${styles.actionButton} ${styles.previewButton}`}
                                                        >
                                                            Preview
                                                        </button>
                                                        <button
                                                            onClick={() => setShowDeleteConfirm({
                                                                show: true,
                                                                portfolioId: p.id
                                                            })}
                                                            className={`${styles.actionButton} ${styles.deleteButton}`}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <td colSpan={5} className={styles.emptyState}>
                                                No portfolios found
                                            </td>
                                        </motion.tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AnimatePresence>
                {showDeleteConfirm.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.modalOverlay}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className={styles.modalContent}
                        >
                            <h3 className={styles.modalTitle}>Confirm Deletion</h3>
                            <p className={styles.modalMessage}>
                                Are you sure you want to delete this portfolio? This action cannot be undone.
                            </p>
                            <div className={styles.modalActions}>
                                <button
                                    onClick={() => setShowDeleteConfirm({ show: false, portfolioId: null })}
                                    className={`${styles.modalButton} ${styles.modalCancel}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deletePortfolio(showDeleteConfirm.portfolioId)}
                                    className={`${styles.modalButton} ${styles.modalConfirm}`}
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PortfolioManagement;