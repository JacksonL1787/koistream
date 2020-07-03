const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const _ = require("lodash")

const { reader, writer } = require("../db/pool")
const tables = require("../db/tables")
const addLog = require('../db/logs/addLog');

passport.serializeUser((user, done) => {
    done(null, user.googleId);
})

passport.deserializeUser((id, done) => {
    reader.select("*").from(tables.users).where(`${tables.users}.googleId`, id).asCallback((err, user) => {
        if(err) return console.error(err);
        done(null, user[0]);
    })
})

passport.use(
    new GoogleStrategy({
        callbackURL:'/auth/googleRedirect',
        clientID:'363354508586-gu3j3sblfdk2po75ihei6hap6auhht5c.apps.googleusercontent.com',
        clientSecret:'IhWCd29eHWqNA8-fUJJXUyeH'
    }, (accessToke, refreshToken, profile, email, done) => {
        console.log(email.id)
        reader.select("*").from(tables.users).where(`${tables.users}.googleId`, email.id).asCallback((err, currentUser) => {
            if(err) return console.error(err);
            
            currentUser = currentUser[0]
            
            if(currentUser) {
                console.log('existing user found: ' + currentUser)
                console.log(currentUser)
                done(null, currentUser)
            } else {
                let verified = email.emails[0].value.toLowerCase().split("@").pop() == "dtechhs.org"
                var grade;
                var schoolAssociation;
                if(email.emails[0].value.toLowerCase().substring(email.emails[0].value.toLowerCase().length - 14).substring(0,2) == 23) {
                    console.log("Freshman Email")
                    grade = 9
                    schoolAssociation = "student"
                }
                if(email.emails[0].value.toLowerCase().substring(email.emails[0].value.toLowerCase().length - 14).substring(0,2) == 22) {
                    console.log("Sophomore Email")
                    grade = 10
                    schoolAssociation = "student"
                }
                if(email.emails[0].value.toLowerCase().substring(email.emails[0].value.toLowerCase().length - 14).substring(0,2) == 21) {
                    console.log("Junior Email")
                    grade = 11
                    schoolAssociation = "student"
                }
                if(email.emails[0].value.toLowerCase().substring(email.emails[0].value.toLowerCase().length - 14).substring(0,2) == 20) {
                    console.log("Senior Email")
                    grade = 12
                    schoolAssociation = "student"
                }
                if(isNaN(email.emails[0].value.toLowerCase().substring(email.emails[0].value.toLowerCase().length - 14).substring(0,2))) {
                    grade = 0
                    schoolAssociation = "faculty"
                }
                writer.insert({
                    googleId: email.id,
                    email: email.emails[0].value.toLowerCase(),
                    firstName: email.name.givenName.toLowerCase(),
                    lastName: email.name.familyName.toLowerCase(),
                    googleProfilePicture: email.photos[0].value,
                    auth: verified ? 1 : 0,
                    grade: verified ? grade : 0,
                    schoolAssociation: verified ? schoolAssociation : "none"
                })
                .returning('*')
                .into(tables.users)
                .then((user) => {
                    user = user[0]
                    const fullName = _.startCase(user.firstName + " " + user.lastName)
                    const logMsg = `${fullName}(${user.email}) logged in for the first time.`
                    addLog(logMsg, "firstLogin")
                    done(null, user)
                })
            }
        })
    })
)