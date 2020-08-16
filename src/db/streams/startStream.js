const { writer } = require("../pool")
const {  reader } = require("../pool")
const tables = require("../tables")
const randomstring = require("randomstring")
const sgMail = require('@sendgrid/mail');
const getUsers = require("../../db/users/getUsers")

module.exports = async (data, googleId) => {
    let stream = await writer
        .insert({
            title: data.title,
            runner: data.runner,
            streamId: randomstring.generate(),
            active: true,
            startedBy: googleId
        })
        .into(tables.streams)
        .returning("*")
        const users = await reader.select("*").from(tables.users)
        users.forEach(function(user) {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            const msg = {
                to: user.email,
                from: 'noreply@koistream.io',
                subject: 'KoiStream App Update',
                template_id: "d-edc22538414e481a8ece483eed787885",
            };
            sgMail.send(msg).then(m => {
                console.log('Mail sent');
            })
            .catch(error => {
                //Log friendly error
                console.error(error.toString());
            });
        })
    return stream[0];
    
}