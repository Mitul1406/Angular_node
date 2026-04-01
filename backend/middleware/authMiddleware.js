import jwt from 'jsonwebtoken'


export const auth = (req, res, next) => {
  const token = req?.headers?.authorization;

  if (!token) return res.status(401).json({ msg: "No token Provided" });

  try {
    const actualToken = token.split(" ")[1];
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token Provided" });
  }
};