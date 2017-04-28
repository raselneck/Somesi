const crypto = require('crypto');
const mongoose = require('mongoose');
const Post = require('./post.js');

let AccountModel = {};
const cryptIterations = 100000;
const cryptSaltLength = 128;
const cryptKeyLength = 128;
const cryptAlgorithm = 'RSA-SHA512';

mongoose.Promise = global.Promise;

// Define the account schema
const AccountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^[a-zA-Z0-9_-]{4,16}$/,
  },

  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    // Regex from http://stackoverflow.com/a/46181
    match: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  },

  following: {
    type: [String],
    default: () => ([]),
  },

  salt: {
    type: Buffer,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Checks to see if a user's password matches the given password
const validatePassword = (doc, password, callback) => {
  const pass = doc.password;

  return crypto.pbkdf2(password, doc.salt, cryptIterations, cryptKeyLength, cryptAlgorithm,
    (err, hash) => {
      const hashString = hash.toString('hex');
      if (hashString !== pass) {
        return callback(false);
      }
      return callback(true);
    });
};

// Helper method for converting an account to its session equivalent
AccountSchema.statics.toSession = doc => ({
  username: doc.username,
  /* email: doc.email,*/
  _id: doc._id,
});

// Finds a user by their username
AccountSchema.statics.findByUsername = (username, callback) => {
  const search = { username };
  return AccountModel.findOne(search, callback);
};

// Finds a user by their email
AccountSchema.statics.findByEmail = (email, callback) => {
  const search = { email };
  return AccountModel.findOne(search, callback);
};

// Generates a hash for the given password
AccountSchema.statics.generateHash = (password, callback) => {
  const salt = crypto.randomBytes(cryptSaltLength);

  crypto.pbkdf2(password, salt, cryptIterations, cryptKeyLength, cryptAlgorithm,
    (err, hash) => {
      callback(salt, hash.toString('hex'));
    });
};

// Attempts to authenticate a user with the given username and password
AccountSchema.statics.authenticate = (username, password, callback) =>
  AccountModel.findByUsername(username, (err, doc) => {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(new Error(`Failed to find account with username ${username}.`));
    }

    return validatePassword(doc, password, (result) => {
      if (result === true) {
        return callback(null, doc);
      }

      const message = `Failed to validate password for ${username}`;
      console.log(message);
      return callback(new Error(message));
    });
  });

// Attempts to change a user's password
AccountSchema.statics.changePassword = (username, oldPassword, newPassword, callback) =>
  AccountModel.authenticate(username, oldPassword, (err, account_) => {
    const account = account_;

    if (err) {
      return callback(err);
    }

    if (!account) {
      const message = `Failed to aithenticate ${username}.`;
      return callback(new Error(message));
    }

    // Now we need to generate the new hash
    return AccountModel.generateHash(newPassword, (salt, hash) => {
      // Update the salt and the password
      account.salt = salt;
      account.password = hash;

      // Now re-save the account
      account.save()
        .then(() => callback())
        .catch(err2 => callback(err2));
    });
  });

// Checks to see if the given user exists
AccountSchema.statics.exists = (username, callback) =>
  AccountModel.findByUsername(username, (err, account) => {
    if (err || !account) {
      return callback(false);
    }
    return callback(true);
  });

// Gets all of the posts made by the user with the given username
AccountSchema.statics.getPosts = (username, callback) =>
  AccountModel.findOne({ username }, (err, account) => {
    if (err) {
      return callback(err);
    }
    if (!account) {
      return callback(new Error(`A user with the name ${username} does not exist!`));
    }
    return Post.getAllByUserName(username, callback);
  });

// Gets all of the users another user follows
AccountSchema.statics.getFollowing = (username, callback) =>
  AccountModel.findOne({ username }, (err, account) => {
    if (err) {
      return callback(err);
    }
    if (!account) {
      return callback(new Error(`A user with the name ${username} does not exist!`));
    }
    return callback(err, account.following);
  });

// Adds a person to a user's following
const addToFollowing = (user, nameToFollow, callback) => {
  // Add the user's ID to the following list
  user.following.push(nameToFollow);

  // Save the user
  user.save()
    .then(() => callback())
    .catch(err2 => callback(err2));
};

// Removes a person from a user's following
const removeFromFollowing = (user, nameToUnfollow, callback) => {
  // Remove the user's ID from the following list
  const index = user.following.indexOf(nameToUnfollow);
  if (index >= 0) {
    user.following.splice(index, 1);
  }

  // Save the user
  user.save()
    .then(() => callback())
    .catch(err2 => callback(err2));
};

// Attempts to follow or unfollow the given user
AccountSchema.statics.followOrUnfollow = (follower, followee, follow, callback) =>
  AccountModel.findByUsername(follower, (err2, account) => {
    if (err2) {
      return callback(err2);
    }

    // Now that we have the user account, we can actually follow or unfollow
    if (follow) {
      return addToFollowing(account, followee, callback);
    }
    return removeFromFollowing(account, followee, callback);
  });

// Create the account model
AccountModel = mongoose.model('Account', AccountSchema);
module.exports = AccountModel;
