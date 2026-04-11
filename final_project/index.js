const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
    const token = req.session.jwt
    jwt.verify(token, 'privateKey', function(err, decoded) {
        if (err) {
            console.log("HAY BOBO")
            return res.sendStatus(401)
        }
        next()
    });

});

const PORT =5001;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

module.exports = app;
if (require.main === module) {
  app.listen(PORT, () => console.log("Server is running"));
}
