import styles from '../ProfileImageLayouts.module.css';

const Circle = ({ imageUrl, isEditing }) => {
    return (
        <div className={`${styles.circleContainer} ${isEditing ? styles.editing : ''}`}>
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
                <img
                    src={'https://placehold.co/600x400.png'}
                    alt="Profile"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            )}
        </div>
    );
};

export default Circle;