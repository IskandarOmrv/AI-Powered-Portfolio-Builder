import { useState, useEffect } from 'react';
import LeftAligned from './layouts/LeftAligned';
import Centered from './layouts/Centered';
import Interactive from './layouts/Interactive';
import CardStack from './layouts/CardStack'

const AboutMeSection = ({ layout, content, isEditing, onChange, onLayoutChange, onError, admin, premium }) => {
    const [localText, setLocalText] = useState(content.text || '');
    const [error, setError] = useState('');

    const handleTextChange = (e) => {
        const newText = e.target.value;
        if (newText.length > 3000) {
            setError('Maximum 3000 characters reached');
            return;
        }
        if (newText.length < 15) {
            setError('Minimum 15 characters required');
        } else {
            setError('');
        }
        setLocalText(newText);
        onChange({ text: newText });
    };

    const handleLayoutSelect = (e) => {
        onLayoutChange(e.target.value);
    };

    const layoutMap = {
        LeftAligned,
        Centered,
        Interactive,
        CardStack
    };
    const LAYOUTS = [
        { value: "LeftAligned", label: "Left Aligned", premium: false },
        { value: "Centered", label: "Centered", premium: true },
        { value: "Interactive", label: "Interactive", premium: false },
        { value: "CardStack", label: "CardStack", premium: false },
    ];
    const LayoutComponent = layoutMap[layout] || LeftAligned;
    useEffect(() => {
        if (typeof onError === 'function') {
            onError('AboutMe', !!error);
        }
    }, [error, onError]);
    return (
        <div style={{
            padding: '2rem',
            background: 'hsl(var(--header-bg))',
            transition: 'background 0.3s ease',
            paddingBottom: '100px',
            paddingTop: '100px'
        }}>
            {isEditing && (
                <div style={{
                    background: 'hsl(var(--editor-bg))',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    border: '1px solid hsl(var(--border))',
                    boxShadow: '0 4px 12px hsla(var(--shadow-color) / 0.1)'
                }}>
                    <select
                        value={layout}
                        onChange={handleLayoutSelect}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            marginBottom: '1.5rem',
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

                    <div style={{ position: 'relative' }}>
                        <textarea
                            value={localText}
                            onChange={handleTextChange}
                            maxLength={3000}
                            placeholder="Tell your story..."
                            style={{
                                width: '100%',
                                minHeight: '200px',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: `2px solid ${error ? 'hsl(var(--destructive))' : 'hsl(var(--input-border))'}`,
                                background: 'hsl(var(--input-bg))',
                                color: 'hsl(var(--input-text))',
                                fontSize: '1rem',
                                lineHeight: '1.6'
                            }}
                        />

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '0.5rem'
                        }}>
                            {error && (
                                <span style={{
                                    color: 'hsl(var(--destructive))',
                                    fontSize: '0.875rem'
                                }}>
                                    {error}
                                </span>
                            )}
                            <span style={{
                                color: localText.length >= 3000 ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))',
                                fontSize: '0.875rem',
                                marginLeft: 'auto'
                            }}>
                                {localText.length}/3000
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <LayoutComponent text={isEditing ? localText : content.text} />
        </div>
    );
};

export default AboutMeSection;