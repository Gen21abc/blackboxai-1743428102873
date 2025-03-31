require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const path = require('path');
const { predictRisk } = require('./gemini-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Validation middleware
const validateHealthData = [
    body('age').isInt({ min: 18, max: 120 }).withMessage('Age must be between 18 and 120'),
    body('gender').isIn(['male', 'female']).withMessage('Invalid gender selection'),
    body('cholesterol').isIn(['normal', 'borderline', 'high']).withMessage('Invalid cholesterol level'),
    body('bloodPressure').matches(/^\d{1,3}\/\d{1,3}$/).withMessage('Blood pressure must be in format "120/80"'),
    body('bmi').isFloat({ min: 10, max: 50 }).withMessage('BMI must be between 10 and 50'),
    body('smoker').isBoolean().withMessage('Smoker status must be true or false')
];

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/results.html'));
});

app.post('/predict', validateHealthData, async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Get prediction from Gemini API
        const riskPercentage = await predictRisk(req.body);
        
        // Determine risk category
        let riskCategory, recommendations;
        if (riskPercentage < 30) {
            riskCategory = 'Low';
            recommendations = {
                lifestyle: [
                    'Maintain your current healthy lifestyle habits',
                    'Continue regular physical activity (150+ minutes/week)',
                    'Eat a balanced diet with plenty of fruits and vegetables',
                    'Get regular health check-ups'
                ],
                medical: [
                    'Continue annual physical exams',
                    'Monitor blood pressure periodically',
                    'Check cholesterol every 4-6 years'
                ]
            };
        } else if (riskPercentage < 70) {
            riskCategory = 'Moderate';
            recommendations = {
                lifestyle: [
                    'Increase physical activity to 150+ minutes of moderate exercise per week',
                    'Reduce saturated fat and sodium intake',
                    'Maintain a healthy weight (BMI 18.5-24.9)',
                    'Limit alcohol consumption'
                ],
                medical: [
                    'Schedule a consultation with your doctor',
                    'Monitor blood pressure monthly',
                    'Get cholesterol checked annually',
                    'Consider a cardiac calcium score test'
                ]
            };
        } else {
            riskCategory = 'High';
            recommendations = {
                lifestyle: [
                    'Begin a supervised exercise program',
                    'Adopt a heart-healthy diet (Mediterranean or DASH diet)',
                    'Quit smoking immediately if applicable',
                    'Reduce stress through meditation or yoga'
                ],
                medical: [
                    'Schedule an appointment with a cardiologist',
                    'Discuss medication options with your doctor',
                    'Monitor blood pressure weekly',
                    'Consider advanced cardiac testing'
                ]
            };
        }

        // Return prediction result
        res.json({
            riskPercentage,
            riskCategory,
            recommendations
        });
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ error: 'Failed to process prediction' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});