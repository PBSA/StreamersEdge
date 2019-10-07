const passport = require('passport');
const twitchStrategy = require('passport-twitch-helix').Strategy;

class TwitchController {

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
     * /auth/twitch:
     *  get:
     *    description: Auth by twitch
     *    summary: Auth by twitch
     *    produces:
     *      - application/json
     *    tags:
     *      - SocNetwork
     *    responses:
     *      302:
     *        description: Redirect to twitch
     */
    this.initializePassword();
    app.get('/api/v1/auth/twitch', passport.authenticate('twitch'));

    app.get('/api/v1/auth/twitch/callback', (req, res) => {
      passport.authenticate(
        'twitch',
        {failureRedirect: `${this.config.frontendUrl}?twitch-auth-error=restrict`}
      )(req, res, (err) => {

        if (err) {
          res.redirect(`${this.config.frontendUrl}?twitch-auth-error=${err.message}`);
          return;
        }

        res.redirect(this.config.frontendUrl);

      });

    });

    return [];
  }

  initializePassword() {
    passport.use(new twitchStrategy({
      passReqToCallback: true,
      clientID: this.config.twitch.clientId,
      clientSecret: this.config.twitch.clientSecret,
      callbackURL: `${this.config.backendUrl}/api/v1/auth/twitch/callback`,
      scope: 'user:read:email'
    }, (req, accessToken, refreshToken, profile, done) => {
      this.userService.getUserBySocialNetworkAccount('twitch', {
        id: profile.id.toString(),
        username: profile.username,
        email: profile.email,
        picture: profile._json.profile_image_url
      }, accessToken, req.user).then((User) => {
        this.userService.getCleanUser(User).then((user) => done(null, user));
      }).catch((error) => {
        done(error);
      });
    }));
  }

}

module.exports = TwitchController;
