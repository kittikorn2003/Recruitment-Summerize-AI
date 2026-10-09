const PERMISSION = {
    user: [
        "resumes:create",
        "resumes:parse",
        "resumes:read:own",
        "role_requests:create",  
        "role_requests:read:own", 
        "role_requests:cancel:own",
    ],

    hr: [
        "resumes:read:by",
        "resumes:read:all",
        "resumes:search"
    ],

    admin: [
        "resumes:create",
        "resumes:read:all",
        "resumes:read:own",
        "resumes:parse",
        "resumes:search",
        "role_requests:read",
        "role_requests:read:own",   
        "role_requests:review", 
        "role_requests:revoke",
        "role_requests:cancel:any",
        "users:role:update",
    ],
};

const hasPermission = (role, permission) => {
    if (role === "admin")
        return true;

    const rolePermissions = PERMISSION[role] || [];
    return rolePermissions.includes(permission);

}

const ensureAuthen = (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: "Authen required"});
        return false;
    }
    return true;
};

const checkPermission = (requiredPermission) => (req, res, next) => {
    if (!ensureAuthen(req, res))
        return;

    if (hasPermission(req.user.role, requiredPermission))
        return next();

    res.status(403).json({
        success:false,
        message: "Access denied: Insufficient permissions",
        required: requiredPermission,
        userRole: req.user.role,
    });
    // console.log("ข้อมูล user ทั้งหมดใน req:", req.user);
};



const checkAnyPermission = (permission) => (req, res, next) => {
    if (!ensureAuthen(req,res))
        return;
    
    const hasAny = permission.some((p) => hasPermission(req.user.role, p));
    if (hasAny) 
        return next();

    res.status(403).json({
        success:false,
        message: "Access denied: Insufficient permissions",
        required: permission,
        userRole: req.user.role,
    });

};

const checkRole = (allowedRoles) => (req, res, next) => {
    if (!ensureAuthen(req, res)) 
        return;

    if (allowedRoles.includes(req.user.role))
        return next();

    res.status(403).json({
    success: false,
    message: "Access denied: Invalid role",
    allowedRoles,
    userRole: req.user.role,
  });
};


module.exports = {
    PERMISSION,
    hasPermission,
    checkPermission,
    checkAnyPermission,
    checkRole,
};

