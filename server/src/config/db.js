const { Pool } = require("pg");

const config = process.env.DATABASE_URL
    ? {
          connectionString: process.env.DATABASE_URL,
          ssl:
              process.env.NODE_ENV === "production"
                  ? {
                        rejectUnauthorized: false,
                    }
                  : false,
      }
    : {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
      };

const pool = new Pool(config);

pool.on("connect", () => {
    console.log("Connected to PostgreSQL");
});

pool.on("error", (error) => {
    console.error(
        "Unexpected PostgreSQL error:",
        error
    );
});

module.exports = pool;