const { expressjwt: jwt } = require('express-jwt');

function authJwt() {
    const secret = process.env.JWT_SECRET;
    const api = process.env.API_URL;
    return jwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            { url: /\/api\/v1\/challenges(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/organizations(.*)/, methods: ['GET', 'OPTIONS'] },
            '/api/v1/users/login',
            '/api/v1/users/register'
        ]
    });
}

async function isRevoked(req, payload, done) {
    try {
        //console.log("Payload:", payload);

        if (!payload || !payload.payload.role) {
            console.log("No role found in payload. Revoking access.");
            return true;
        }

        if (payload.payload.role === "user") {
            console.log("User role detected. Revoking access.");
            return true;
        }

        console.log("Access granted for role:", payload.payload.role);
        return false; // Allow access for others
    } catch (error) {
        console.error('Error in isRevoked:', error);
    }
}


module.exports = authJwt;
