import styles from '../ProfileImageLayouts.module.css';

const Polaroid = ({ imageUrl, isEditing }) => {
  return (
    <div className={`${styles.polaroidContainer} ${isEditing ? styles.editing : ''}`}>
      {imageUrl ? (
        <div style={{ width: '100%', height: '190px', overflow: 'hidden' }}>
          <img
            src={imageUrl}
            alt="Profile"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'sepia(0.2)'
            }}
          />
        </div>
      ) : (
        <div style={{
          width: '100%',
          height: '190px',
          background: 'hsl(var(--muted))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(var(--muted-foreground))'
        }}>
          No Image
        </div>
      )}
      <div style={{
        marginTop: '15px',
        textAlign: 'center',
        color: 'hsl(var(--muted-foreground))',
        fontFamily: "'Caveat', cursive",
        fontSize: '1.2rem'
      }}>
        {imageUrl ? 'My Profile' : 'Add Photo'}
      </div>
    </div>
  );
};
export default Polaroid;