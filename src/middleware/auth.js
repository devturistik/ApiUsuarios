const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
      // Si hay una sesión activa, permite continuar
      return next();
    } else {
      // Si no hay sesión, redirige al login
      return res.redirect('/login');
    }
  };
  
  export default requireAuth;
  