'use strict';

const auth = require('basic-auth');
const bcrypt = require('bcrypt');
const { User } = require('../models');

exports.authenticateUser = async (req, res, next) => {
  const creds = auth(req);
  let message;

  if(creds) {
    const user = await User.findOne({
      where: { emailAddress: creds.name }
    });

    if(user) {
      const authenticated = bcrypt.compareSync(creds.pass, user.password);

      if(authenticated) {
        req.currentUser = user;

      } else {
        message= `Authentication failed for ${creds.name}`;
      }

    } else {
      message= `User ${creds.name} not found`;
    }

  } else {
    message= 'Authorization header not found'
  }

  if(message) {
    res.status(401).json({message: 'Access Denied'})
  } else {
    next();
  }
}