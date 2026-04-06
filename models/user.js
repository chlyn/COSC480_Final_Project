'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  User.init({

    firstname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true 
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    major: {
      type: DataTypes.STRING,
      allowNull: false
    },
    minor: {
      type: DataTypes.STRING,
      allowNull: true
    },

  }, {

    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true
    
  });

  return User;

};