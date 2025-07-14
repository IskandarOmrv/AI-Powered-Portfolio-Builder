import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import styles from '../../css/BlogCreate.module.css';

const emptyBlock = () => ({ type: 'paragraph', text: '' });

const BlogCreate = ({ currentUser }) => {
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([emptyBlock()]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  if (currentUser?.role !== 'admin') {
    return (
      <div className={styles.unauthorizedMessage}>
        You don't have permission to create blog posts.
      </div>
    );
  }

  const handleBlockChange = (i, field, value) => {
    setBlocks(blocks.map((b, idx) =>
      idx === i ? { ...b, [field]: value } : b
    ));
  };

  const addBlock = (type = "paragraph") => {
    setBlocks([...blocks, { type, text: '' }]);
  };

  const removeBlock = (i) => {
    setBlocks(blocks.length > 1 ? blocks.filter((_, idx) => idx !== i) : blocks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { data, error } = await supabase.from('blogs').insert([{
      title,
      content: blocks,
      author_id: currentUser.id,
    }]).select();
    setSaving(false);
    if (error) return alert(error.message);
    navigate(`/blog/${data[0].id}`);
  };

  return (
    <div className={styles.createContainer}>
      <div className={styles.createHeader}>
        <h1 className={styles.createTitle}>Create New Blog Post</h1>
      </div>
      <div className={styles.backButton} onClick={() => navigate('/blog')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Blog
      </div>

      <form className={styles.createForm} onSubmit={handleSubmit}>
        <input
          className={styles.titleInput}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter blog post title..."
          required
        />

        {blocks.map((block, i) => (
          <div key={i} className={styles.blockContainer}>
            <div className={styles.blockHeader}>
              <select
                className={styles.blockTypeSelect}
                value={block.type}
                onChange={e => handleBlockChange(i, 'type', e.target.value)}
              >
                <option value="heading">Heading</option>
                <option value="paragraph">Paragraph</option>
                <option value="image">Image</option>
                <option value="quote">Quote</option>
              </select>

              <button
                type="button"
                className={styles.removeBlockButton}
                onClick={() => removeBlock(i)}
                disabled={blocks.length === 1}
              >
                Remove Block
              </button>
            </div>

            <div className={styles.blockContent}>
              {block.type === 'image' ? (
                <input
                  type="url"
                  className={styles.imageUrlInput}
                  placeholder="https://example.com/image.jpg"
                  value={block.url || ''}
                  onChange={e => handleBlockChange(i, 'url', e.target.value)}
                  required
                />
              ) : (
                <textarea
                  className={`${styles.blockTextarea} ${block.type === 'heading' ? styles.headingTextarea :
                      block.type === 'quote' ? styles.quoteTextarea : ''
                    }`}
                  value={block.text}
                  onChange={e => handleBlockChange(i, 'text', e.target.value)}
                  placeholder={
                    block.type === 'heading' ? 'Enter heading text...' :
                      block.type === 'quote' ? 'Enter quote text...' :
                        'Enter paragraph text...'
                  }
                  required
                />
              )}
            </div>
          </div>
        ))}

        <div className={styles.addBlockButtons}>
          <button
            type="button"
            className={styles.addBlockButton}
            onClick={() => addBlock("paragraph")}
          >
            Add Paragraph
          </button>
          <button
            type="button"
            className={styles.addBlockButton}
            onClick={() => addBlock("heading")}
          >
            Add Heading
          </button>
          <button
            type="button"
            className={styles.addBlockButton}
            onClick={() => addBlock("image")}
          >
            Add Image
          </button>
          <button
            type="button"
            className={styles.addBlockButton}
            onClick={() => addBlock("quote")}
          >
            Add Quote
          </button>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={saving}
        >
          {saving ? "Publishing..." : "Publish Post"}
        </button>
      </form>
    </div>
  );
};

export default BlogCreate;