const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite:messages.db:', { logging: false });

class Message extends Model { }
Message.init({
    chat_id: DataTypes.INTEGER,
    message: DataTypes.STRING,
    author_id: DataTypes.INTEGER,
    timestamp: DataTypes.DATE
}, { sequelize, modelName: 'message', underscore: true, timestamps: false });

async function newMessage(chatId, message, uuid) {
    if (typeof chatId != 'number') throw new TypeError('chatId must be a type of number!');
    if (typeof message != 'string') throw new TypeError('message must be a type of string!');
    if (typeof uuid != 'number') throw new TypeError('uuid must be a type of number!');

    sequelize.sync(/* { force: true } */).then(() => {
        Message.create({
            chat_id: chatId,
            message: message,
            author_id: uuid,
            timestamp: new Date()
        });
    });
}

class User extends Model { }
User.init({
    user_id: DataTypes.INTEGER,
    display_name: DataTypes.STRING,
    client_secret: DataTypes.STRING,
    client_refresh: DataTypes.STRING,
}, { sequelize, modelName: 'user', underscore: true, updatedAt: false });

async function createUser(uuid, displayName, secret, refresh) {
    sequelize.sync(/* { force: true } */).then(() => {
        User.create({
            user_id: uuid,
            display_name: displayName,
            client_secret: secret,
            client_refresh: refresh,
        }).then((user) => {
            console.log('Created new user.', user)
        });
    });
}


async function getMessages() {
    return Message.findAll().then((res) => {
        return res;
    });
}

async function getUsers() {
    return User.findAll().then((res) => {
        console.log(res)
        return res;
    });
}

async function getUser(id) {
    return User.findAll({
        where: {
            user_id: id
        }
    }).then((res) => {
        if (res.length <= 0) return null;
        return res;
    }).catch((err) => {
        console.log(err)
    })
}

async function clearDB() {
    User.destroy({ truncate: true });
    Message.destroy({ truncate: true });
}

module.exports = { createUser, newMessage, getMessages, getUsers, getUser, clearDB };