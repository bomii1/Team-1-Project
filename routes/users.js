const express = require('express');
const conn = require('../mariadb');
const router = express.Router();

const {
    signup,
    sign,
    passwordResetRequest, 
    passwordReset 
} = require('../controller/userController');

router.use(express.json());

// 회원가입
router.post('/signup', signup);

// 로그인
router.post('/sign', sign);

// 비밀번호 초기화 요청
router.post('/reset', passwordResetRequest);

// 비밀번호 초기화
router.put('/reset', passwordReset);

module.exports = router;