import mongoose from 'mongoose';

const targetSchema = new mongoose.Schema({
  id: String,
  type: String,
});

const optionsSchema = new mongoose.Schema({
  name: String,
  value: String,
});

const pollSchema = new mongoose.Schema({
  messageId: String,
  question: String,
  options: [optionsSchema],
  target: targetSchema,
});

export default mongoose.model('Poll', pollSchema);

