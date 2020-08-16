
$(window).ready(function(){
	handlePullErrors()
})

const handlePullErrors = () => {
	$.post({
		url: "/admin/api/getErrors",
		success: (data) => {
			log(data)
		}
	})
}