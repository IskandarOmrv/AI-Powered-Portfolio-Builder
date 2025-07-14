import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useRef } from "react";
import styles from '../../css/BlogDetail.module.css';

const renderBlock = (block, i) => {
    if (block.type === 'heading')
        return <h2 key={i} className={styles.blogContentHeading}>{block.text}</h2>;
    if (block.type === 'image')
        return <img key={i} src={block.url} alt="" className={styles.blogContentImage} />;
    if (block.type === 'quote')
        return <blockquote key={i} className={styles.blogContentQuote}>{block.text}</blockquote>;
    return <p key={i} className={styles.blogContentParagraph}>{block.text}</p>;
};

const BlogDetail = ({ currentUser, id, onClose }) => {
    const [blog, setBlog] = useState(null);
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLike, setUserLike] = useState(null);
    const [likeCount, setLikeCount] = useState(0);
    const [updatingLike, setUpdatingLike] = useState(false);
    const viewedRef = useRef({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            const { data } = await supabase.from('blogs').select('*').eq('id', id).single();
            if (data) {
                setBlog(data);
                setTitle(data.title);
                setBlocks(data.content);
                setLikeCount(data.like_count || 0);
            }
            setLoading(false);
        };
        fetchBlog();
    }, [id]);

    useEffect(() => {
        if (blog && currentUser?.id) {
            const viewKey = `${blog.id}-${currentUser.id}`;
            if (viewedRef.current[viewKey]) return;

            const recordView = async () => {
                const { data: exists } = await supabase
                    .from('blog_views')
                    .select('id')
                    .eq('blog_id', blog.id)
                    .eq('user_id', currentUser.id)
                    .single();
                if (!exists) {
                    await supabase.from('blog_views').insert([
                        { blog_id: blog.id, user_id: currentUser.id }
                    ]);
                    await supabase.rpc('increment_blog_view_count', { blogid: blog.id });
                }
                viewedRef.current[viewKey] = true;
            };
            recordView();
        }
    }, [blog?.id, currentUser?.id]);

    useEffect(() => {
        if (blog && currentUser?.id) {
            supabase
                .from('blog_likes')
                .select('value')
                .eq('blog_id', blog.id)
                .eq('user_id', currentUser.id)
                .maybeSingle()
                .then(({ data }) => setUserLike(data ? data.value : null));
        }
    }, [blog, currentUser]);

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('blogs').update({
            title,
            content: blocks
        }).eq('id', id);
        if (error) return alert(error.message);
        setBlog({ ...blog, title, content: blocks });
        setEditing(false);
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this post?")) return;
        const { error } = await supabase.from('blogs').delete().eq('id', id);
        if (!error) {
            onClose ? onClose() : navigate('/blog');
        }
    };

    const handleLike = async (value) => {
        if (!currentUser?.id) return alert("Log in to vote.");
        if (updatingLike) return;

        setUpdatingLike(true);

        if (userLike === value) {
            const { error } = await supabase.from('blog_likes')
                .delete()
                .eq('blog_id', blog.id)
                .eq('user_id', currentUser.id);
            if (!error) {
                setUserLike(null);
                setLikeCount(await getUpdatedLikeCount(blog.id));
            }
            setUpdatingLike(false);
            return;
        }

        const { error } = await supabase.from('blog_likes').upsert([
            { blog_id: blog.id, user_id: currentUser.id, value }
        ], { onConflict: ['blog_id', 'user_id'] });
        if (!error) {
            setUserLike(value);
            setLikeCount(await getUpdatedLikeCount(blog.id));
        }
        setUpdatingLike(false);
    };

    async function getUpdatedLikeCount(blogId) {
        const { data } = await supabase.from('blogs').select('like_count').eq('id', blogId).single();
        return data?.like_count ?? 0;
    }

    if (loading) return <div>Loading...</div>;
    if (!blog) return <div>Post not found.</div>;

    if (editing && currentUser?.role === 'admin') {
        return (
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={() => setEditing(false)}>
                    &times;
                </button>

                <h2 className={styles.blogDetailTitle}>Edit Blog Post</h2>

                <input
                    className={styles.editTitleInput}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />

                <form onSubmit={handleEditSubmit}>
                    {blocks.map((block, i) => (
                        <div key={i} className={styles.editBlock}>
                            <select
                                className={styles.blockTypeSelect}
                                value={block.type}
                                onChange={e => setBlocks(blocks.map((b, idx) =>
                                    idx === i ? { ...b, type: e.target.value } : b
                                ))}
                            >
                                <option value="heading">Heading</option>
                                <option value="paragraph">Paragraph</option>
                                <option value="image">Image</option>
                                <option value="quote">Quote</option>
                            </select>

                            {block.type === 'image' ? (
                                <input
                                    type="url"
                                    className={styles.imageUrlInput}
                                    placeholder="Image URL"
                                    value={block.url || ''}
                                    onChange={e => setBlocks(blocks.map((b, idx) =>
                                        idx === i ? { ...b, url: e.target.value } : b
                                    ))}
                                    required
                                />
                            ) : (
                                <textarea
                                    className={`${styles.blockTextarea} ${block.type === 'heading' ? styles.headingTextarea :
                                            block.type === 'quote' ? styles.quoteTextarea : ''
                                        }`}
                                    value={block.text}
                                    onChange={e => setBlocks(blocks.map((b, idx) =>
                                        idx === i ? { ...b, text: e.target.value } : b
                                    ))}
                                    required
                                />
                            )}

                            <button
                                type="button"
                                className={styles.removeBlockButton}
                                onClick={() => setBlocks(blocks.length > 1 ? blocks.filter((_, idx) => idx !== i) : blocks)}
                            >
                                Remove Block
                            </button>
                        </div>
                    ))}

                    <div className={styles.editButtons}>
                        <button
                            type="button"
                            className={styles.addBlockButton}
                            onClick={() => setBlocks([...blocks, { type: "paragraph", text: "" }])}
                        >
                            Add Paragraph
                        </button>
                        <button
                            type="button"
                            className={styles.addBlockButton}
                            onClick={() => setBlocks([...blocks, { type: "heading", text: "" }])}
                        >
                            Add Heading
                        </button>
                        <button
                            type="button"
                            className={styles.addBlockButton}
                            onClick={() => setBlocks([...blocks, { type: "image", url: "" }])}
                        >
                            Add Image
                        </button>
                        <button
                            type="button"
                            className={styles.addBlockButton}
                            onClick={() => setBlocks([...blocks, { type: "quote", text: "" }])}
                        >
                            Add Quote
                        </button>
                    </div>

                    <div className={styles.editActionButtons}>
                        <button type="submit" className={styles.saveButton}>Save Changes</button>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={() => setEditing(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={onClose || (() => navigate('/blog'))}>
                &times;
            </button>

            <div className={styles.blogDetailHeader}>
                <h1 className={styles.blogDetailTitle}>{blog.title}</h1>
                <div className={styles.blogDetailDate}>
                    Posted on {new Date(blog.created_at).toLocaleDateString()}
                </div>
            </div>

            <div className={styles.blogContentBlock}>
                {Array.isArray(blog.content) && blog.content.map(renderBlock)}
            </div>

            <div className={styles.likeContainer}>
                <button
                    onClick={() => handleLike(1)}
                    className={`${styles.likeButton} ${userLike === 1 ? styles.activeLike : ''}`}
                    disabled={updatingLike}
                >
                    👍 Like
                </button>
                <button
                    onClick={() => handleLike(-1)}
                    className={`${styles.likeButton} ${userLike === -1 ? styles.activeDislike : ''}`}
                    disabled={updatingLike}
                >
                    👎 Dislike
                </button>
                <span className={styles.likeCount}>{likeCount} likes</span>
                <span className={styles.viewCount}>{blog.view_count || 0} views</span>
            </div>

            {currentUser?.role === 'admin' && (
                <div className={styles.adminControls}>
                    <button
                        className={`${styles.adminButton} ${styles.editButton}`}
                        onClick={() => setEditing(true)}
                    >
                        Edit Post
                    </button>
                    <button
                        className={`${styles.adminButton} ${styles.deleteButton}`}
                        onClick={handleDelete}
                    >
                        Delete Post
                    </button>
                </div>
            )}

            <button
                className={styles.backButton}
                onClick={onClose || (() => navigate('/blog'))}
            >
                ← Back to Blog
            </button>
        </div>
    );
};

export default BlogDetail;