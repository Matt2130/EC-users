import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'cliente',
        validate: {
            isIn: [['cliente', 'administrador']],
        },
    },
    creationDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false,
    tableName: 'users'
});

sequelize.sync({ alter: true })
    .then(() => console.log("Tabla 'users' sincronizada correctamente"))
    .catch(err => console.error("Error al sincronizar la tabla 'users':", err));

export default User;