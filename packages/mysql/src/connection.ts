import { Sequelize } from "sequelize";
import mysql2 from "mysql2";

const connection = new Sequelize(
  process.env.DB_DATABASE || "",
  process.env.DB_USER || "",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    dialectModule: mysql2,
    pool: {
      min: 0,
      max: 1,
      idle: 1000,
    },
  }
);

export { connection };
