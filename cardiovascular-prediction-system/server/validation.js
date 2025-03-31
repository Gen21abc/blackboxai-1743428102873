const { body } = require('express-validator');

const validateHealthData = [
    body('age')
        .isInt({ min: 18, max: 120 })
        .withMessage('Age must be between 18 and 120'),
    body('gender')
        .isIn(['male', 'female'])
        .withMessage('Invalid gender selection'),
    body('cholesterol')
        .isIn(['normal', 'borderline', 'high'])
        .withMessage('Invalid cholesterol level'),
    body('bloodPressure')
        .matches(/^\d{1,3}\/\d{1,3}$/)
        .withMessage('Blood pressure must be in format "120/80"')
        .custom((value) => {
            const [systolic, diastolic] = value.split('/').map(Number);
            if (systolic < 70 || systolic > 250) {
                throw new Error('Systolic pressure must be between 70-250');
            }
            if (diastolic < 40 || diastolic > 150) {
                throw new Error('Diastolic pressure must be between 40-150');
            }
            return true;
        }),
    body('bmi')
        .isFloat({ min: 10, max: 50 })
        .withMessage('BMI must be between 10 and 50'),
    body('smoker')
        .isBoolean()
        .withMessage('Smoker status must be true or false')
];

const validateResults = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    validateHealthData,
    validateResults
};