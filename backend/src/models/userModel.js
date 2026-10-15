const  pool  = require("../config/db")

const createUser = async (username, email, password) => {
    const result = await pool.query(
        "INSERT INTO users (username,email,password) VALUES ($1,$2,$3) RETURNING id, username, email, role, created_at",
        [username,email,password]
    );
    return result.rows[0];
};

const findUserByIdentifier = async (identifier) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE email=$1 OR username=$1" ,
        [identifier]
    );
    return result.rows[0];
};

const findUserById = async (id) => {
    const result = await pool.query(
        "SELECT id,full_name,phone,email,username,profile_image,created_at FROM users WHERE id=$1",
        [id]
    );
    return result.rows[0];
}

const findUserWithPassword = async (id) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE id=$1",
        [id]
    );
    return result.rows[0];
}

const updateUser = async (userId, data) => {
    const {
        full_name,
        phone,
        username,
        email
    } = data;

    const result = await pool.query(
        `UPDATE users
         SET full_name = COALESCE($1, full_name),
             phone = COALESCE($2, phone),
             username = COALESCE($3, username),
             email = COALESCE($4, email),
             updated_at = NOW()
         WHERE id = $5
         RETURNING id, full_name, phone, email,
                   username, role, profile_image,
                   created_at, updated_at`,
        [
            full_name ?? null,
            phone ?? null,
            username ?? null,
            email ?? null,
            userId
        ]
    );

    return result.rows[0];
};

const updateUserWithPassword = async (id,hashedPassword) => {
    const result = await pool.query(
        "UPDATE users SET password=$1 WHERE id=$2",
        [hashedPassword,id]
    )
}

const updateProfileImage = async (id,imagePath) => {
    const result = await pool.query(
        "UPDATE users SET profile_image=$1 WHERE id=$2",
        [imagePath, id]
    );

    return result.rows[0];
}

module.exports = {
    createUser,
    findUserByIdentifier,
    findUserById,
    findUserWithPassword,
    updateUser,
    updateUserWithPassword,
    updateProfileImage,
};