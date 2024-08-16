'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const { User, Course } = require('./models');
const { asyncHandler } = require('./middleware/async-handler');
const { authenticateUser } = require('./middleware/auth-user');

// router instance
const router = express.Router();

router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser;
  res.status(200).json({
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress,
    password: user.password
  });
}));

router.post('/users', asyncHandler(async (req,res) => {
  const user = req.body;
  user.password = bcrypt.hashSync(user.password, 10);

  await User.create(user);
  res.status(201).location('/').end();
}));

router.delete('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  user.destroy();
  res.status(200).location('/').end();
}));

router.get('/courses', asyncHandler( async (req,res) => {
  const courses = await Course.findAll({
    include: [
      { model: User }
    ]
  });
    res.status(200).json(courses);
}));

router.get('/courses/:id', asyncHandler( async (req,res) => {
  const course = await Course.findByPk(req.params.id);
  res.status(200).json(course);
}));

router.post('/courses', authenticateUser, asyncHandler( async (req, res) => {
  const course = req.body;
  await Course.create(course);
  res.status(201).location('/').end();
}));

router.put('/courses/:id', authenticateUser, asyncHandler( async (req, res) => {
  //const user = req.currentUser;
  const course = await Course.findByPk(req.params.id);
  await course.update({
    title: req.body.title,
    description: req.body.description,
    userId: req.body.userId
  });
  res.status(204).end();
}));

router.delete('/courses/:id', authenticateUser, asyncHandler( async (req, res) => {
  //const user = req.currentUser;
  const course = await Course.findByPk(req.params.id);
  course.destroy();
  res.status(204).end();
}));

module.exports = router;