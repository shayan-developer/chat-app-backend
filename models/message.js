import pkg from 'mongoose';
const { Schema, model } = pkg;
const MessageSchema = new Schema({
  content: String,
  from: Object,
  socketid: String,
  time: String,
  date: String,
  to: String
})

const Message = model('Message', MessageSchema);

export default Message
