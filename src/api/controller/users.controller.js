//import users service
const userService = require('../../servies/users.service');
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
    const userData = req.body;

    // valid user data
    if (!userData || userData.length === 0) {
        return res.status(400).json({
            message: 'user data missing'
        })
    }

    try {
        const newUser = await userService.createNewUser(userData);

        res.status(201).json({
            message: 'create new user',
            user: userData.username
        })
    } catch (err) {
        console.log("ERROR", err);

        res.status(500).json({
            message: "Failed to create user",
            error: err.message
        })
    }
}

exports.loginUser = async (req, res) => {
    const userData = req.body;
    console.log('User data : ', userData);
    // check user has been log in?
    const userLoggedIn = req.cookies.jwt;

    if(userLoggedIn) {
        try {
            jwt.verify(userLoggedIn, process.env.JWT_SECRET);
            return res.status(400).json({
                message: 'you are logged in. pls log out before log in'
            })
        } catch(err) {
            res.clearCookie('jwt', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/'
            });
        }
    }

    // valid user data
    if (!userData || userData.length === 0) {
        return res.status(400).json({
            message: 'user data missing'
        })
    }

    try {
        const result = await userService.loginUser(userData);

        // fail validate
        if(!result.success) {
            return res.status(result.status).json({ message : result.message})
        }

        //correct user and pass
        const token = result.token

        // set cookie
        res.cookie('jwt', token, {
            httpOnly: true, // สำคัญมาก! ป้องกันการเข้าถึงจาก JavaScript บน Client-side
            secure: process.env.NODE_ENV === 'production', // ใช้ secure: true เฉพาะใน Production (เมื่อใช้ HTTPS)
            maxAge: 3600000, // 1 ชั่วโมง (ในหน่วยมิลลิวินาที)
            // sameSite: 'strict', // แนะนำ: ป้องกัน CSRF (Cross-Site Request Forgery)
            // domain: 'yourdomain.com', // หาก Frontend และ Backend อยู่คนละ Subdomain
            // path: '/' // กำหนด path ของ cookie
        });

        res.status(result.status).json({ message: 'Login successful!!' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
}

exports.logout = async (req, res) => {
    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        })

        return res.status(200).json({ message: 'Logged out successfully.'})
    } catch(err) {
        console.error("ERROR", err);
        return res.status(500).json({ message: 'Server error during logout.'});
    }
}