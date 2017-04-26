const mongoose = require('mongoose');
const _ = require('underscore');

const ObjectId = mongoose.Types.ObjectId;

let PostModel = {};
mongoose.Promise = global.Promise;

// Processes post text
const processPostText = text => _.escape(text).trim();

// Define the post schema
const PostSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },

  ownerName: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    required: true,
    default: Date.now,
  },

  text: {
    type: String,
    required: true,
    set: processPostText,
  },
});

// Converts a database post to a client post (in case posts contain more data)
PostSchema.statics.toClient = doc => ({
  owner: doc.owner,
  ownerName: doc.ownerName,
  date: doc.date,
  text: doc.text,
});

// Gets all of the posts by the given user ID
PostSchema.statics.getAllByUserId = (id, callback) => {
  const search = { owner: ObjectId(id) };
  return PostModel.find(search).exec(callback);
};

// Gets all of the posts by the given user name
PostSchema.statics.getAllByUserName = (username, callback) => {
  const search = { ownerName: username };
  return PostModel.find(search).exec(callback);
};

// Create the post model
PostModel = mongoose.model('Post', PostSchema);
module.exports = PostModel;
