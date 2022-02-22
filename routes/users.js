// const express = require('express');
// const router = express.Router();
// const usersData = require('../data/users');
// const valid = require('../public/js/validation');

// router.get('/register', async (req, res) => {
//     // If user is authenticated then redirect to private
//     // if (req.session.user) {
//     //     res.redirect('/private');
//     // } else {
//     //     res.render('users/signup', { title: 'SignUp' });
//     // }
//     console.log('user authenticated!!');
// });

// router.post('/register', async (req, res) => {
//     try {
//         let data = req.body;
//         if (!data || data.email === '') throw `Please Provide email`;
//         // valid.userNameValidation(data.username);
//         if (!data || data.password === '') throw `Please Provide Password`;
//         valid.passwordValidation(data.password);
//         const { email, password } = data;
//         try {
//             let users = await usersData.createUser(email, password);
//             // if (users.userInserted === true) {
//             //     res.redirect('/');
//             // } else {
//             //     res.status(500).json({ error: 'Internal Server Error' });
//             // }
//             console.log(users);
//         } catch (error) {
//             res.status(500).json({ error: 'Internal Server Error' });
//         }
//     } catch (e) {
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// router.post('/login', async (req, res) => {
//     try {
//         let data = req.body;
//         if (!data || data.username === '') throw `Please Provide Username`;
//         valid.userNameValidation(data.username);
//         if (!data || data.password === '') throw `Please Provide Password`;
//         valid.passwordValidation(data.password);
//         const { username, password } = data;
//         try {
//             let users = await usersData.checkUser(username, password);
//             if (users.authenticated === true) {
//                 req.session.user = username;
//                 res.redirect('/private');
//             }
//         } catch (error) {
//             res.status(400).render('users/login', {
//                 error: error,
//                 username: username,
//                 password: password,
//                 title: 'Login',
//             });
//         }
//     } catch (e) {
//         res.status(400).render('users/login', {
//             error: e,
//             username: req.body.username,
//             password: req.body.password,
//             title: 'Login',
//         });
//     }
// });

// router.get('/logout', async (req, res) => {
//     req.session.destroy();
//     res.clearCookie('AuthCookie');
//     res.render('users/logout', { title: 'Logout' });
// });

// module.exports = router;
