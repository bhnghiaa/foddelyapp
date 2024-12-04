const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[ 1 ];
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json({ message: 'Token is not valid!' });
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json({ message: 'You are not authenticated!' });
    }
};

const verifyRole = (roles) => {
    return (req, res, next) => {
        verifyToken(req, res, () => {
            if (roles.includes(req.user.userType)) {
                next();
            } else {
                res.status(403).json({ message: 'You are not authorized!' });
            }
        });
    };
};

module.exports = {
    verifyToken,
    verifyTokenAndAuthorization: verifyRole([ 'Client', 'Vendor', 'Admin', 'Driver' ]),
    verifyTokenAndAdmin: verifyRole([ 'Admin' ]),
    verifyTokenAndDriver: verifyRole([ 'Driver', 'Admin' ]),
    verifyTokenAndVendor: verifyRole([ 'Vendor', 'Admin' ]),
};
