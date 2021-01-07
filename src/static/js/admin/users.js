let 
	loadedUsers = [],
	filters = {
		muted: false, 
		banned: false, 
		notdtech: false,
		onlydtech: false
	},
	filterCount = 0,
	dropdownAnimating = false,
	searchingUsers = false,
	searchUsersTimeout = setTimeout(() => {return;}),
	numberofUserRows = 10,
	currentPage = 0;

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
			<a class="table-row" href="/admin/inspect/user/${u.googleId}" data-user="${u.googleId}">
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
})