require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql"
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_TEST_NAME || "cosc480_final_test_db",
    host: process.env.DB_HOST,
    dialect: "mysql"
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_PROD_NAME || "cosc480_final_prod_db",
    host: process.env.DB_HOST,
    dialect: "mysql"
  }
};