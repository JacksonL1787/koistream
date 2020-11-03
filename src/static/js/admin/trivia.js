let questionCardCount = 0;

$("#add-template-btn").click(() => {
	$("#template-editor-container").addClass("active")
})

$("#template-editor-container .close").click(() => {
	$("#template-editor-container").removeClass("active")
	$("#template-editor-container .template-title-input").val("")
	$("#template-editor-container .quesiton-duration-input").val($("#template-editor-container .quesiton-duration-input").data("default-val"))
	$("#template-editor-container .answering-duration-input").val($("#template-editor-container .answering-duration-input").data("default-val"))
	questionCardCount = 0;
	$(".question-cards-flex-wrap .question-card").remove()
	$("#add-question-card-btn").addClass("full-width")
})

$("#add-question-card-btn").click(() => {
	const cardHTML = `
		<div class="question-card card-wrap" data-question-number="${questionCardCount+1}">
			<div class="top-content-wrap">
				<h1 class="question-number">${questionCardCount+1}.</h1>
				<div class="controls-wrap">
					<div class="move-left action-btn">
						<div class="icon"></div>
						<p>Left</p>
					</div>
					<div class="move-right action-btn">
						<div class="icon"></div>
						<p>Right</p>
					</div>
					<div class="delete-question action-btn">
						<div class="icon"></div>
						<p>Delete</p>
					</div>
				</div>
			</div>
			<div class="question-information"><input class="question-input" type="text" placeholder="question" />
				<div class="all-options-container">
					<div class="option-wrap correct-option"><input type="text" placeholder="option (correct)" /></div>
					<div class="option-wrap"><input type="text" placeholder="option (incorrect)" /></div>
					<button class="add-option-btn">Add Option</button>
				</div>
			</div>
		</div>`
	if(questionCardCount) {
		$(cardHTML).insertAfter($(".question-cards-flex-wrap .question-card").last())
	} else {
		$(".question-cards-flex-wrap").prepend(cardHTML)
	}

	$("#add-question-card-btn").removeClass("full-width")
	
	questionCardCount++
})

$(document).on("click", ".question-card .controls-wrap .delete-question.action-btn", function() {
	$(this).parents(".question-card").remove()
	questionCardCount--
	$(".question-card").each(function(i) {
		console.log($(this))
		$(this).attr("data-question-number", i+1)
		$(this).find(".question-number").text(`${i+1}.`)
	})
})

$(document).on("click", ".question-card .add-option-btn", function() {
	$(`<div class="option-wrap"><input type="text" placeholder="option (incorrect)"></div>`).insertAfter($(this).parent().find(".option-wrap").last())
})