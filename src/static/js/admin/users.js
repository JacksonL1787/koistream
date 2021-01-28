let 
	loadedUsers = [],
	filters = {
		muted: false, 
		admin: false, 
		notdtech: false,
		onlydtech: false
	},
	filterCount = 0,
	dropdownAnimating = false,
	searchingUsers = false,
	searchUsersTimeout = setTimeout(() => {return;}),
	numberofUserRows = 10,
	currentPage = 0

const chatTagColorPicker = Pickr.create({
	el: '.chat-tag-color-picker',
	
	showAlways: true,
	inline: true,
	default: "#FFFFFF",

	components: {

        // Main components
		hue: true,
		preview: false,

        // Input / output Options
        interaction: {
            input: true
        }
    }
})

const setChatTagPreviewColor = (color) => {
	$("#add-chat-tag-modal .preview-container .chat-tag")
		.css("color", color)
		.css("background", `${color}26`)
		.css("border-color", color)
		.css("box-shadow", `0 0 3px 0 ${color}`)
}

chatTagColorPicker.on('init', () => {
	setChatTagPreviewColor("#FFFFFF")
	chatTagColorPicker.hide()
})



const appendUsers = () => {
	for(let i = 0; i < numberofUserRows; i++) {
		let u = loadedUsers[i + (numberofUserRows * currentPage)]
		if(!u && loadedUsers.length >= numberofUserRows) {
			$(".users-widget-inner-container.users-table-container .table-rows").append(`
				<a class="table-row hidden-row">
					<div class="user-info-flex-wrap">
						<p class="first-name">Placeholder</p>
						<p class="last-name">Placeholder</p>
						<p class="email">Placeholder</p>
					</div><img class="go-to-button" src="/img/back-icon-blue.svg" />
				</a>
			`)
			continue;
		} else if(!u) {
			break;
		}
		$(".users-widget-inner-container.users-table-container .table-rows").append(`
			<a class="table-row" target="_blank" href="/admin/inspect/user/${u.googleId}" data-user="${u.googleId}">
				<div class="user-info-flex-wrap">
					<p class="first-name">${_.startCase(u.firstName)}</p>
					<p class="last-name">${_.startCase(u.lastName)}</p>
					<p class="email">${u.email}</p>
				</div><img class="go-to-button" src="/img/back-icon-blue.svg" />
			</a>
		`)
	}
}

const nextUsersPage = () => {
	currentPage++
	$(".users-table-container .page-selector .previous-page-button").addClass("active")
	if(loadedUsers.length <= (currentPage + 1) * numberofUserRows) $(".users-table-container .page-selector .next-page-button").removeClass("active")
	$(".users-table-container .table-rows .table-row").remove()
	$(".users-table-container .page-selector .val").text(`${currentPage*numberofUserRows+1}-${currentPage*numberofUserRows+10} of ${loadedUsers.length} Users`)
	appendUsers()
}

const previousUsersPage = () => {
	currentPage--
	$(".users-table-container .page-selector .next-page-button").addClass("active")
	if(currentPage === 0) $(".users-table-container .page-selector .previous-page-button").removeClass("active")
	$(".users-table-container .page-selector .val").text(`${currentPage*numberofUserRows+1}-${currentPage*numberofUserRows+10} of ${loadedUsers.length} Users`)
	$(".users-table-container .table-rows .table-row").remove()
	appendUsers()
}
const sortUsers = (value, reverse) => {
	loadedUsers.sort((a, b) =>{
		if(a[value].toLowerCase() < b[value].toLowerCase()) { return reverse ? 1 : -1; }
		if(a[value].toLowerCase() > b[value].toLowerCase()) { return reverse ? -1 : 1; }
		return 0;
	})
}

const searchUsers = () => {
	searchingUsers = true
	$(".users-widget-inner-container").removeClass("active")
	$(".users-widget-inner-container.loading-container").addClass("active")
	const data = {
		val: $("#user-search-input").val(),
		filters
	}
	$(".users-table-container .table-rows .table-row").remove()
	$(".users-table-container .sort-arrow").removeClass("active").removeClass("a-to-z").removeClass("z-to-a").css("display", "none")
	$(".users-table-container #first-name-table-head-item .sort-arrow").addClass("active").addClass("a-to-z").css("display", "block")
	$(".users-table-container .page-selector .page-control-button").removeClass("active")
	loadedUsers = []
	clearTimeout(searchUsersTimeout)
	searchUsersTimeout = setTimeout(() => {
		searchingUsers = false;
		$.post({
			url: "/admin/api/searchUsers",
			data: data,
			success: (users) => {
				$(".users-widget-inner-container").removeClass("active")
				if(searchingUsers) return $(".users-widget-inner-container.loading-container").addClass("active");
				if(users === "prompt search") return $(".users-widget-inner-container.prompt-search-container").addClass("active")
				if(!users.length) return $(".users-widget-inner-container.no-results-container").addClass("active");
				$(".users-widget-inner-container").removeClass("active")
				$(".users-widget-inner-container.loading-container").addClass("active");
				loadedUsers = users
				$(".users-table-container .page-selector .page-control-button").show()
				$(".users-table-container .page-selector .val").text(loadedUsers.length > 10 ? `1-${numberofUserRows} of ${loadedUsers.length} Users` : `${loadedUsers.length} Users`)
				if(loadedUsers.length > 10) {
					$(".users-table-container .page-selector .next-page-button").addClass("active")
				} else {
					$(".users-table-container .page-selector .page-control-button").hide()
				}
				sortUsers("firstName", false)
				appendUsers()
				$(".users-widget-inner-container").removeClass("active")
				$(".users-widget-inner-container.users-table-container").addClass("active")
			}
		})
	}, 300)
}

const openDropdownMenu = (elem) => {
	elem.addClass("active")
	let menuContentContainer = $(`#${elem.attr("data-menu")}-container`),
		h = menuContentContainer.height() + 10,
		w = menuContentContainer.width(),
		r = parseInt(elem.attr("data-right"))
	menuContentContainer.addClass("active")
	$(".action-buttons-container .dropdown-menu")
		.height(h)
		.width(w)
		.css("bottom", `${-h - 30}px`)
		.css("right", `${r}px`)
		.css("visibility", "visible")
		.addClass("active").animate({
			opacity: 1,
			bottom: -h - 10
		}, 300, () => {
			dropdownAnimating = false;
		})
}

const slideDropdownMenu = (elem) => {
	let menuContentContainer = $(`#${elem.attr("data-menu")}-container`),
		h = menuContentContainer.height() + 10,
		w = menuContentContainer.width(),
		r = parseInt(elem.attr("data-right"))
	$(".icon-button").removeClass("active")
	elem.addClass("active")
	$(".action-buttons-container .dropdown-menu .dropdown-menu-content-container").removeClass("active")
	setTimeout(() => {
		menuContentContainer.addClass("active")
		dropdownAnimating = false;
	}, 300)
	$(".action-buttons-container .dropdown-menu")
		.animate({
			height: h,
			right: r,
			bottom: -h - 10,
			width: w
		}, 300).css('overflow', 'visible')
}

const closeDropdownMenu = () => {
	$(".dropdown-menu-content-container").removeClass("active")
	$(".action-buttons-container .icon-button").removeClass("active")
	$(".action-buttons-container .dropdown-menu").removeClass("active").animate({
		opacity: 0,
		bottom: -$(".action-buttons-container .dropdown-menu").height() - 30
	}, 300, () => {
		$(".action-buttons-container .dropdown-menu").css("visibility", "hidden")
		dropdownAnimating = false;
	})
}

const appendChatTag = (data) => {
	$("#manage-chat-tags-modal .modal-content").append(`

		<div class="chat-tag-container" data-chat-tag-id="${data.id}" data-chat-tag-name="${data.tag_name}" data-chat-tag-color="${data.tag_color}">
			<span class="chat-tag" style="color: ${data.tag_color}; background: ${data.tag_color}26; border-color: ${data.tag_color}; box-shadow: 0 0 3px 0 ${data.tag_color};">${data.tag_name}</span>
			<div class="actions-container">
				<svg class="action-button edit-chat-tag-button" height="512" viewbox="0 0 24 24" width="512" xmlns="http://www.w3.org/2000/svg">
					<path d="m20.5444 3.4551a4.9733 4.9733 0 0 0 -7.0263 0l-1.8709 1.8709-8.4187 8.4191a.9975.9975 0 0 0 -.2827.5654l-.9358 6.5479a1 1 0 0 0 .99 1.1416.9818.9818 0 0 0 .1416-.01l6.5484-.9353a1.0028 1.0028 0 0 0 .5654-.2832l10.29-10.2891a4.9686 4.9686 0 0 0 0-7.0273zm-11.4677 15.667-4.898.6992.7-4.8975 7.4758-7.4764 4.1987 4.1984zm10.0533-10.0537-1.163 1.1634-4.1989-4.1986 1.164-1.1641a3.0407 3.0407 0 0 1 4.1983 0 2.97 2.97 0 0 1 0 4.1993z"></path>
				</svg>
				<svg class="action-button delete-chat-tag-button" clip-rule="evenodd" fill-rule="evenodd" height="512" stroke-linejoin="round" stroke-miterlimit="2" viewbox="0 0 24 24" width="512" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
					<path d="m9 6v-2c0-.552.448-1 1-1h4c.552 0 1 .448 1 1v2h5c.552 0 1 .448 1 1s-.448 1-1 1h-1.074l-.929 12.077c-.04.521-.474.923-.997.923h-10c-.523 0-.957-.402-.997-.923l-.929-12.077h-1.074c-.552 0-1-.448-1-1s.448-1 1-1zm-1.92 2 .846 11h8.148l.846-11zm5.92-2v-1h-2v1z"></path>
				</svg>
			</div>
		</div>

	`)
}

const deleteListedChatTag  = (data) => {
	let tagElem = $(`#manage-chat-tags-modal .modal-content .chat-tag-container[data-chat-tag-id="${data.id}"]`)
	console.log(tagElem)
	tagElem.remove()
	if($("#add-chat-tag-modal").hasClass("active") && $("#add-chat-tag-modal .submit-button").attr("data-chat-tag-id") === "" + data.id) closeModal()
}

const editListedChatTag  = (data) => {
	console.log(data)
	if($("#add-chat-tag-modal").hasClass("active") && $("#add-chat-tag-modal .submit-button").attr("data-chat-tag-id") === "" + data.id) closeModal()
	let tagElem = $(`#manage-chat-tags-modal .modal-content .chat-tag-container[data-chat-tag-id="${data.id}"]`)
	tagElem.attr("data-chat-tag-name", data.tag_name).attr("data-chat-tag-color", data.tag_color)
	tagElem.find(".chat-tag")
		.css("color", data.tag_color)
		.css("background", `${data.tag_color}26`)
		.css("border-color", data.tag_color)
		.css("box-shadow", `0 0 3px 0 ${data.tag_color}`)
		.text(data.tag_name)
}

const getChatTags = () => {
	$.get({
		url: "/admin/api/getChatTags",
		success: (tags) => {
			tags.sort((a, b) => (a.id > b.id) ? 1 : -1)
			tags.forEach(appendChatTag)
		}
	})
}

chatTagColorPicker.on('change', (color) => {
	let c = color.toHEXA().toString()
	setChatTagPreviewColor(c)
})

$("#add-chat-tag-modal .chat-tag-name").on("input", () => {
	let val = $("#add-chat-tag-modal .chat-tag-name").val()
	if(val.length > 20) return $("#add-chat-tag-modal .chat-tag-name").val(val.slice(0,20))
	$("#add-chat-tag-modal .preview-container .chat-tag").text(val.trim().length > 0 ? val : "Example")
})

$("#confirm-delete-chat-tag-modal .confirm-delete-button").click(() => {
	
	const id = $("#confirm-delete-chat-tag-modal .confirm-delete-button").attr("data-chat-tag-id")
	console.log(id)
	$.post({
		url: "/admin/api/deleteChatTag",
		data: {id},
		success: () => {
			switchModal($("#manage-chat-tags-modal"))
			modalCallback = () => {};
		}
	})
})

$("#add-chat-tag-modal .submit-button").click(() => {
	const action = $("#add-chat-tag-modal .submit-button").attr("data-action")
	let url = action === "create" ? "/admin/api/createChatTag" : "/admin/api/editChatTag"
	let data = {
		name: $("#add-chat-tag-modal .chat-tag-name").val(),
		color: chatTagColorPicker._color.toHEXA().toString(),
		id: action === "create" ? false : $("#add-chat-tag-modal .submit-button").attr("data-chat-tag-id")
	}

	$.post({
		url,
		data,
		success: () => {
			switchModal($("#manage-chat-tags-modal"))
			modalCallback = () => {};
		}
	})

})

$("#filters-menu-container .filter-button").click(function() {
	const filter = $(this).attr('data-filter')
	$(this).toggleClass("active")
	filters[filter] = $(this).hasClass("active") ? true : false
	
	if(filter === "onlydtech" && $(this).hasClass("active")) {
		$('.filter-button[data-filter="notdtech"]').removeClass("active")
		filters.notdtech = false;
	} 
	if(filter === "notdtech" && $(this).hasClass("active")) {
		$('.filter-button[data-filter="onlydtech"]').removeClass("active")
		filters.onlydtech = false;
	}

	filterCount = 0;
	Object.keys(filters).forEach((f) => {
		if(filters[f]) filterCount++
	})
	$('.icon-button[data-menu="filters-menu"] .dot .value').text(filterCount)
	
	if(filterCount > 0) {
		$('.icon-button[data-menu="filters-menu"] .dot').addClass("active")
	} else {
		$('.icon-button[data-menu="filters-menu"] .dot').removeClass("active")
	}
	searchUsers()
})

$("#user-search-input").on("input", () => {
	searchUsers()
})

$("#add-chat-tag-modal .previous-modal-button, #confirm-delete-chat-tag-modal .previous-modal-button").click(() => {
	switchModal($("#manage-chat-tags-modal"))
	modalCallback = () => {};
})

$("#manage-chat-tags-modal .create-chat-tag-button").click(() => {
	switchModal($("#add-chat-tag-modal"))
	chatTagColorPicker.show()
	modalCallback = () => {
		$("#add-chat-tag-modal .chat-tag-name").val("")
		$("#add-chat-tag-modal .preview-container .chat-tag").text("Example")
		chatTagColorPicker.setColor("#FFFFFF")
		chatTagColorPicker.hide()
	}
})

$(document).on("click", "#manage-chat-tags-modal .edit-chat-tag-button", function() {
	switchModal($("#add-chat-tag-modal"))
	const elem = $(this).parent().parent()
	let id = elem.attr("data-chat-tag-id"),
		name = elem.attr("data-chat-tag-name"),
		color = elem.attr("data-chat-tag-color")
	$("#add-chat-tag-modal .modal-title").text("Edit Chat Tag")
	$("#add-chat-tag-modal .submit-button").attr("data-action", "update").text("Update").attr("data-chat-tag-id", id)
	$("#add-chat-tag-modal .chat-tag-name").val(name)
	$("#add-chat-tag-modal .chat-tag").text(name)
	chatTagColorPicker.setColor(color)
	chatTagColorPicker.show()
	modalCallback = () => {
		$("#add-chat-tag-modal .modal-title").text("Create Chat Tag")
		$("#add-chat-tag-modal .submit-button").attr("data-action", "create").text("Create").removeAttr("data-chat-tag-id")
		$("#add-chat-tag-modal .chat-tag-name").val("")
		$("#add-chat-tag-modal .preview-container .chat-tag").text("Example")
		chatTagColorPicker.setColor("#FFFFFF")
		chatTagColorPicker.hide()
	}
})

$(document).on("click", "#manage-chat-tags-modal .delete-chat-tag-button", function() {
	switchModal($("#confirm-delete-chat-tag-modal"))
	const elem = $(this).parent().parent()
	let id = elem.attr("data-chat-tag-id"),
		name = elem.attr("data-chat-tag-name"),
		color = elem.attr("data-chat-tag-color")
	$("#confirm-delete-chat-tag-modal .confirm-message b").text(name).css("color", color)
	$("#confirm-delete-chat-tag-modal .confirm-delete-button").attr("data-chat-tag-id", id)
	modalCallback = () => {}
})

$("#settings-menu-container .manage-chat-tags-button").click(() => {
	openModal($("#manage-chat-tags-modal"))
	modalCallback = () => {};
})

$("#settings-menu-container .manage-admin-accounts-button").click(() => {
	openModal($("#manage-admin-accounts-modal"))
	modalCallback = () => {};
})

$(".action-buttons-container .icon-button").click(function() {
	if(dropdownAnimating) return;
	dropdownAnimating = true;
	if($(".action-buttons-container .dropdown-menu").hasClass("active") && !$(this).hasClass("active")) return slideDropdownMenu($(this));
	if(!$(this).hasClass("active")) return openDropdownMenu($(this));
	if($(this).hasClass("active")) return closeDropdownMenu();
})

$(".users-table-container .page-selector .previous-page-button").click(function() {
	if($(this).hasClass("active")) previousUsersPage();
})

$(".users-table-container .page-selector .next-page-button").click(function() {
	if($(this).hasClass("active")) nextUsersPage();
})

$(".users-table-container .inner-head-item-content").click(function() {
	$(".users-table-container .table-rows .table-row").remove()
	const elem = $(this).find(".sort-arrow")
	let value = elem.attr("data-value")
	let reverse = false;
	if(elem.hasClass("active")) {
		if(elem.hasClass("a-to-z")) {
			elem.removeClass("a-to-z").addClass("z-to-a")
			reverse = true;
		} else {
			elem.addClass("a-to-z").removeClass("z-to-a")
		}
	} else {
		$(".users-table-container .sort-arrow").removeClass("active").removeClass("z-to-a").removeClass("a-to-z").fadeOut(200)
		elem.addClass("active").addClass("a-to-z").fadeIn(200)
	}
	sortUsers(value, reverse)
	appendUsers()
})

$(document).ready(() => {
	$("#user-search-input").val("")
	getChatTags()
})

socket.on("chatTagDeleted", deleteListedChatTag)
socket.on("chatTagEdited", editListedChatTag)
socket.on("chatTagCreated", appendChatTag)