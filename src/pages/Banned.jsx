import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const BannedPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        async function logout() {
            await supabase.auth.signOut();
            // setTimeout(() => navigate("/"), 1500);
        }
        logout();
    }, [navigate]);

    return (
        <div style={{ textAlign: "center", marginTop: 100 }}>
            <h2>Your account has been banned.</h2>
            <p>If you believe this is a mistake, please contact support.</p>
            <p>You have been logged out.</p>
        </div>
    );
};

export default BannedPage;
