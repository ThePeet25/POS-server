const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.ACCESS_JWT_SECRET,
    { expiresIn: "1m" }
  );
  return token;
};

const generateRefreshToken = (user) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.REFRESH_JWT_SECRET,
    { expiresIn: "7d" }
  );
  return token;
};

exports.createNewUser = async (userData) => {
  const { username, password } = userData;

  // check unique username
  const existingUser = await prisma.users.findUnique({
    where: {
      username,
    },
  });
  if (existingUser) {
    return res.status(400).json({ message: "Username already exists." });
  }

  // hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  //create new user
  const newUser = await prisma.users.create({
    data: {
      username: username,
      password: hashedPassword,
    },
  });
};

exports.loginUser = async (username, password) => {
  // find username
  const user = await prisma.users.findUnique({
    where: {
      username: username,
    },
  });

  // check login
  if (!user) {
    return { success: false, status: 401, message: "Invalid credentials." };
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return { success: false, status: 401, message: "Invalid credentials." };
  }

  //username and password correct
  //set jwt
  const accessToken = generateAccessToken(user);

  const refreshToken = generateRefreshToken(user);

  return {
    success: true,
    status: 200,
    accessToken,
    refreshToken,
    user: { id: user.id, username: user.username },
  };
};
