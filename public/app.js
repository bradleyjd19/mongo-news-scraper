$(document).on("click", "#hamburger", function(event) {
  event.preventDefault();
  $(".navbar-menu").toggleClass("is-active");
});

$(document).on("click", "#saveArticle", function(event) {
  event.preventDefault();
  let thisId = $(this).attr("data-id");  
});

