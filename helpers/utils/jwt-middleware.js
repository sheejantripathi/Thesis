const jwt = require('jsonwebtoken');
const User = require('../../modules/users/user.model'); 
const config = require('./config');
// Your user model

const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.sendStatus(401); // Unauthorized

  const token = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, config.secret, async (err, decodedToken) => {
    if (err) return res.sendStatus(403); // Forbidden

    // Token is valid, you can access the decoded information
    const userId = decodedToken.payload.id;
    // Retrieve user details from the database using userId
    let user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');
    
    // Attach the user to the request object for further use in the route
    req.user = user;
    next();
  });
};


module.exports = authenticateToken;





