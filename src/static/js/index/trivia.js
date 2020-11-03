const setTrivia = () => {
	$.get({
		url: "/api/getActiveQuestion",
		success: (data) => {
			if(data.type === "title") {
				$(".trivia-widget").addClass("show-title-screen")
			} else {
				$(".trivia-widget").removeClass("show-title-screen")
			}
			$(".trivia-widget").css("height", "300px")
			$(".trivia-widget .trivia-content-container").hide()
			if(data.type === "waiting") {
				$(".trivia-widget .waiting-container").show()
			} else if (data.type === "getScore") {
				$.get({
					url: "/api/getTriviaScore",
					success: (data) => {
						let score = data.score
						$(".trivia-widget .your-score-container .your-score").text(`${score}/4`)
						$(".trivia-widget .your-score-container").show()
					}
				})
				
			} else if (data.type === "question") {
				data = data.data
				console.log(data)
				if(data.stage === 1) {
					$(".trivia-widget").css("height", "fit-content")
					$(".trivia-widget .main-content .options-container").empty()
					$(".trivia-widget .main-content .question-number").text(`Question #${data.number}`)
					$(".trivia-widget .main-content .question").text(data.value)
					data.options.forEach((o) => {
						$(".trivia-widget .main-content .options-container").append(`
							<div class="option" data-option-id="${o.id}">
								<p class="value">${o.value}</p>
							</div>
						`)
					})
					$(".trivia-widget .main-content").show()
				} else {
					let correctAnswer;
					data.options.forEach((o) => {
						if(o.correct) correctAnswer = o.value
					})
					$(".correct-answer-container .correct-answer").text(correctAnswer)
					$(".trivia-widget .correct-answer-container").show()
				}
			}
		}
	})
}

$(document).on("click", ".trivia-widget .option", function() {
	
	let data = {
		optionId: $(this).attr("data-option-id")
	}
	
	$.post({
		url: "/api/submitAnswer",
		data:data
	})
	$(".trivia-widget .trivia-content-container").hide()
	$(".trivia-widget .waiting-container").show()
	$(".trivia-widget").css("height", "300px")
})

setTrivia()

socket.on("triviaNextStep", setTrivia)