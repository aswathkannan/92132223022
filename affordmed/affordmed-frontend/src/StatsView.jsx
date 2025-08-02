import { useState } from 'react';
import axios from 'axios';

export default function StatsView() {
    const [shortcode, setShortcode] = useState('');
    const [stats, setStats] = useState(null);

    const fetchStats = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/shorturls/${shortcode}`);
            setStats(response.data);
        } catch (err) {
            alert('Failed to fetch stats: ' + err.response.data.message);
        }
    };

    return (
        <div>
            <h2>Check URL Stats</h2>
            <input type="text" placeholder="Shortcode" value={shortcode} onChange={(e) => setShortcode(e.target.value)} />
            <button onClick={fetchStats}>Get Stats</button>

            {stats && (
                <div>
                    <p><strong>Original URL:</strong> {stats.url}</p>
                    <p><strong>Clicks:</strong> {stats.clicks}</p>
                    <p><strong>Expiry:</strong> {stats.expiry}</p>
                    <h4>Click Logs:</h4>
                    <ul>
                        {stats.logs.map((log, index) => (
                            <li key={index}>{log.timestamp} - {log.referrer}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
