const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

class GoogleController {

  /**
   * @param {UserService} opts.userService
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    this.userService = opts.userService;
    this.config = opts.config;

    this.DEFAULT_SCOPE = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];
  }

  /**
   * Array of routes processed by this controller
   * @returns {*[]}
   */
  getRoutes(app) {
    this.initializePassport();
    app.get('/api/v1/auth/google', passport.authenticate('google', {scope: this.DEFAULT_SCOPE}));

    app.get('/api/v1/auth/google/callback', (req, res) => {
      passport.authenticate(
        'google',
        {failureRedirect: `${this.config.frontendUrl}?google-auth-error=restrict`}
      )(req, res, (err) => {

        if (err) {
          res.redirect(`${this.config.frontendUrl}?google-auth-error=${err.message}`);
          return;
        }

        res.redirect(this.config.frontendUrl);

      });

    });

    return [];
  }

  initializePassport() {
    passport.use(new GoogleStrategy({
      clientID: this.config.google.clientId,
      clientSecret: this.config.google.clientSecret,
      callbackURL: `${this.config.backendUrl}/api/v1/auth/google/callback`
    }, (token, tokenSecret, profile, done) => {
      this.userService.getUserBySocialNetworkAccount('google', {id: profile.id, ...profile._json}).then((User) => {
        this.userService.getCleanUser(User).then((user) => done(null, user));
      }).catch((error) => {
        done(error);
      });
    }));
  }

  redirectAfterAuth(req, res) {
    let redirectUrl = this.config.frontendUrl;
    res.redirect(redirectUrl);
  }

}

module.exports = GoogleController;
