const passport = require('passport');
const SteamStrategy = require('passport-steam');

class SteamController {

  /**
   * @param {UserService} opts.userService
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    this.config = opts.config;
    this.userService = opts.userService;
  }

  /**
   * Array of routes processed by this controller
   * @returns {*[]}
   */
  getRoutes(app) {
    /**
     * @api {get} /api/v1/auth/google Auth by google
     * @apiName GoogleAuth
     * @apiGroup Google
     * @apiVersion 0.1.0
     */
    this.initializePassport();
    app.get('/api/v1/auth/steam', (req, res, next) => {
      if (!req.isAuthenticated()) {
        res.redirect(`${this.config.frontendUrl}?steam-auth-error=cannot-authenticated`);
        return;
      }

      return passport.authenticate('steam')(req, res, next);
    });

    app.get('/api/v1/auth/steam/callback', (req, res) => {
      if (!req.isAuthenticated()) {
        res.redirect(`${this.config.frontendUrl}?steam-auth-error=cannot-authenticated`);
        return;
      }

      passport.authenticate('steam', {})(req, res, (err) => {
        if (err) {
          res.redirect(`${this.config.frontendUrl}?steam-auth-error=${err.message}`);
          return;
        }

        res.redirect(this.config.frontendUrl);

      });

    });

    return [];
  }

  initializePassport() {
    passport.use(new SteamStrategy({
      profile: false,
      passReqToCallback: true,
      returnURL: `${this.config.backendUrl}/api/v1/auth/steam/callback`,
      realm: this.config.backendUrl
    }, (req, identifier, profile, done) => {
      const steamId = identifier.match(/[0-9]+$/)[0];
      this.userService.patchProfile(req.user, {steamId}).then(() => {
        done(null, req.user);
      }).catch((e) => done(e.message));
    }));
  }

}

module.exports = SteamController;
