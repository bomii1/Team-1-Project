const conn = require('../mariadb');
const mysql = require('mysql2/promise');
const {StatusCodes} = require('http-status-codes');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const dotenv = require('dotenv');
dotenv.config();

const signup = (req, res) => {
    const {email, username, password, nickname} = req.body;

    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');

    let sql = `INSERT INTO users (email, username, password, nickname, salt) VALUES (?, ?, ?, ?, ?)`;
    let values = [email, username, hashPassword, nickname, salt];
    conn.query(sql, values,
        (err, results) =>  {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            res.status(StatusCodes.CREATED).json({ message: `환영합니다.` });
        }
    )     
}

const sign = async (req, res) => {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'team-project',
        dateStrings: true
    });

    const {email, password} = req.body;

    // login sql
    let sql = `SELECT * FROM users WHERE email = ?`;
    let [results] = await conn.execute(sql, [email]);
    
    if (!results.length) {
        return res.status(StatusCodes.UNAUTHORIZED).end()
    }

    let loginUser = results[0];

    const hashPassword = crypto.pbkdf2Sync(password, loginUser.salt, 10000, 10, 'sha512').toString('base64');

    // login OK
    if (loginUser.password === hashPassword) {

        // authority sql
        let authorities = [];

        sql = `SELECT * FROM authorities WHERE user_id=?`;

        let [authResults] = await conn.execute(sql, [loginUser.id]);
        
        authResults.map((authResult) => {
            let authorityName = authResult.authority_name;
            authorities.push({authorityName});
        })

        // access 토큰 발행
        const accessToken = jwt.sign({
            id: loginUser.id,
            email: loginUser.email,
            authorities: authorities
        }, process.env.PRIVATE_KEY, {
            expiresIn: '5m',
            issuer: 'bomi'
        });

        // refresh 토큰 발행
        const refreshToken = jwt.sign({
            id: loginUser.id,
        }, process.env.REFRESH_PRIVATE_KEY, {
            expiresIn: '7d',
            issuer: 'bomi'
        });

        // refresh 토큰을 데이터베이스에 저장
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        sql = `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`;
        await conn.execute(sql, [loginUser.id, refreshToken, expiresAt]);

        // access 토큰 쿠키에 저장
        res.cookie('accessJwt', accessToken, {
            httpOnly: true,
            secure: true, // HTTP 환경에서만 사용 
            maxAge: 5 * 60 * 1000 // 5분
        });

        // refresh 토큰 쿠키에 저장
        res.cookie('refreshJwt', refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
        })

        let loginResult = {
            username: loginUser.username,
            nickname: loginUser.nickname,
            authorities: authorities
        }
        res.status(StatusCodes.OK).json(loginResult);
    } else {
        return res.status(StatusCodes.UNAUTHORIZED).end();
    }
};

const signOut = async (req, res) => {
    const { refreshJwt } = req.cookies;
    console.log(req.cookies);

    if (!refreshJwt) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'No refresh Token'
        });
    }

    try {
        const decoded = jwt.verify(refreshJwt, process.env.REFRESH_PRIVATE_KEY);

        const sql = `DELETE FROM refresh_tokens WHERE user_id=? AND token=?`;
        await conn.execute(sql, [decoded.id, refreshJwt]);

        res.clearCookie('accessJwt');
        res.clearCookie('refreshJwt');

        return res.status(StatusCodes.OK).json({
            message: '로그아웃'
        });
    } catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Invalid refresh Token'
        });
    }
};

const passwordResetRequest = (req, res) => {
    const {email} = req.body;

    let sql = `SELECT * FROM users WHERE email = ?`;
    conn.query(sql, email,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST);
            }
            // 이메일로 유저가 있는지 찾음
            const user = results[0];
            console.log("user:", user);
            if (user) {
                return res.status(StatusCodes.OK).json({
                    email: email
                });
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).end();
            }
        }
    )
};

const passwordReset = (req, res) => {
    // 이전 페이지에서 입력했던 이메일
    const {email, password} = req.body;

    let sql = `UPDATE users SET password = ?, salt = ?  WHERE email = ?`;

    // 암호화된 비밀번호와 salt 값을 같이 DB에 저장
    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');
    
    let values = [hashPassword, salt, email]
    conn.query(sql, values, 
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            if (results.affectedRows)
                return res.status(StatusCodes.OK).json(results);
            else
                return res.status(StatusCodes.BAD_REQUEST).end();
        }
    )
};

module.exports = {
    signup,
    sign,
    signOut,
    passwordResetRequest,
    passwordReset
}

