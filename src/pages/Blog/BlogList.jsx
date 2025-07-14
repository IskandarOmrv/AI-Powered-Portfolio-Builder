import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import BlogDetail from './BlogDetail'
import styles from '../../css/BlogList.module.css';

const BlogList = ({ currentUser }) => {
    const [blogs, setBlogs] = useState([]);
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [sort, setSort] = useState('latest');
    const [loading, setLoading] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            let query = supabase
                .from('blogs')
                .select('*, author:users(first_name, last_name)')
                .order(
                    sort === 'most_viewed'
                        ? 'view_count'
                        : sort === 'most_liked'
                            ? 'like_count'
                            : 'created_at',
                    { ascending: false }
                );

            if (search) {
                query = query.ilike('title', `%${search}%`);
            }
            if (dateFrom) {
                query = query.gte('created_at', dateFrom);
            }
            if (dateTo) {
                query = query.lte('created_at', dateTo);
            }

            const { data, error } = await query;
            if (!error) setBlogs(data || []);
            setLoading(false);
        };
        fetchBlogs();
    }, [search, dateFrom, dateTo, sort]);

    const openPostModal = (blog) => {
        setSelectedPost(blog);
        navigate(`?post=${blog.id}`, { replace: true });
    };

    const closePostModal = () => {
        setSelectedPost(null);
        navigate('', { replace: true });
    };

    function getFirstParagraphText(content) {
        if (!Array.isArray(content)) return '';

        const firstPara = content.find(b => b.type === 'paragraph');
        if (!firstPara) return '';

        return firstPara.text.length > 150
            ? `${firstPara.text.substring(0, 150)}...`
            : firstPara.text;
    }

    return (
        <div className={styles.blogContainer}>
            <div className={styles.blogHeader}>
                <h1 className={styles.blogTitle}>Blog</h1>
                {currentUser?.role === 'admin' && (
                    <button
                        className={styles.createButton}
                        onClick={() => navigate('/blog/new')}
                    >
                        Create Post
                    </button>
                )}
            </div>

            <div className={styles.filtersContainer}>
                <input
                    className={styles.searchInput}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search posts..."
                />
                <input
                    type="date"
                    className={styles.dateInput}
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                />
                <input
                    type="date"
                    className={styles.dateInput}
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                />
                <button
                    className={`${styles.sortButton} ${sort === 'latest' ? styles.activeSort : ''}`}
                    onClick={() => setSort('latest')}
                    disabled={sort === 'latest'}
                >
                    Latest
                </button>
                <button
                    className={`${styles.sortButton} ${sort === 'most_liked' ? styles.activeSort : ''}`}
                    onClick={() => setSort('most_liked')}
                    disabled={sort === 'most_liked'}
                >
                    Most Liked
                </button>
                <button
                    className={`${styles.sortButton} ${sort === 'most_viewed' ? styles.activeSort : ''}`}
                    onClick={() => setSort('most_viewed')}
                    disabled={sort === 'most_viewed'}
                >
                    Most Viewed
                </button>
            </div>

            {loading ? (
                <div className={styles.loadingMessage}>Loading posts...</div>
            ) : blogs.length === 0 ? (
                <div className={styles.emptyMessage}>No posts found matching your criteria</div>
            ) : (
                <ul className={styles.blogList}>
                    {blogs.map(blog => (
                        <li key={blog.id} className={styles.blogCard}>
                            {blog.content?.find(b => b.type === 'image')?.url && (
                                <img
                                    src={blog.content.find(b => b.type === 'image').url}
                                    alt=""
                                    className={styles.blogImage}
                                />
                            )}
                            <div className={styles.blogContent}>
                                <h3 className={styles.blogTitleCard}>{blog.title}</h3>
                                <div className={styles.blogMeta}>
                                    <span>By <span className={styles.blogAuthor}>{blog.author?.first_name} {blog.author?.last_name}</span></span>
                                    <span>•</span>
                                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className={styles.blogDescription}>
                                    {getFirstParagraphText(blog.content)}
                                </p>
                                <div className={styles.blogStats}>
                                    <span>❤️ {blog.like_count || 0} likes</span>
                                    <span>👁️ {blog.view_count || 0} views</span>
                                </div>
                                <button
                                    className={styles.readButton}
                                    onClick={() => openPostModal(blog)}
                                >
                                    Read Post
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {selectedPost && (
                <div className={styles.modalOverlay} onClick={closePostModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <BlogDetail
                            currentUser={currentUser}
                            id={selectedPost.id}
                            onClose={closePostModal}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogList;