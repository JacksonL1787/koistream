let processingMute, processingAuthChange = false;


$(".back-button").click(() => {
	if(history.length != 1) return history.back()
	window.close()
})

const loadUserCard = () => {
	$.get({
		url: `/admin/api/userDetails/${window.userId}`,
		success: (user) => {
			console.log(user)
			user.fullName = _.startCase(user.firstName + " " + user.lastName)
			$(".profile-info-widget .account-type-banner .value").text(`${user.auth >= 2 ? "Admin" : "User"}`)
			$(".profile-info-widget .user-profile-picture").attr("src", user.googleProfilePicture)
			$(".profile-info-widget .user-name").text(user.fullName)
			$(".profile-info-widget .user-email").text(user.email)
			if(user.online) {
				$(".profile-info-widget .last-online-value").addClass("online")
			} else {
				$(".profile-info-widget .last-online-value").removeClass("online")
			}
			$(".profile-info-widget .last-online-value").text(user.online ? "Currently Online" : moment(new Date(user.lastOnline)).format("LLLL"))
			$(".profile-info-widget .date-created-value").text(moment(new Date(user.dateCreated)).format("LLLL"))
			if(user.tagName) {
				$(".profile-info-widget .chat-tag-value")
					.removeClass("none-selected")
					.text(user.tagName)
					.css("color", user.tagColor)
					.css("background", `${user.tagColor}26`)
					.css("border-color", user.tagColor)
					.css("box-shadow", `0 0 3px 0 ${user.tagColor}`)
			} else {
				$(".profile-info-widget .chat-tag-value").addClass("none-selected").text("None")
			}
			$(".profile-info-widget .name-color-value .color-bubble").css("background", user.nameColor)
			$(".profile-info-widget .name-color-value p").css("color", user.nameColor).text(user.fullName)
			
			if(user.auth >= 2) {
				$("#admin-account-switch-control .switch-wrap").addClass("active").find(".status").text("YES")
			} else {
				$("#admin-account-switch-control .switch-wrap").removeClass("active").find(".status").text("NO")
			}

			if(user.muted) {
				$("#mute-user-switch-control .switch-wrap").addClass("active").find(".status").text("YES")
			} else {
				$("#mute-user-switch-control .switch-wrap").removeClass("active").find(".status").text("NO")
			}
		}
	})
}

$("#mute-user-switch-control").click(() => {
	if(processingMute) return;
	processingMute = true;
	if(!$("#mute-user-switch-control .switch-wrap").hasClass("active")) {
		$("#mute-user-switch-control .switch-wrap").addClass("active").find(".status").text("YES")
	} else {
		$("#mute-user-switch-control .switch-wrap").removeClass("active").find(".status").text("NO")
	}
	$.post({
		url: "/admin/api/muteUser",
		data: {user: window.userId},
		success: () => {
			processingMute = false;
		}
	})
})

$("#admin-account-switch-control").click(() => {
	if(processingAuthChange) return;
	processingAuthChange = true;
	if(!$("#admin-account-switch-control .switch-wrap").hasClass("active")) {
		$("#admin-account-switch-control .switch-wrap").addClass("active").find(".status").text("YES")
	} else {
		$("#admin-account-switch-control .switch-wrap").removeClass("active").find(".status").text("NO")
	}
	let data = {
		user: window.userId,
		admin: $("#admin-account-switch-control .switch-wrap").hasClass("active")
	}
	$.post({
		url: "/admin/api/setUserAuth",
		data: data,
		success: () => {
			processingAuthChange = false;
		}
	})
})

loadUserCard()