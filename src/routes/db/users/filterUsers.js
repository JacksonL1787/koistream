const getUsers = require("./getUsers")

module.exports = async (db, filter) => {
    const users = await getUsers(db);
    const filteredUsers = [];
    const searchUsers = (u) => {
        const val = filter.search.toLowerCase()
        if(val.trim().length <= 0) {
            return true;
        }
        const name = u.firstName.toLowerCase() + " " + u.lastName.toLowerCase()
        const firstName = name.split(" ")[0]
        const lastName = name.split(" ")[1]
        const email = u.email.toLowerCase()
        if(email.startsWith(val) || firstName.startsWith(val) || lastName.startsWith(val) || name.startsWith(val)) {
            return true;
        } else {
            return false;
        }
    }

    const applyGradeFilter = (u) => {
        const grade = filter.grade.toLowerCase()
        if(grade==="all") {
            return true;
        }
        if(grade==="faculty") {
            if(u.schoolAssociation === grade) {
                return true;
            } else {
                return false;
            }
        }
        if(grade==="none") {
            if(u.grade===0) {
                return true;
            } else {
                return false;
            }
        }
        if("" + u.grade === "" + grade) {
            return true;
        } else {
            return false;
        }
    }

    const applyBannedFilter = (u) => {
        let banned = filter.banned.toLowerCase()
        if(banned === "all") {
            return true;
        }
        banned = banned === "yes" ? true : false;
        if(u.banned === banned) {
            return true;
        } else {
            return false;
        }
    }

    const applyMutedFilter = (u) => {
        let muted = filter.muted.toLowerCase()
        if(muted === "all") {
            return true;
        }
        muted = muted === "yes" ? true : false;
        if(u.muted === muted) {
            return true;
        } else {
            return false;
        }
    }

    users.forEach((u) => {
        if(applyMutedFilter(u) && searchUsers(u) && applyGradeFilter(u) && applyBannedFilter(u)) {
            filteredUsers.push(u)
        }
    })

    let status = "users"
    
    if(filteredUsers.length === 0) {
        status = "none"
    } else if (filter.muted.toLowerCase() === "all" && filter.search.trim().length <= 0 && filter.banned === "all" && filter.grade === "all") {
        status ="search"
    }

    if(status === "users") {
        filteredUsers.sort(function(a, b){
            if(a.firstName + a.lastName < b.firstName + b.lastName) { return -1; }
            if(a.firstName + a.lastName > b.firstName + b.lastName) { return 1; }
            return 0;
        })
    }

    return {status: status, users: filteredUsers.length === users.length && status != "users" ? [] : filteredUsers};
}