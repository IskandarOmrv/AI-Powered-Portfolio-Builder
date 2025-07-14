import { FiMail, FiPhone, FiLink } from 'react-icons/fi';
import styles from '../ContactSection.module.css';

const CardsLayout = ({ content }) => {
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
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            maxWidth: '1200px',
            margin: '0 auto',
            justifyContent: 'center'
        }}>
            {items.map((item, index) => (
                <a
                    key={index}
                    href={item.href}
                    target={item.type === 'link' ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className={styles.cardItem}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        color: 'hsl(var(--foreground))',
                        textDecoration: 'none',
                        background: 'hsl(var(--card))',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span style={{
                            color: 'hsl(var(--accent))',
                            fontSize: '1.25rem'
                        }}>
                            {item.icon}
                        </span>
                        <span>{item.value}</span>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default CardsLayout;