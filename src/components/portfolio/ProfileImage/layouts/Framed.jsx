import styles from '../ProfileImageLayouts.module.css';

const Framed = ({ imageUrl, isEditing }) => {
    return (
        <div className={`${styles.framedContainer} ${isEditing ? styles.editing : ''}`}>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt="Profile"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            ) : (
                <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'hsl(var(--muted))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'hsl(var(--muted-foreground))'
                }}>
                    No Image
                </div>
            )}
        </div>
    );
};
export default Framed;