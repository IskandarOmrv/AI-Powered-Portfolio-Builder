import { useState } from 'react';
import styles from '../css/ContactPage.module.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  return (
    <div className={styles.contactContainer}>
      <header className={styles.contactHeader}>
        <h1 className={styles.contactTitle}>Contact Us</h1>
        <p className={styles.contactSubtitle}>
          Have questions, suggestions, or want to report a bug? We'd love to hear from you!
        </p>
      </header>

      <div className={styles.contactGrid}>
        <form className={styles.contactForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Your Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Your Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className={styles.formTextarea}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Send Message
          </button>
        </form>

        <div className={styles.contactInfo}>
          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <div className={styles.contactIcon}>✉️</div>
              <div>
                <strong>Email:</strong>{' '}
                <a href="mailto:admin@aiportfoliobuilder.com" className={styles.contactLink}>
                  admin@aiportfoliobuilder.com
                </a>
              </div>
            </li>

            <li className={styles.contactItem}>
              <div className={styles.contactIcon}>🔗</div>
              <div>
                <strong>LinkedIn:</strong>{' '}
                <a
                  href="https://www.linkedin.com/company/yourcompany"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  Connect with us
                </a>
              </div>
            </li>

            <li className={styles.contactItem}>
              <div className={styles.contactIcon}>💻</div>
              <div>
                <strong>GitHub:</strong>{' '}
                <a
                  href="https://github.com/your-repo-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  View our repository
                </a>
              </div>
            </li>
          </ul>

          <p className={styles.locationNote}>
            For urgent support, please use email.<br />
            Our team is based in Tbilisi, Georgia.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;