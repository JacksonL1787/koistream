
$(window).ready(function(){
	callStreamServerState()
	setInterval(function(){
		callStreamServerState()	
	}, 5000)
})

function changeStreamServerState(state) {
	$.post({
		url: "/api/changeStreamServer",
		data: {state},
		success: (data) => {
			log(data)
			$('.state p').text(data.payload.serverState)
		},
		error: (data) => {
			log(data)
		}
	});
}

function callStreamServerInputs() {
	$.post({
		url: "/api/getStreamServerInputs",
		success: (data) => {
			log(data)
			$('.in1').text("Input 1: " + data.payload[0].Url)
			$('.in2').text("Input 2: " + data.payload[1].Url)
		},
		error: (data) => {
			log(data)
		}
	})
}

function callStreamServerState() {
	$.post({
		url: "/api/getStreamServerState",
		success: (data) => {
			log(data)
			$('.state p').text(data.payload.ServerState)
		},
		error: (data) => {
			log(data)
		}
	})
}