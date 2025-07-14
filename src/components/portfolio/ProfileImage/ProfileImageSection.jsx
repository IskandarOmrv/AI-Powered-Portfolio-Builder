import { useState, useRef } from 'react';
import Circle from './layouts/Circle';
import Framed from './layouts/Framed';
import Polaroid from './layouts/Polaroid';

const ProfileImageSection = ({ layout, content, isEditing, onChange, onLayoutChange, admin, premium }) => {
    const [localContent, setLocalContent] = useState(content || { imageUrl: null, scale: 1 });
    const fileInputRef = useRef(null);

    const layoutComponents = { Circle, Framed, Polaroid };
    const LayoutComponent = layoutComponents[layout] || Circle;

    const LAYOUTS = [
        { value: "Circle", label: "Circle", premium: false },
        { value: "Framed", label: "Framed", premium: false },
        { value: "Polaroid", label: "Polaroid", premium: true },
    ];


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const updated = { ...localContent, imageUrl: reader.result };
            setLocalContent(updated);
            onChange(updated);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        const updated = { ...localContent, imageUrl: null, scale: 1 };
        setLocalContent(updated);
        onChange(updated);
    };

    return (
        <div style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            background: 'hsl(var(--header-bg))',
            animation: 'fadeIn 0.5s ease forwards'
        }}>
            {isEditing && (
                <div style={{
                    background: 'hsl(var(--editor-bg))',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '500px',
                    border: '1px solid hsl(var(--border))',
                    boxShadow: '0 4px 12px hsla(var(--shadow-color) / 0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            alignItems: 'center'
                        }}>
                            <button
                                onClick={() => fileInputRef.current.click()}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'hsl(var(--primary))',
                                    color: 'hsl(var(--primary-foreground))',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    flex: 1
                                }}
                            >
                                {localContent.imageUrl ? 'Change Image' : 'Upload Image'}
                            </button>

                            {localContent.imageUrl && (
                                <button
                                    onClick={handleRemoveImage}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'hsl(var(--destructive))',
                                        color: 'hsl(var(--destructive-foreground))',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    Remove
                                </button>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>

                        <select
                            value={layout}
                            onChange={(e) => onLayoutChange(e.target.value)}
                            style={{
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '2px solid hsl(var(--input-border))',
                                background: 'hsl(var(--input-bg))',
                                color: 'hsl(var(--input-text))',
                                fontWeight: '500'
                            }}
                        >
                            {LAYOUTS.map(l => (
                                <option
                                    key={l.value}
                                    value={l.value}
                                    disabled={l.premium && !premium && !admin}
                                    title={l.premium && !premium && !admin? "Upgrade to Premium for this layout" : ""}
                                    style={l.premium && !premium && !admin? { color: "#888", fontStyle: "italic" } : {}}
                                >
                                    {l.label}{l.premium ? " (Premium)" : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
            <div style={{
                opacity: isEditing ? 0.7 : 1,
                transition: 'opacity 0.3s ease'
            }}></div>
            <LayoutComponent
                imageUrl={localContent.imageUrl}
                isEditing={isEditing}
            />
        </div>
    );
};

export default ProfileImageSection;