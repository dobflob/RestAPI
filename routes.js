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
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress
  });
}));

router.post('/users', asyncHandler(async (req,res) => {
  const user = req.body;
  if(user.password) {
    user.password = await bcrypt.hashSync(user.password, 10);
  }
  await User.create(user);
  res.status(201).location('/').end();
}));

router.get('/courses', asyncHandler( async (req,res) => {
  const courses = await Course.findAll({
    attributes: [
      'id',
      'title',
      'description',
      'estimatedTime',
      'materialsNeeded',
      'userId'
    ],
    include: [
      {
        model: User,
        attributes: [
          'id',
          'firstName',
          'lastName',
          'emailAddress'
        ]
       }
    ]
  });
    res.status(200).json(courses);
}));

router.get('/courses/:id', asyncHandler( async (req,res) => {
  const course = await Course.findOne({
    where: {
      id: req.params.id,
    },
    attributes: [
      'id',
      'title',
      'description',
      'estimatedTime',
      'materialsNeeded',
      'userId'
    ],
    include: [
      {
        model: User,
        attributes: [
          'id',
          'firstName',
          'lastName',
          'emailAddress'
        ]
      }
    ]
  });
  res.status(200).json(course);
}));

router.post('/courses', authenticateUser, asyncHandler( async (req, res) => {
  const course = req.body;
  await Course.create(course);
  const newCourse = await Course.findOne({order: [['id', 'DESC']]});
  res.status(201).location(`/courses/${newCourse.id}`).end();
}));

router.put('/courses/:id', authenticateUser, asyncHandler( async (req, res) => {
  const user = req.currentUser;
  const course = await Course.findByPk(req.params.id);
  if (user.id === course.userId) {
    await course.update({
      title: req.body.title,
      description: req.body.description,
      userId: req.body.userId
    });
    res.status(204).end();
  } else {
    res.status(403).json({message: 'Access Denied'});
  }
}));

router.delete('/courses/:id', authenticateUser, asyncHandler( async (req, res) => {
  const user = req.currentUser;
  const course = await Course.findByPk(req.params.id);
  if (user.id === course.userId) {
    course.destroy();
    res.status(204).end();
  } else {
    res.status(403).json({message: 'Access Denied'});
  }
}));

module.exports = router;