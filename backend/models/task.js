const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Task = sequelize.define(
  'Task',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in-progress', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium',
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'due_date',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'created_by',
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'assigned_to',
    },
  },
  {
    tableName: 'tasks',
    underscored: true,
  }
);

module.exports = Task;
