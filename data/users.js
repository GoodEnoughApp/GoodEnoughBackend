const connection = require("./index");
const Sequelize = require("sequelize-cockroachdb");

//db structure 
// users 
const user = connection.sequelize.define("user", {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
    },
    name: {
        type: Sequelize.TEXT,
    },
    email: {
        type: Sequelize.TEXT,
    },
    password: {
        type: Sequelize.TEXT,
    },
    is_activated: {
        type: Sequelize.BOOLEAN,
    },
}
,{
    timestamps: false
}
);

// Functions:
// Insert a record
async function insert_user (name , email , password, is_activated) {
await user.create({
    name: name,
    email: email,
    password: password ,
    is_activated: is_activated 
}).catch(function (err) {
throw "error: " + err.message 
});
}

// check if email exists - sign up 
// true --> no record , false --> record exists 
async function check_email (email) {
   var emails =  await user.findAll({
    where: {
    email: email
    }
    }).catch(function (err) {
    throw "error: " + err.message 
    });
    if ( ! emails.length )
    return true
    else
    return false
    }

// check password length 
 function check_pass (Password) {
     if ( Password.toString().length < 8 )
     {
     return true
     }
     else
     {
     return false
     }
     }

// async function main()
// {
//     console.log( await check_pass ("123") )
// }
// main()

module.exports = {check_email , insert_user , check_pass} 