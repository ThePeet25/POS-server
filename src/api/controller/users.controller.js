//import users service
const userService = require("../../servies/users.service");
const jwt = require("jsonwebtoken");

exports.createUser = async (req, res) => {
  const userData = req.body;

  // valid user data
  if (!userData || userData.length === 0) {
    return res.status(400).json({
      message: "user data missing",
    });
  }

  try {
    const newUser = await userService.createNewUser(userData);

    res.status(201).json({
      message: "create new user",
      user: userData.username,
    });
  } catch (err) {
    console.log("ERROR", err);

    res.status(500).json({
      message: "Failed to create user",
      error: err.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  console.log("User data : ", username);
  // check user has been log in?
  const userLoggedIn = req.cookies.refreshToken;

  if (userLoggedIn) {
    try {
      jwt.verify(userLoggedIn, process.env.REFRESH_JWT_SECRET);
      return res.status(400).json({
        message: "you are logged in. pls log out before log in",
      });
    } catch (err) {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "None",
      });
    }
  }

  // valid user data
  if (!username || !password) {
    return res.status(400).json({
      message: "user data missing",
    });
  }

  try {
    const result = await userService.loginUser(username, password);

    // fail validate
    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    //correct user and pass
    const { accessToken, refreshToken } = result;

    // set cookie
    res.cookie("accessToken", accessToken, {
      secure: process.env.NODE_ENV === "production", // ใช้ secure: true เฉพาะใน Production (เมื่อใช้ HTTPS)
      maxAge: 1 * 60 * 1000,
      sameSite: "none", // แนะนำ: ป้องกัน CSRF (Cross-Site Request Forgery)
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production", // ใช้ secure: true เฉพาะใน Production (เมื่อใช้ HTTPS)
      sameSite: "none", // แนะนำ: ป้องกัน CSRF (Cross-Site Request Forgery)
    });

    res.status(result.status).json({
      message: "Login successful!!",
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "None",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "None",
    });

    return res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    console.error("ERROR", err);
    return res.status(500).json({ message: "Server error during logout." });
  }
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log(refreshToken);

  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET, (err, user) => {
    if (err) {
      console.log(err);
      res.sendStatus(403);
    }

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.ACCESS_JWT_SECRET,
      { expiresIn: "1m" }
    );

    res.cookie("accessToken", newAccessToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 1 * 60 * 1000,
    });

    res.status(200).json({
      message: "Generate new access token success",
    });
  });
};
