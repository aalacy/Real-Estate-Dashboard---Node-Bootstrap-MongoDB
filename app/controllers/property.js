/*!
 * Module dependencies.
 */

exports.my = function(req, res, next) {
  res.render('property/myproperties', {
    title: 'Avenue - MyProperties',
    token: req.csrfToken()
  });
};

exports.overview = function(req, res) {
  res.render('property/overview', {
    title: 'Avenue - Overview',
    token: req.csrfToken()
  });
};
