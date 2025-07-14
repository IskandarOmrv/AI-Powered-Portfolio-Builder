import { FiMail, FiPhone, FiLink } from 'react-icons/fi';
import styles from '../ContactSection.module.css';

const InlineLayout = ({ content }) => {
    const items = [
        ...content.emails.filter(Boolean).map(email => ({
            type: 'email',
            value: email,
            icon: <FiMail />,
            href: `mailto:${email}`
        })),
        ...content.phones.filter(Boolean).map(phone => ({
            type: 'phone',
            value: phone,
            icon: <FiPhone />,
            href: `tel:${phone}`
        })),
        ...content.links.filter(link => link.url).map(link => ({
            type: 'link',
            value: link.title || link.url,
            icon: <FiLink />,
            href: link.url
        }))
    ];

return (
    <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        justifyContent: 'center',
        maxWidth: '1000px',
        margin: '0 auto'
    }}>
            {items.map((item, index) => (
                <a
                    key={index}
                    href={item.href}
                    target={item.type === 'link' ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className={styles.inlineItem}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: 'hsl(var(--foreground))',
                        textDecoration: 'none'
                    }}
                >
                    <span style={{
                        color: 'hsl(var(--accent))',
                        fontSize: '1.25rem'
                    }}>
                        {item.icon}
                    </span>
                    <span>{item.value}</span>
                </a>
            ))}
        </div>
    );
};

export default InlineLayout;