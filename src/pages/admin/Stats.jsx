import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import styles from "../../css/Stats.module.css";
import { motion } from "framer-motion";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const startOfDay = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
};
const startOfNDaysAgo = (n) => startOfDay(new Date(Date.now() - n * 24 * 60 * 60 * 1000));

const AdminStats = () => {
    const [loading, setLoading] = useState(true);
    const [userStats, setUserStats] = useState({});
    const [portfolioStats, setPortfolioStats] = useState({});
    const [userChartData, setUserChartData] = useState([]);
    const [portfolioChartData, setPortfolioChartData] = useState([]);
    const [planPie, setPlanPie] = useState([]);
    const [themePie, setThemePie] = useState([]);
    const [error, setError] = useState("");
    const [blogStats, setBlogStats] = useState({});
    const [blogChartData, setBlogChartData] = useState([]);
    const [topViewedBlogs, setTopViewedBlogs] = useState([]);
    const [resumeStats, setResumeStats] = useState({});
    const [resumeChartData, setResumeChartData] = useState([]);
    const [resumeThemePie, setResumeThemePie] = useState([]);


    useEffect(() => {
        (async function fetchStats() {
            setLoading(true);
            setError("");

            try {
                // -- USERS --
                // Total users
                const { count: totalUsers } = await supabase
                    .from('users').select('id', { count: 'exact', head: true });

                // New users today/this week/this month
                const today = startOfDay();
                const week = startOfNDaysAgo(7);
                const month = startOfNDaysAgo(30);

                const { count: newUsersToday } = await supabase
                    .from('users').select('id', { count: 'exact', head: true }).gte('created_at', today);

                const { count: newUsersWeek } = await supabase
                    .from('users').select('id', { count: 'exact', head: true }).gte('created_at', week);

                const { count: newUsersMonth } = await supabase
                    .from('users').select('id', { count: 'exact', head: true }).gte('created_at', month);

                // Users per plan and role
                const { data: usersAll } = await supabase
                    .from('users')
                    .select('id, plan, role, banned, created_at');

                const plans = { free: 0, simple: 0, premium: 0 };
                const roles = { user: 0, admin: 0 };
                let banned = 0;
                usersAll.forEach(u => {
                    plans[u.plan] = (plans[u.plan] || 0) + 1;
                    roles[u.role] = (roles[u.role] || 0) + 1;
                    if (u.banned) banned++;
                });

                // For user signups chart (last 30 days)
                const signupCounts = Array(30).fill(0); // index 0 = today
                usersAll.forEach(u => {
                    const daysAgo = Math.floor((Date.now() - new Date(u.created_at)) / (1000 * 60 * 60 * 24));
                    if (daysAgo >= 0 && daysAgo < 30) signupCounts[29 - daysAgo]++;
                });
                const userChart = signupCounts.map((v, i) => ({
                    date: startOfNDaysAgo(29 - i).slice(5, 10), // MM-DD
                    users: v,
                }));

                // -- PORTFOLIOS --
                // Total
                const { count: totalPortfolios } = await supabase
                    .from('portfolios').select('id', { count: 'exact', head: true });
                // Created today/week/month
                const { count: portfoliosToday } = await supabase
                    .from('portfolios').select('id', { count: 'exact', head: true }).gte('created_at', today);
                const { count: portfoliosWeek } = await supabase
                    .from('portfolios').select('id', { count: 'exact', head: true }).gte('created_at', week);
                const { count: portfoliosMonth } = await supabase
                    .from('portfolios').select('id', { count: 'exact', head: true }).gte('created_at', month);

                // Fetch all portfolios for pie/bar charts
                const { data: portfoliosAll } = await supabase
                    .from('portfolios')
                    .select('content, created_at, user_id');

                // For portfolios chart (last 30 days)
                const portfolioCounts = Array(30).fill(0);
                portfoliosAll.forEach(p => {
                    const daysAgo = Math.floor((Date.now() - new Date(p.created_at)) / (1000 * 60 * 60 * 24));
                    if (daysAgo >= 0 && daysAgo < 30) portfolioCounts[29 - daysAgo]++;
                });
                const portfolioChart = portfolioCounts.map((v, i) => ({
                    date: startOfNDaysAgo(29 - i).slice(5, 10),
                    portfolios: v,
                }));

                // --- RESUMES ---
                const { count: totalResumes } = await supabase
                    .from('resumes').select('id', { count: 'exact', head: true });
                const { count: resumesToday } = await supabase
                    .from('resumes').select('id', { count: 'exact', head: true }).gte('created_at', today);
                const { count: resumesWeek } = await supabase
                    .from('resumes').select('id', { count: 'exact', head: true }).gte('created_at', week);
                const { count: resumesMonth } = await supabase
                    .from('resumes').select('id', { count: 'exact', head: true }).gte('created_at', month);

                const { data: resumesAll } = await supabase
                    .from('resumes')
                    .select('theme, data, created_at, user_id');

                const resumeCounts = Array(30).fill(0);
                resumesAll.forEach(r => {
                    const daysAgo = Math.floor((Date.now() - new Date(r.created_at)) / (1000 * 60 * 60 * 24));
                    if (daysAgo >= 0 && daysAgo < 30) resumeCounts[29 - daysAgo]++;
                });
                const resumeChart = resumeCounts.map((v, i) => ({
                    date: startOfNDaysAgo(29 - i).slice(5, 10),
                    resumes: v,
                }));

                const resumeThemeCount = {};
                resumesAll.forEach(r => {
                    const theme = r.theme || r.data?.theme || "N/A";
                    resumeThemeCount[theme] = (resumeThemeCount[theme] || 0) + 1;
                });
                const resumeThemePieChart = Object.entries(resumeThemeCount).map(([theme, value]) => ({
                    name: theme,
                    value,
                }));

                setResumeStats({
                    totalResumes, resumesToday, resumesWeek, resumesMonth
                });
                setResumeChartData(resumeChart);
                setResumeThemePie(resumeThemePieChart);



                // --- BLOGS ---
                const { count: totalBlogs } = await supabase
                    .from('blogs').select('id', { count: 'exact', head: true });

                const { count: blogsToday } = await supabase
                    .from('blogs').select('id', { count: 'exact', head: true }).gte('created_at', today);

                const { count: blogsWeek } = await supabase
                    .from('blogs').select('id', { count: 'exact', head: true }).gte('created_at', week);

                const { count: blogsMonth } = await supabase
                    .from('blogs').select('id', { count: 'exact', head: true }).gte('created_at', month);

                const { data: blogsAll } = await supabase
                    .from('blogs')
                    .select('id, title, view_count, created_at, like_count')
                    .order('created_at', { ascending: false });

                const totalViews = blogsAll.reduce((acc, b) => acc + (b.view_count || 0), 0);

                const blogCounts = Array(30).fill(0);
                blogsAll.forEach(b => {
                    const daysAgo = Math.floor((Date.now() - new Date(b.created_at)) / (1000 * 60 * 60 * 24));
                    if (daysAgo >= 0 && daysAgo < 30) blogCounts[29 - daysAgo]++;
                });
                const blogChart = blogCounts.map((v, i) => ({
                    date: startOfNDaysAgo(29 - i).slice(5, 10),
                    blogs: v,
                }));

                const topBlogs = blogsAll
                    .slice()
                    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
                    .slice(0, 5)
                    .map(b => ({
                        title: b.title,
                        views: b.view_count || 0,
                        likes: b.like_count || 0
                    }));

                setBlogStats({
                    totalBlogs, blogsToday, blogsWeek, blogsMonth, totalViews
                });
                setBlogChartData(blogChart);
                setTopViewedBlogs(topBlogs);


                // Premium/simple plan usage
                const userPlanMap = {};
                usersAll.forEach(u => userPlanMap[u.id] = u.plan);
                let simpleCount = 0, premiumCount = 0;
                portfoliosAll.forEach(p => {
                    if (userPlanMap[p.user_id] === "premium") premiumCount++;
                    else if (userPlanMap[p.user_id] === "simple") simpleCount++;
                });

                // Pie for user plans
                const planPieChart = Object.entries(plans).map(([plan, value]) => ({
                    name: plan.charAt(0).toUpperCase() + plan.slice(1),
                    value,
                }));

                // Pie for portfolio themes
                const themeCount = {};
                portfoliosAll.forEach(p => {
                    const theme = p.content.theme || "N/A";
                    themeCount[theme] = (themeCount[theme] || 0) + 1;
                });
                const themePieChart = Object.entries(themeCount).map(([theme, value]) => ({
                    name: theme,
                    value,
                }));

                setUserStats({
                    totalUsers, newUsersToday, newUsersWeek, newUsersMonth,
                    plans, roles, banned
                });
                setPortfolioStats({
                    totalPortfolios, portfoliosToday, portfoliosWeek, portfoliosMonth,
                    simpleCount, premiumCount
                });
                setUserChartData(userChart);
                setPortfolioChartData(portfolioChart);
                setPlanPie(planPieChart);
                setThemePie(themePieChart);

                setLoading(false);
            } catch (e) {
                setError(e.message);
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return (
        <div className={styles.container}>
            <div className={styles.spinner}></div>
        </div>
    );

    if (error) return (
        <div className={styles.container}>
            <div className={styles.error}>{error}</div>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={styles.header}
                >
                    Site Statistics
                </motion.h2>

                <div className={styles.statsContainer}>
                    {/* USER STATS */}
                    <div className={styles.statsCard}>
                        <h3 className={styles.statsTitle}>User Stats</h3>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Total Users:</span>
                            <span className={styles.statValue}>{userStats.totalUsers}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>New Today:</span>
                            <span className={styles.statValue}>{userStats.newUsersToday}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>New This Week:</span>
                            <span className={styles.statValue}>{userStats.newUsersWeek}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>New This Month:</span>
                            <span className={styles.statValue}>{userStats.newUsersMonth}</span>
                        </div>
                        {Object.entries(userStats.plans || {}).map(([plan, count]) => (
                            <div key={plan} className={styles.statItem}>
                                <span className={styles.statLabel}>{plan.charAt(0).toUpperCase() + plan.slice(1)}:</span>
                                <span className={styles.statValue}>{count}</span>
                            </div>
                        ))}
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Banned Users:</span>
                            <span className={styles.statValue}>{userStats.banned}</span>
                        </div>
                    </div>

                    {/* PORTFOLIO STATS */}
                    <div className={styles.statsCard}>
                        <h3 className={styles.statsTitle}>Portfolio Stats</h3>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Total Portfolios:</span>
                            <span className={styles.statValue}>{portfolioStats.totalPortfolios}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Created Today:</span>
                            <span className={styles.statValue}>{portfolioStats.portfoliosToday}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Created This Week:</span>
                            <span className={styles.statValue}>{portfolioStats.portfoliosWeek}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Created This Month:</span>
                            <span className={styles.statValue}>{portfolioStats.portfoliosMonth}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Premium Plan Usage:</span>
                            <span className={styles.statValue}>{portfolioStats.premiumCount}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Simple Plan Usage:</span>
                            <span className={styles.statValue}>{portfolioStats.simpleCount}</span>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className={styles.chartsContainer}>
                    {/* User Signups Chart */}
                    <div className={styles.chartCard}>
                        <h4 className={styles.chartTitle}>New Users (last 30 days)</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={userChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Portfolio Creation Chart */}
                    <div className={styles.chartCard}>
                        <h4 className={styles.chartTitle}>New Portfolios (last 30 days)</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={portfolioChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="portfolios" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={styles.chartsContainer}>
                    {/* User Plans Pie */}
                    <div className={styles.chartCard}>
                        <h4 className={styles.chartTitle}>User Plans</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={planPie}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {planPie.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Portfolio Themes Pie */}
                    <div className={styles.chartCard}>
                        <h4 className={styles.chartTitle}>Portfolio Themes</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={themePie}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {themePie.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* BLOG STATS */}
                    <div className={styles.statsCard}>
                        <h3 className={styles.statsTitle}>Blog Stats</h3>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Total Posts:</span>
                            <span className={styles.statValue}>{blogStats.totalBlogs}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>New Today:</span>
                            <span className={styles.statValue}>{blogStats.blogsToday}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>New This Week:</span>
                            <span className={styles.statValue}>{blogStats.blogsWeek}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>New This Month:</span>
                            <span className={styles.statValue}>{blogStats.blogsMonth}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Total Blog Views:</span>
                            <span className={styles.statValue}>{blogStats.totalViews}</span>
                        </div>
                    </div>

                    {/* Resume Stats */}
                    <div className={styles.statsCard}>
                        <h3 className={styles.statsTitle}>Resume Stats</h3>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Total Resumes:</span>
                            <span className={styles.statValue}>{resumeStats.totalResumes}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Created Today:</span>
                            <span className={styles.statValue}>{resumeStats.resumesToday}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Created This Week:</span>
                            <span className={styles.statValue}>{resumeStats.resumesWeek}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Created This Month:</span>
                            <span className={styles.statValue}>{resumeStats.resumesMonth}</span>
                        </div>
                    </div>
                    <div className={styles.statsCard}>
                        <h3 className={styles.statsTitle}>Top 5 Most Viewed Blog Posts</h3>
                        <table className={styles.topTable}>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Views</th>
                                    <th>Likes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topViewedBlogs.map((b, i) => (
                                    <tr key={i}>
                                        <td>{b.title}</td>
                                        <td>{b.views}</td>
                                        <td>{b.likes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Resume Themes Pie */}
                    <div className={styles.chartCard}>
                        <h4 className={styles.chartTitle}>Resume Themes</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={resumeThemePie}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#00C49F"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {resumeThemePie.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                        {/* Blog Posts Chart */}
                        <div className={styles.chartCard}>
                            <h4 className={styles.chartTitle}>New Blog Posts (last 30 days)</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={blogChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="blogs" fill="#ffbb28" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>


                    {/* Resume Creation Chart */}
                    <div className={styles.chartCard}>
                        <h4 className={styles.chartTitle}>New Resumes (last 30 days)</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={resumeChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="resumes" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default AdminStats;