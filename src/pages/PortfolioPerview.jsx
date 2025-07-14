import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PortfolioProvider } from '../context/PortfolioContext';
import PortfolioRenderer from './PortfolioRenderer';
import styles from '../css/PortfolioPreview.module.css'

const PortfolioPreview = () => {
    const { id } = useParams();
    const { state: initialPortfolio } = useLocation();
    const [portfolio, setPortfolio] = useState(initialPortfolio || null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) return;
        supabase
            .from('portfolios')
            .select('id, content')
            .eq('id', id)
            .single()
            .then(({ data, error }) => {
                if (error || !data) navigate('/dashboard');
                else setPortfolio({ ...data.content, id: data.id });
            });
    }, [id, navigate]);

    if (!portfolio) return (<div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
    </div>);

    return (
        <PortfolioProvider>
            <PortfolioRenderer initialPortfolio={portfolio} />
        </PortfolioProvider>
    );
};

export default PortfolioPreview;
