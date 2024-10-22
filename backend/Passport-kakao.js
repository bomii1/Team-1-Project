const passport = require('passport');
const KaKaoStrategy = require('passport-kakao').Strategy;

passport.use(new KaKaoStrategy({
    clientID: process.env.KAKAO_CLIENT_ID,
    callbackURL: "/auth/kakao/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        const user = {
            id: profile.id,
            username: profile.username || profile.displayName,
        };
        return done(null, user);
    }
));

// 사용자 정보를 세션에 저장
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});