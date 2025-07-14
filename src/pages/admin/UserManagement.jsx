import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import styles from "../../css/UserManagement.module.css";

const PLAN_OPTIONS = ["free", "simple", "premium"];
const ROLE_OPTIONS = ["user", "admin"];

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    const [status, setStatus] = useState({ message: "", type: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        plan: "",
        role: "",
        startDate: "",
        endDate: ""
    });
    const [showConfirmation, setShowConfirmation] = useState({
        show: false,
        message: "",
        action: null
    });
    const [showActionsDropdown, setShowActionsDropdown] = useState(null);
    const [showEmailUpdate, setShowEmailUpdate] = useState({
        show: false,
        userId: null,
        email: "",
        error: ""
    });
    const [showResetConfirm, setShowResetConfirm] = useState({
        show: false,
        message: "",
        isError: false
    });


    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, filters]);


    const DURATION_OPTIONS = {
        simple: [
            { value: "1m", label: "1 month" },
            { value: "3m", label: "3 months" },
            { value: "1y", label: "1 year" }
        ],
        premium: [
            { value: "1m", label: "1 month" },
            { value: "3m", label: "3 months" },
            { value: "1y", label: "1 year" }
        ]
    };


    const getExpirationDate = (duration) => {
        const expires = new Date();
        if (duration === "1m") expires.setMonth(expires.getMonth() + 1);
        if (duration === "3m") expires.setMonth(expires.getMonth() + 3);
        if (duration === "1y") expires.setFullYear(expires.getFullYear() + 1);
        return expires.toISOString();
    };

    const [planEditState, setPlanEditState] = useState({
        userId: null,
        currentPlan: "",
        newPlan: "",
        showDuration: false
    });

    const handlePlanClick = (user, plan) => {
        if (plan === "free") {
            setShowConfirmation({
                show: true,
                message: `Change ${user.first_name}'s plan from ${user.plan} to free?`,
                action: async () => {
                    await updateUser(user.id, "plan", "free");
                    await updateUser(user.id, "plan_expires_at", null);
                }
            });
        } else {
            setPlanEditState({
                userId: user.id,
                currentPlan: user.plan,
                newPlan: plan,
                showDuration: true
            });
        }
    };

    const handleDurationSelect = (user, duration) => {
        const actionMessage = user.plan === planEditState.newPlan
            ? `Change ${user.first_name}'s ${user.plan} plan duration to ${DURATION_OPTIONS[planEditState.newPlan].find(d => d.value === duration).label}?`
            : `Change ${user.first_name}'s plan from ${user.plan} to ${planEditState.newPlan} for ${DURATION_OPTIONS[planEditState.newPlan].find(d => d.value === duration).label}?`;

        setShowConfirmation({
            show: true,
            message: actionMessage,
            action: async () => {
                await updateUser(user.id, "plan", planEditState.newPlan);
                await updateUser(user.id, "plan_expires_at", getExpirationDate(duration));
                setPlanEditState({
                    userId: null,
                    currentPlan: "",
                    newPlan: "",
                    showDuration: false
                });
            }
        });
    };

    async function fetchUsers() {
        setStatus({ message: "Loading Users...", type: "info" });
        const { data, error } = await supabase
            .from("users")
            .select("id, email, first_name, last_name, created_at, role, plan, plan_expires_at, banned");

        if (error) {
            setStatus({ message: "Failed to load users", type: "error" });
        } else {
            setUsers(data);
            setStatus({ message: "", type: "" });
        }
    }

    async function updateUser(id, field, value) {
        setStatus({ message: "Updating...", type: "warning" });
        const { error } = await supabase
            .from("users")
            .update({ [field]: value })
            .eq("id", id);

        if (error) {
            setStatus({ message: "Update failed", type: "error" });
        } else {
            setStatus({ message: "Updated!", type: "success" });
            setUsers(users =>
                users.map(u => (u.id === id ? { ...u, [field]: value } : u))
            );
            setTimeout(() => setStatus({ message: "", type: "" }), 3000);
        }
    }

    async function deleteUser(id) {
        const { error } = await supabase.from("users").delete().eq("id", id);
        if (error) {
            setStatus({ message: "Delete failed", type: "error" });
        } else {
            setStatus({ message: "Deleted!", type: "success" });
            setUsers(users => users.filter(u => u.id !== id));
            setTimeout(() => setStatus({ message: "", type: "" }), 3000);
        }
    }

    function filterUsers() {
        let result = [...users];

        if (searchTerm) {
            result = result.filter(user =>
                `${user.first_name} ${user.last_name}${user.email}`.toLowerCase().includes(searchTerm.toLowerCase()))
        }

        if (filters.plan) {
            result = result.filter(user => user.plan === filters.plan);
        }

        if (filters.role) {
            result = result.filter(user => user.role === filters.role);
        }

        if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
            result = result.filter(user => {
                const createdAt = new Date(user.created_at);
                return createdAt >= start && createdAt <= end;
            });
        }

        setFilteredUsers(result);
    }

    function handleRoleChange(user) {
        const newRole = user.role === "user" ? "admin" : "user";
        setShowConfirmation({
            show: true,
            message: `Are you sure you want to ${newRole === "admin" ? "make" : "remove"} this user ${newRole === "admin" ? "an admin" : "from admin"}?`,
            action: () => updateUser(user.id, "role", newRole)
        });
    }

    function handleDelete(user) {
        setShowConfirmation({
            show: true,
            message: `Delete ${user.first_name} ${user.last_name} and all their data? This cannot be undone.`,
            action: () => deleteUser(user.id)
        });
    }

    const handleSendResetEmail = async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
            setShowResetConfirm({
                show: true,
                message: "Failed to send password reset email.",
                isError: true
            });
        } else {
            setShowResetConfirm({
                show: true,
                message: "Password reset email sent successfully.",
                isError: false
            });
        }
        setShowActionsDropdown(null);
    };

    const handleEmailUpdate = async (userId, currentEmail) => {
        setShowEmailUpdate({
            show: true,
            userId,
            email: currentEmail,
            error: ""
        });
        setShowActionsDropdown(null);
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const submitEmailUpdate = async () => {
        if (!validateEmail(showEmailUpdate.email)) {
            setShowEmailUpdate({ ...showEmailUpdate, error: "Please enter a valid email address" });
            return;
        }

        const { error } = await supabase.auth.updateUser({ email: showEmailUpdate.email });
        if (error) {
            setShowResetConfirm({
                show: true,
                message: "Failed to send email update confirmation.",
                isError: true
            });
        } else {
            setShowResetConfirm({
                show: true,
                message: "Confirmation sent to new email. User must confirm the change.",
                isError: false
            });
        }
        setShowEmailUpdate({ show: false, userId: null, email: "", error: "" });
    };


    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={styles.header}
                >
                    User Management
                </motion.h2>


                {status.message && (
                    <div className={styles.popupOverlay}>
                        <div className={`${styles.popupMessage} ${styles[status.type]}`}>
                            <span style={{ color: "black", marginRight: "40px" }}>{status.message}</span>
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
                            <label className={styles.filterLabel}>Search by Name and Email</label>
                            <input
                                type="text"
                                placeholder="Search users..."
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
                                {PLAN_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>
                                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={styles.filterLabel}>Role</label>
                            <select
                                className={styles.filterSelect}
                                value={filters.role}
                                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                            >
                                <option value="">All Roles</option>
                                {ROLE_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>
                                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                    </option>
                                ))}
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

                {/* Users Table */}
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
                                    <th className={styles.tableHeader}>Name</th>
                                    <th className={styles.tableHeader}>Email</th>
                                    <th className={styles.tableHeader}>Plan</th>
                                    <th className={styles.tableHeader}>Role</th>
                                    <th className={styles.tableHeader}>Status</th>
                                    <th className={styles.tableHeader}>Created</th>
                                    <th className={styles.tableHeader}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <motion.tr
                                                key={user.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className={styles.tableRow}
                                            >
                                                <td className={styles.tableCell}>
                                                    <div className={styles.userAvatar}>
                                                        <div className={styles.avatar}>
                                                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                                        </div>
                                                        <div className={styles.userName}>
                                                            {user.first_name} {user.last_name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={styles.tableCell}>{user.email}</td>
                                                <td className={styles.tableCell}>
                                                    <div className={styles.planDropdown}>
                                                        {user.plan !== 'free' && user.plan_expires_at && (
                                                            <div className={styles.expirationDate}>
                                                                Expires: {new Date(user.plan_expires_at).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                        <div className={styles.planSelect}>
                                                            {PLAN_OPTIONS.map((plan) => (
                                                                <div key={plan} className={styles.planOptionWrapper}>
                                                                    <button
                                                                        className={`${styles.planOption} ${user.plan === plan ? styles.activePlan : ''}`}
                                                                        onClick={() => {
                                                                            if (plan !== 'free' && planEditState.userId === user.id &&
                                                                                planEditState.newPlan === plan) {
                                                                                setPlanEditState({
                                                                                    userId: null,
                                                                                    currentPlan: "",
                                                                                    newPlan: "",
                                                                                    showDuration: false
                                                                                });
                                                                            } else {
                                                                                handlePlanClick(user, plan);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {plan.charAt(0).toUpperCase() + plan.slice(1)}
                                                                        {plan !== 'free' && (
                                                                            <span className={styles.dropdownArrow}>
                                                                                {planEditState.userId === user.id && planEditState.newPlan === plan ? '▲' : '▼'}
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                    {planEditState.userId === user.id &&
                                                                        planEditState.newPlan === plan &&
                                                                        planEditState.showDuration && (
                                                                            <div className={styles.durationDropdown}>
                                                                                {DURATION_OPTIONS[plan].map(({ value, label }) => (
                                                                                    <button
                                                                                        key={value}
                                                                                        className={styles.durationOption}
                                                                                        onClick={() => handleDurationSelect(user, value)}
                                                                                    >
                                                                                        {label}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={styles.tableCell}>
                                                    <button
                                                        onClick={() => handleRoleChange(user)}
                                                        className={`${styles.roleButton} ${user.role === "admin"
                                                            ? styles.roleButtonAdmin
                                                            : styles.roleButtonUser
                                                            }`}
                                                    >
                                                        {user.role === "user" ? "Make Admin" : "Remove Admin"}
                                                    </button>
                                                </td>
                                                <td className={styles.tableCell}>
                                                    <button
                                                        onClick={() => updateUser(user.id, "banned", !user.banned)}
                                                        className={`${styles.statusButton} ${user.banned
                                                            ? styles.statusButtonBanned
                                                            : styles.statusButtonActive
                                                            }`}
                                                    >
                                                        {user.banned ? "Banned (Unban)" : "Active (Ban)"}
                                                    </button>
                                                </td>
                                                <td className={styles.tableCell}>
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    <div className={styles.actionsDropdown}>
                                                        <button
                                                            onClick={() => setShowActionsDropdown(showActionsDropdown === user.id ? null : user.id)}
                                                            className={styles.actionsButton}
                                                        >
                                                            Actions
                                                        </button>
                                                        {showActionsDropdown === user.id && (
                                                            <div className={styles.dropdownContent}>
                                                                <button
                                                                    onClick={() => handleSendResetEmail(user.email)}
                                                                    className={styles.dropdownButton}
                                                                >
                                                                    Send Password Reset
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEmailUpdate(user.id, user.email)}
                                                                    className={styles.dropdownButton}
                                                                >
                                                                    Update Email
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(user)}
                                                                    className={`${styles.dropdownButton} ${styles.dropdownButtonDanger}`}
                                                                >
                                                                    Delete User
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={styles.tableRow}
                                        >
                                            <td colSpan={7} className={styles.tableCell} style={{ textAlign: "center" }}>
                                                No users found
                                            </td>
                                        </motion.tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>


            {/* Confirmation Dialog */}
            <AnimatePresence>
                {showConfirmation.show && (
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
                            <h3 className={styles.modalTitle}>Confirm Action</h3>
                            <p className={styles.modalMessage}>{showConfirmation.message}</p>
                            <div className={styles.modalActions}>
                                <button
                                    onClick={() => setShowConfirmation({ show: false, message: "", action: null })}
                                    className={`${styles.modalButton} ${styles.modalCancel}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        showConfirmation.action();
                                        setShowConfirmation({ show: false, message: "", action: null });
                                    }}
                                    className={`${styles.modalButton} ${styles.modalConfirm}`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Email Update Modal */}
            <AnimatePresence>
                {showEmailUpdate.show && (
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
                            <h3 className={styles.modalTitle}>Update User Email</h3>
                            <p style={{ color: 'black' }} >Current email: {showEmailUpdate.email}</p>
                            <input
                                type="email"
                                placeholder="Enter new email"
                                className={styles.emailInput}
                                value={showEmailUpdate.email}
                                onChange={(e) => setShowEmailUpdate({
                                    ...showEmailUpdate,
                                    email: e.target.value,
                                    error: ""
                                })}
                            />
                            {showEmailUpdate.error && (
                                <div className={styles.emailError}>{showEmailUpdate.error}</div>
                            )}
                            <div className={styles.modalActions}>
                                <button
                                    onClick={() => setShowEmailUpdate({ show: false, userId: null, email: "", error: "" })}
                                    className={`${styles.modalButton} ${styles.modalCancel}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitEmailUpdate}
                                    className={`${styles.modalButton} ${styles.modalConfirm}`}
                                >
                                    Update Email
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reset Confirmation Modal */}
            <AnimatePresence>
                {showResetConfirm.show && (
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
                            <h3 className={styles.modalTitle}>
                                {showResetConfirm.isError ? "Error" : "Success"}
                            </h3>
                            <p className={styles.modalMessage}>{showResetConfirm.message}</p>
                            <div className={styles.modalActions}>
                                <button
                                    onClick={() => setShowResetConfirm({ show: false, message: "", isError: false })}
                                    className={`${styles.modalButton} ${styles.modalConfirm}`}
                                >
                                    OK
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUserManagement;