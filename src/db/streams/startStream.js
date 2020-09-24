const { writer } = require("../pool")
const { reader } = require("../pool")
const tables = require("../tables")
const randomstring = require("randomstring")
const sgMail = require('@sendgrid/mail');
const getUsers = require("../../db/users/getUsers")

const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

module.exports = async (data, googleId) => {
    let stream = await writer
        .insert({
            title: data.title,
            streamId: randomstring.generate(),
            active: true,
            startedBy: googleId
        })
        .into(tables.streams)
        .returning("*")
    if (data.emails == 'true') {
        const users = await reader.select("*").from(tables.users)
        users.forEach(function (user) {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            const msg = {
                to: user.email,
                from: 'noreply@koistream.io',
                subject: 'KoiStream App Update',
                template_id: "d-edc22538414e481a8ece483eed787885",
                dynamic_template_data: { "name": capitalize(user.firstName), "Sender_Name": "The KoiStream", "Sender_Address": "275 Oracle Parkway", "Sender_City": "Redwood City", "Sender_State": "California", "Sender_Zip": "94065"}

            };
            sgMail.send(msg).then(m => {
                console.log('Mail sent to ' + user.email);
            })

                .catch(err => {
                    console.error(err.toString());
                });
        })
    }
    return stream[0];

}