import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';


const NotFound = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        let mounted = true;
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session && mounted) setIsLoggedIn(true);
        });
        return () => { mounted = false; };
    }, []);

    return (
        <div style={{
            backgroundColor: '#b4b4b4ff',
            color: '#ffffff',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        }}>
            <h1 style={{ fontSize: '8rem', margin: 0 }}>404</h1>
            <p style={{ fontSize: '1.5rem', margin: '1rem 0' }}>Oops! The page you're looking for doesn't exist.</p>
            <Link
                to={isLoggedIn ? "/dashboard" : "/"}
                style={{
                    marginTop: '1rem',
                    padding: '0.6rem 1.2rem',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: 500,
                    transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#45a045'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4caf50'}
            >
                Go back home
            </Link>
        </div>
    );
};

export default NotFound;
