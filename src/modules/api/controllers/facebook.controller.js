const passport = require('passport');
const FacebookStrategy = require('passport-facebook');

class FacebookController {

  /**
   * @param {UserService} opts.userService
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    this.userService = opts.userService;
    this.config = opts.config;
  }

  /**
   * Array of routes processed by this controller
   * @returns {*[]}
   */
  getRoutes(app) {
    this.initializePassport();
    app.get('/api/v1/auth/facebook', passport.authenticate('facebook'));

    app.get('/api/v1/auth/facebook/callback', (req, res) => {
      passport.authenticate(
        'facebook',
        {failureRedirect: `${this.config.frontendUrl}?facebook-auth-error=restrict`}
      )(req, res, (err) => {

        if (err) {
          res.redirect(`${this.config.frontendUrl}?facebook-auth-error=${err.message}`);
          return;
        }

        res.redirect(this.config.frontendUrl);

      });

    });

    return [];
  }

  initializePassport() {
    passport.use(new FacebookStrategy({
      clientID: this.config.facebook.clientId,
      clientSecret: this.config.facebook.clientSecret,
      callbackURL: `${this.config.backendUrl}/api/v1/auth/facebook/callback`,
      profileFields: ['id', 'name', 'picture', 'email']
    }, (token, tokenSecret, profile, done) => {
      this.userService.getUserBySocialNetworkAccount('facebook', {
        ...profile._json,
        picture: profile._json.picture.data.url
      }).then((User) => {
        this.userService.getCleanUser(User).then((user) => done(null, user));
      }).catch((error) => {
        done(error);
      });
    }));
  }

}

module.exports = FacebookController;
