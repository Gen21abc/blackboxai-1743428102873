const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function predictRisk(healthData) {
    try {
        // For demonstration, we'll simulate API response
        // In a real implementation, you would call the actual Gemini API
        
        // This is where you would normally call the Gemini API:
        /*
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Based on these health parameters, predict the cardiovascular disease risk percentage (0-100):
        - Age: ${healthData.age}
        - Gender: ${healthData.gender}
        - Cholesterol: ${healthData.cholesterol}
        - Blood Pressure: ${healthData.bloodPressure}
        - BMI: ${healthData.bmi}
        - Smoker: ${healthData.smoker ? 'Yes' : 'No'}
        
        Return ONLY the numerical risk percentage (0-100) with no additional text.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const riskPercentage = parseFloat(response.text().trim());
        */
        
        // Simulated response for demonstration
        let riskPercentage = 30; // Base risk
        
        // Adjust risk based on factors
        if (healthData.age > 50) riskPercentage += 15;
        if (healthData.gender === 'male') riskPercentage += 5;
        if (healthData.cholesterol === 'borderline') riskPercentage += 10;
        if (healthData.cholesterol === 'high') riskPercentage += 20;
        
        const [systolic, diastolic] = healthData.bloodPressure.split('/').map(Number);
        if (systolic > 140 || diastolic > 90) riskPercentage += 15;
        
        if (healthData.bmi > 30) riskPercentage += 10;
        if (healthData.smoker) riskPercentage += 15;
        
        // Ensure risk is between 0-100
        riskPercentage = Math.max(0, Math.min(100, Math.round(riskPercentage)));
        
        return riskPercentage;
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to get prediction from Gemini API');
    }
}

module.exports = { predictRisk };