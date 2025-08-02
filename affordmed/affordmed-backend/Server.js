const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');
const shortid = require('shortid');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// In-Memory DB (Map)
const urlDB = new Map();
const statsDB = new Map();

// Logger Middleware (Calling your AffordMed Logger)
const { log } = require('./logger');  // we'll write logger.js next

// API 1: Create Short URL
app.post('/shorturls', async (req, res) => {
    const { url, validity = 30, shortcode } = req.body;
    if (!url) return res.status(400).json({ message: 'URL is required' });

    let code = shortcode || shortid.generate();
    if (urlDB.has(code)) return res.status(409).json({ message: 'Shortcode already exists!' });

    const expiry = moment().add(validity, 'minutes').toISOString();
    urlDB.set(code, { url, expiry });
    statsDB.set(code, { clicks: 0, logs: [] });

    await log("backend", "info", "shorturl", `Short URL created: ${code}`);

    res.status(201).json({ shortLink: `http://localhost:5000/${code}`, expiry });
});

// API 2: Redirect Short URL
app.get('/:code', async (req, res) => {
    const { code } = req.params;
    if (!urlDB.has(code)) {
        await log("backend", "error", "redirect", `Shortcode ${code} not found`);
        return res.status(404).json({ message: 'Shortcode not found' });
    }

    const { url, expiry } = urlDB.get(code);
    if (moment().isAfter(moment(expiry))) {
        await log("backend", "error", "redirect", `Shortcode ${code} expired`);
        return res.status(410).json({ message: 'Shortcode expired' });
    }

    statsDB.get(code).clicks++;
    statsDB.get(code).logs.push({ timestamp: new Date(), referrer: req.get('Referrer') || 'Direct' });

    await log("backend", "info", "redirect", `Redirected to ${url}`);
    res.redirect(url);
});

// API 3: Get Short URL Stats
app.get('/shorturls/:code', async (req, res) => {
    const { code } = req.params;
    if (!urlDB.has(code)) {
        await log("backend", "error", "stats", `Stats request failed for ${code}`);
        return res.status(404).json({ message: 'Shortcode not found' });
    }

    const urlData = urlDB.get(code);
    const statData = statsDB.get(code);

    res.json({
        url: urlData.url,
        createdAt: urlData.createdAt || new Date(),
        expiry: urlData.expiry,
        clicks: statData.clicks,
        logs: statData.logs
    });
});

app.listen(5000, () => console.log("Backend running on port 5000"));
