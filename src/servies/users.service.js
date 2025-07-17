const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.createNewUser = async (userData) => {
    const { username, password } = userData;

    // check unique username
    const existingUser = await prisma.users.findUnique({
        where: {
            username: username
        }
    })
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists.' });
    }

    // hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //create new user
    const newUser = await prisma.users.create({
        data: {
            username: username,
            password: hashedPassword,
        }
    })

}

exports.loginUser = async (userData) => {
    const { username, password } = userData;

    // find username
    const user = await prisma.users.findUnique({
        where: {
            username: username
        }
    })

    // check login
    if (!user) {
        return { success: false, status: 401, message: 'Invalid credentials.' }
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        return { success: false, status: 401, message: 'Invalid credentials.' }
    }

    //username and password correct
    //set jwt
    const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    )

    return { success: true, status: 200, token: token, user: { id: user.id, username: user.username } };
}