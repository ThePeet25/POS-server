const jwt = require('jsonwebtoken');

const authentication = (req, res, next) => {
    // const token = req.cookies.jwt
    const token = req.cookies.jwt

    console.log(token);

    if(token === null) {
        return res.status(401).json({ message: 'Access Denied: No Token.'});
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            res.clearCookie('jwt', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/'
            })
            return res.status(403).json({ message: 'Access Denied: Invalid or Expired Token.'})
        }
        req.user = user
        next();
    })
}

const authorizeRoles = (roles) => {
    return (req, res, next) => {
        // check user from authen
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Access Denied: User role not found.' });
        }

        // check role
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access Denied: Insufficient permissions.' });
        }

        next();
    }
}

module.exports = [authentication, authorizeRoles];