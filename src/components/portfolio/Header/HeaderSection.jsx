import { useState, useEffect } from 'react';
import Centered from './layouts/Centered';
import Split from './layouts/Split';
import Modern from './layouts/Modern';
import Highlight from './layouts/Highlight'
const HeaderSection = ({ layout, content, isEditing, onChange, onLayoutChange, onError, admin, premium }) => {
    const [localContent, setLocalContent] = useState(content);
    const [errors, setErrors] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        title: ''
    });

    const validateName = (name, value) => {
        if (name === 'middleName' && !value) return '';
        if (!/^[A-Za-z]{2,20}$/.test(value)) {
            return '2–20 letters, English only';
        }
        return '';
    };

    const validateTitle = (value) => {
        if (value.length < 4) return 'At least 4 characters';
        if (value.length > 30) return 'Up to 30 characters';
        return '';
    };

    const handleFieldChange = (field, value) => {

        if (['firstName', 'middleName', 'lastName'].includes(field)) {
            { if (value.length > 20) return; }
        } else if (field === 'title') {
            if (value.length > 30) return;
        }

        // Validate the field
        const error = field === 'title'
            ? validateTitle(value)
            : validateName(field, value);

        setErrors(prev => ({
            ...prev,
            [field]: error
        }));

        const updated = { ...localContent, [field]: value };
        setLocalContent(updated);
        onChange && onChange(updated);
    };

    const handleLayoutSelect = (e) => {
        onLayoutChange && onLayoutChange(e.target.value);
    };

    const layoutMap = { Centered, Split, Modern,Highlight };
    const LayoutComponent = layoutMap[layout] || Centered;
    const LAYOUTS = [
        { value: "Centered", label: "Centered", premium: false },
        { value: "Split", label: "Split", premium: false },
        { value: "Modern", label: "Modern", premium: true },
        { value: "Highlight", label: "Highlight", premium: false },
    ];



    const isSameContent = (a, b) =>
        a.firstName === b.firstName &&
        a.middleName === b.middleName &&
        a.lastName === b.lastName &&
        a.title === b.title;

    useEffect(() => {
        if (!isSameContent(localContent, content)) {
            setLocalContent(content);
            setErrors({
                firstName: '',
                middleName: '',
                lastName: '',
                title: ''
            });
        }
    }, [localContent, content]);

    useEffect(() => {
        if (!isEditing) return;
        const hasError = Object.values(errors).some(Boolean);
        if (typeof onError === 'function') onError('Header', hasError);
    }, [errors, isEditing, onError]);

    return (
        <div style={{
            padding: '2rem 1rem',
            position: 'relative',
            background: 'hsl(var(--header-bg))',
            transition: 'all 0.3s ease'
        }}>
            {isEditing && (
                <div style={{
                    background: 'hsl(var(--editor-bg))',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    boxShadow: '0 4px 12px hsla(var(--shadow-color) / 0.1)',
                    border: '1px solid hsl(var(--border))'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem'
                        }}>
                            {['firstName', 'middleName', 'lastName', 'title'].map((field) => (
                                <div key={field} style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <label style={{
                                            fontSize: '0.875rem',
                                            marginBottom: '0.5rem',
                                            color: 'hsl(var(--muted-foreground))',
                                            fontWeight: '500'
                                        }}>
                                            {field === 'middleName' ? 'Middle (Optional)' :
                                                field.charAt(0).toUpperCase() + field.slice(1)}
                                        </label>
                                        {field !== 'middleName' && (
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: errors[field] ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))'
                                            }}>
                                                {localContent[field]?.length || 0}/{field === 'title' ? 30 : 20}
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        value={localContent[field] || ''}
                                        onChange={(e) => handleFieldChange(field, e.target.value)}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: `2px solid ${errors[field] ? 'hsl(var(--destructive))' : 'hsl(var(--input-border))'}`,
                                            background: 'hsl(var(--input-bg))',
                                            color: 'hsl(var(--input-text))',
                                            fontSize: '1rem',
                                            transition: 'all 0.2s'
                                        }}
                                        placeholder={
                                            field === 'title' ? 'Your Professional Title' :
                                                `Your ${field.charAt(0).toUpperCase() + field.slice(1)}`
                                        }
                                    />
                                    {errors[field] && (
                                        <p style={{
                                            color: 'hsl(var(--destructive))',
                                            fontSize: '0.75rem',
                                            marginTop: '0.25rem'
                                        }}>
                                            {errors[field]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <select
                            value={layout}
                            onChange={handleLayoutSelect}
                            style={{
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '2px solid hsl(var(--input-border))',
                                background: 'hsl(var(--input-bg))',
                                color: 'hsl(var(--input-text))',
                                fontWeight: '500',
                                cursor: 'pointer'
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
            }}>
                <LayoutComponent {...localContent} />
            </div>
        </div>
    );
};

export default HeaderSection;