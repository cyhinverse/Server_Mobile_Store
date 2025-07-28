import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import User from '../models/user.model.js';
GoogleStrategy.Strategy;

passport.use(
	new GoogleStrategy(
		{
			clietId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: '/auth/google/callback',
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				const userExists = await User.findOne({ providerId: profile.id });
				if (userExists) {
					return done(null, user);
				}
				const newUser = new User({
					providerId: profile.id,
					fullName: profile.displayName,
					email: profile.emails[0].value,
				});
				await newUser.save();
				return done(null, newUser);
			} catch (error) {
				console.log('Error in Google Strategy: ', error);
				return done(error, null);
			}
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
	const user = await User.findById(id);
	done(null, user);
});
