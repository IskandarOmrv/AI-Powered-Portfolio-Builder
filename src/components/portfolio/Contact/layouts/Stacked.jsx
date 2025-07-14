import { FiMail, FiPhone, FiLink } from 'react-icons/fi';
import styles from '../ContactSection.module.css';

const StackedLayout = ({ content }) => {
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
            flexDirection: 'column',
            flexWrap: 'wrap',
            maxHeight: 'calc(5 * (1.5rem + 2.5rem))',
            gap: '1rem',
            alignContent: 'center',
            justifyContent: 'center',
            width: '100%'
        }}>
            {items.map((item, index) => (
                <a
                    key={index}
                    href={item.href}
                    target={item.type === 'link' ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className={styles.stackedItem}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        color: 'hsl(var(--foreground))',
                        textDecoration: 'none',
                        width: '200px'
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

export default StackedLayout;