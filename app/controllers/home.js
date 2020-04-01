/*!
 * Module dependencies.
 */

const mongoose = require('mongoose');
const passport = require('passport');
const Users = mongoose.model('Users');
const uuidv4 = require('uuid/v4');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
let nodemailer = require('nodemailer');

exports.signin = function(req, res) {
  res.render('auth/signin', {
    title: 'Avenue - Sign In',
    token: req.csrfToken()
  });
};

exports.signin_post = async function(req, res, next) {
  // eslint-disable-next-line prettier/prettier
  const { body: { user } } = req;

  console.log('signin', req.body);

  if (!user.email) {
    return res.status(200).json({
      status: 200,
      errors: {
        email: 'Email is required'
      }
    });
  }

  if (!user.password) {
    return res.status(200).json({
      status: 200,
      errors: {
        password: 'Password is required'
      }
    });
  }

  const find_user = await Users.findOne({ email: user.email });
  if (find_user && find_user.validatePassword(user.password)) {
    const user = find_user;
    user.token = find_user.generateJWT();

    req.session.user = user;

    return res.json({
      status: 200,
      message: 'Successfully Signed In',
      user: user.toAuthJSON()
    });
  } else {
    return res.status(200).json({
      status: 400,
      errors: { message: 'Email or Password is incorrect.' }
    });
  }

  // return passport.authenticate(
  //   'local',
  //   { session: false },
  //   (err, passportUser, info) => {
  //     if (err) {
  //       console.log('passport auth err', err);
  //       return next(err);
  //     }

  //     if (passportUser) {
  //       const user = passportUser;
  //       user.token = passportUser.generateJWT();

  //       req.session.user = user;

  //       return res.json({
  //         status: 200,
  //         message: 'Successfully Signed In',
  //         user: user.toAuthJSON()
  //       });
  //     }

  //     return res.status(200).json({
  //       status: 400,
  //       errors: { message: 'Email or Password is incorrect.' }
  //     });
  //   }
  // )(req, res, next);
};

exports.signup = function(req, res) {
  res.render('auth/signup', {
    title: 'Avenue - Sign Up',
    token: req.csrfToken()
  });
};

exports.signup_post = async function(req, res) {
  // eslint-disable-next-line prettier/prettier
  const { body: { user } } = req;

  console.log(req.body);

  if (!user.email) {
    return res.status(200).json({
      errors: {
        status: 422,
        email: 'Email is required'
      }
    });
  }

  if (!user.first_name || !user.last_name) {
    return res.status(200).json({
      errors: {
        status: 422,
        email: 'Username is required'
      }
    });
  }

  const find_user = await Users.findOne({ email: user.email });
  console.log(find_user);
  if (find_user) {
    return res.status(200).json({
      status: 422,
      errors: {
        email: 'Email is already registered'
      }
    });
  }

  if (!user.password) {
    return res.status(200).json({
      status: 422,
      errors: {
        password: 'Password is required'
      }
    });
  }

  const finalUser = new Users(user);

  finalUser.setPassword(user.password);
  finalUser.setDate();
  finalUser.setID();

  return finalUser.save().then(_user => {
    req.session.user = _user;
    res.json({
      status: 200,
      message: 'Successfully Signed Up',
      user: finalUser.toAuthJSON()
    });
  });
};

exports.logout = function(req, res) {
  req.session.destroy();
  res.json({
    status: 200,
    message: 'Successfully logged out'
  });
};

exports.password_reset = function(req, res) {
  res.render('auth/password_reset', {
    // token: req.csrfToken(),
    token: 'req.csrfToken()',
    title: 'Avenue - Reset Password'
  });
};

exports.password_recovery = function(req, res) {
  res.render('auth/password_recovery', {
    // token: req.csrfToken(),
    token: 'req.csrfToken()',
    title: 'Avenue - Recover Password'
  });
};

exports.password_reset_post = async function(req, res) {
  const { body: { password } } = req;
  const paths = req.headers.referer.split('/');
  const link = paths[paths.length - 1];
  console.log(link);
  try {
    const find_user = await Users.findOne({ reset_link: link });
    if (find_user) {
      find_user.setPassword(password);
      find_user.updateDate();
      return find_user.save().then(() => {
        res.json({
          status: 200,
          message: 'Successfully Changed'
        });
      });
    }
  } catch (error) {
    console.log('User not found in password reset')
  }
  return res.json({
    status: 400,
    message: 'Something wrong'
  });
};

exports.password_reset_generate = async function(req, res) {
  const { body: { email } } = req;
  const find_user = await Users.findOne({ email: email });
  if (!find_user) {
    res.json({
      status: 404,
      message: 'User with this email does not exist'
    });
  } else {
    const id = uuidv4();
    const link = `${req.headers.origin}/password_recovery/${id}`;
    const text = `Hi <br>
      You can reset your password by clicking the link below. <br>
      <a href="${link}">Reset Password</a> <br>
      If you didn't request a new password, you can ignore this email. <br>`;
    const msg = {
      to: email,
      from: process.env.INFO_EMAIL,
      subject: 'Reset your password',
      html: text
    };
    var transport = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      secure: true,
      port: '465',
      auth: {
        user: 'ideveloper003@gmail.com',
        pass: 'Imobile1'
      }
    });
    try {
      await transport.sendMail(msg);
      find_user.setPasswordResetLink(id);
      await find_user.save();
      res.json({
        status: 200,
        message: 'Successfully Generated'
      });
    } catch (err) {
      console.log('err', err);
    }
    // sgMail.send(msg).then(res1 => {
    //   console.log(res1);
    //   res.json({
    //     status: 200,
    //     message: 'Successfully Generated'
    //   });
    // }).catch(err => {
    //     console.log('------------ password_generate link error ------------', err);
    // });
  }
};

exports.settings = async function(req, res) {
  const { user } = req.session;
  const myuser = await Users.findOne({ id: user.id });
  res.render('auth/settings', {
    // token: req.csrfToken(),
    token: 'req.csrfToken()',
    title: 'Avenue - Settings',
    user: myuser
  });
};

exports.update_settings = async function(req, res) {
  const { body: { user } } = req;
  const myuser = await Users.findOne({ id: user.id });
  if (!myuser) {
    return res.json({
      status: 404,
      message: 'User with this email does not exist'
    });
  }
  if (user.password) {
    if (!myuser.validatePassword(user.old_password)) {
      return res.status(200).json({
        status: 422,
        message: 'Old password is not correct!'
      });
    } else {
      myuser.setPassword(user.password);
    }
  }
  myuser.first_name = user.first_name;
  myuser.last_name = user.last_name;
  return myuser.save().then(() => {
    res.json({
      status: 200,
      message: 'Successfully Changed'
    });
  });
}

exports.update_password = async function(req, res) {
  const { body: { user } } = req;
  const myuser = await Users.findOne({ id: user.id });
  if (!myuser) {
    return res.json({
      status: 404,
      message: 'User with this email does not exist'
    });
  }
  if (user.password && !myuser.validatePassword(user.old_password)) {
    return res.status(200).json({
      status: 422,
      message: 'Old password is not correct!'
    });
  }
  myuser.setPassword(user.password);
  return myuser.save().then(() => {
    res.json({
      status: 200,
      message: 'Successfully Changed'
    });
  });
}

exports.current = function(req, res) {
  // eslint-disable-next-line prettier/prettier
  const { payload: { id } } = req;

  return Users.findById(id).then(user => {
    if (!user) {
      return res.sendStatus(400);
    }

    return res.json({ user: user.toAuthJSON() });
  });
}