import { useState } from 'react';
import axios from 'axios';

export default function ShortenerForm() {
    const [url, setUrl] = useState('');
    const [validity, setValidity] = useState(30);
    const [shortcode, setShortcode] = useState('');
    const [shortLink, setShortLink] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/shorturls', {
                url,
                validity: parseInt(validity),
                shortcode: shortcode || undefined
            });
            setShortLink(response.data.shortLink);
        } catch (err) {
            alert('Failed to create short URL: ' + err.response.data.message);
        }
    };

    return (
        <div>
            <h2>Create Short URL</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Long URL" value={url} onChange={(e) => setUrl(e.target.value)} required />
                <input type="number" placeholder="Validity (mins)" value={validity} onChange={(e) => setValidity(e.target.value)} />
                <input type="text" placeholder="Custom Shortcode (optional)" value={shortcode} onChange={(e) => setShortcode(e.target.value)} />
                <button type="submit">Shorten URL</button>
            </form>
            {shortLink && (
                <div>
                    <h3>Short URL:</h3>
                    <a href={shortLink} target="_blank" rel="noreferrer">{shortLink}</a>
                </div>
            )}
        </div>
    );
}
