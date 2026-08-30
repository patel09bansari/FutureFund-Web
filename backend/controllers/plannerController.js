const pool = require('../config/db');

/**
 * Save planner results (JSON string)
 * Thick Client Architecture: The backend just stores the result computed by the frontend engine.
 */
const savePlanner = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { report_data } = req.body; // Expecting a JSON string or object from frontend

        if (!report_data) {
            return res.status(400).json({ success: false, message: 'Missing report data' });
        }

        let reportString;
        try {
            reportString = typeof report_data === 'string' ? report_data : JSON.stringify(report_data);
            JSON.parse(reportString); // validate it is actually parseable
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Invalid report_data JSON format' });
        }

        // Check if planner data already exists for this user
        const [existing] = await pool.execute(
            'SELECT id FROM financial_profiles WHERE user_id = ?',
            [userId]
        );

        if (existing.length > 0) {
            // We just update the report_data field. The other fields are updated via /api/profile
            await pool.execute(
                'UPDATE financial_profiles SET report_data = ? WHERE user_id = ?',
                [reportString, userId]
            );
        } else {
            // Create a basic profile row with just the report data
            await pool.execute(
                'INSERT INTO financial_profiles (user_id, report_data) VALUES (?, ?)',
                [userId, reportString]
            );
        }

        res.json({ success: true, message: 'Planner saved successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Get saved planner results
 */
const getPlanner = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const [profiles] = await pool.execute(
            'SELECT report_data FROM financial_profiles WHERE user_id = ?',
            [userId]
        );

        if (profiles.length === 0 || !profiles[0].report_data) {
            return res.json({ success: true, result: null });
        }

        let parsedData = profiles[0].report_data;
        if (typeof parsedData === 'string') {
            try { parsedData = JSON.parse(parsedData); } catch (e) {}
        }

        res.json({ success: true, result: parsedData });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    savePlanner,
    getPlanner
};
