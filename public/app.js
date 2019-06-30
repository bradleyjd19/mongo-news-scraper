$(document).on("click", "#hamburger", function(event) {
  event.preventDefault();
  $(".navbar-menu").toggleClass("is-active");
})

$.getJSON("/articles", (data) =>{
  for (let i = 0; i < data.length; i++) {
    $("#").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
  }
});

$(document).on("click", "p", () => {
  $("#").empty();
  let thisId = $(this).attr("data-id");

  $.ajax({
    method: "GET",
    url: "/articles" + thisId
  })
    .then((data) => {
      console.log(data);
      $("#").append("<h2>" + data.title + "</h2>");
      $("#").append("<input id='titleinput' name='title' >");
      $("#").append("<textarea id='bodyinput' name='body'></textarea>");
      $("#").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      if (data.note) {
        $("#").val(data.note.title);
        $("#").val(data.note.body);
      }
    });
});

$(document).on("click", "#", () => {
  let thisId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "/articles" + thisId,
    data: {
      title: $("#").val(),
      body: $("#").val()
    }
  })
    .then((data) => {
      console.log(data);
      $("#").empty();
    });

  $("#").val("");
  $("#").val("");
})