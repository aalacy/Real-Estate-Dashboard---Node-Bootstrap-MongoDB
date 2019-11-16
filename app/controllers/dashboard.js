/*!
 * Module dependencies.
 */

exports.index = function(req, res) {
  res.render('dashboard/index', {
    token: req.csrfToken(),
    title: 'Avenue - Dashboard'
  });
};
