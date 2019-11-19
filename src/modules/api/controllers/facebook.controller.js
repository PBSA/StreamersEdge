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
    /**
     * @swagger
     *
     * /auth/facebook:
     *  get:
     *    description: Auth by facebook
     *    summary: Auth by facebook
     *    produces:
     *      - application/json
     *    tags:
     *      - SocNetwork
     *    responses:
     *      302:
     *        description: Redirect to facebook
     */
    this.initializePassport();
    app.get('/api/v1/auth/facebook', passport.authenticate('facebook',{scope: 'email'}));

    app.get('/api/v1/auth/facebook/callback', (req, res) => {
      passport.authenticate(
        'facebook',
        {failureRedirect: `${this.config.frontendUrl}?facebook-auth-error=restrict`}
      )(req, res, (err) => {

        if (err) {
          res.redirect(`${this.config.frontendUrl}?facebook-auth-error=${err.message}`);
          return;
        }
        
        const newUser = req.session.newUser;
        res.redirect(`${this.config.frontendCallbackUrl}/${newUser ? 'profile' : ''}`);
      });

    });

    return [];
  }

  initializePassport() {
    passport.use(new FacebookStrategy({
      passReqToCallback: true,
      clientID: this.config.facebook.clientId,
      clientSecret: this.config.facebook.clientSecret,
      callbackURL: `${this.config.backendUrl}/api/v1/auth/facebook/callback`,
      profileFields: ['id', 'name', 'picture', 'email']
    }, (req, token, tokenSecret, profile, done) => {
      this.userService.getUserBySocialNetworkAccount('facebook', {
        ...profile._json,
        username: profile._json.first_name.toLowerCase() + profile._json.id,
        picture: profile._json.picture.data.url
      }, token, req).then((User) => {
        this.userService.getCleanUser(User).then((user) => done(null, user));
      }).catch((error) => {
        done(error);
      });
    }));
  }

}

module.exports = FacebookController;
