const sequelize = require('../db');
const User = require('./user');
const Task = require('./task');

User.hasMany(Task, { foreignKey: 'createdBy', as: 'createdTasks' });
User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });

Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

module.exports = {
  sequelize,
  User,
  Task,
};
