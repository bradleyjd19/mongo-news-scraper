$(document).on("click", "#hamburger", function (event) {
  event.preventDefault();
  $(".navbar-menu").toggleClass("is-active");
});

$(document).on("click", "#saveArticle", function (event) {
  event.preventDefault();
  let thisId = $(this).attr("data-id");
});

$(document).on("click", "#scrapeButton", function (event) {
  event.preventDefault();
  $.ajax({
    url: "/scrape",
    method: "GET"
  })
    .then(function (data) {
      console.log(data);
      location.reload();
    });
});