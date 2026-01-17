const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const { generatePredictionReport } = require('../src/predictionEngine');
const { generateDetailedReport } = require('../src/detailedReportGenerator');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Geocode a place name to coordinates using Nominatim
 */
async function geocodePlace(placeName) {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: placeName,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'AstroEngine/1.0'
            }
        });

        if (response.data && response.data.length > 0) {
            return {
                latitude: parseFloat(response.data[0].lat),
                longitude: parseFloat(response.data[0].lon),
                displayName: response.data[0].display_name
            };
        }

        throw new Error('Place not found');
    } catch (error) {
        throw new Error(`Geocoding failed: ${error.message}`);
    }
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Astro Engine is running' });
});

// Geocode endpoint
app.get('/api/geocode/:place', async (req, res) => {
    try {
        const location = await geocodePlace(req.params.place);
        res.json(location);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Generate prediction report
app.post('/api/predict', async (req, res) => {
    try {
        const { name, place, year, month, day, hour, minute, timezone } = req.body;

        if (!name || !place || !year || !month || !day) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let location;
        try {
            location = await geocodePlace(place);
        } catch (error) {
            return res.status(400).json({ error: `Could not find location: ${place}` });
        }

        const birthData = {
            name,
            placeName: location.displayName,
            year: parseInt(year),
            month: parseInt(month),
            day: parseInt(day),
            hour: parseInt(hour) || 12,
            minute: parseInt(minute) || 0,
            latitude: location.latitude,
            longitude: location.longitude,
            timezone: parseFloat(timezone) || 0
        };

        const report = await generatePredictionReport(birthData);
        res.json(report);
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate detailed narrative report
app.post('/api/detailed-report', async (req, res) => {
    try {
        const { name, place, year, month, day, hour, minute, timezone, category } = req.body;

        if (!name || !place || !year || !month || !day) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let location;
        try {
            location = await geocodePlace(place);
        } catch (error) {
            return res.status(400).json({ error: `Could not find location: ${place}` });
        }

        const birthData = {
            name,
            placeName: location.displayName,
            year: parseInt(year),
            month: parseInt(month),
            day: parseInt(day),
            hour: parseInt(hour) || 12,
            minute: parseInt(minute) || 0,
            latitude: location.latitude,
            longitude: location.longitude,
            timezone: parseFloat(timezone) || 0
        };

        const validCategories = ['relationships', 'financial', 'health', 'career'];
        const reportCategory = validCategories.includes(category) ? category : 'relationships';

        const report = await generateDetailedReport(birthData, reportCategory);
        res.json(report);
    } catch (error) {
        console.error('Detailed report error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
