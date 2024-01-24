"use strict";

function errorAlert(status, statusText) {
  const errorMessage = status + ": " + statusText;
  $("#errorAlert").show();
  $("#errorMessage").html(`<strong>Error:</strong> ${errorMessage}`);
}

function convert() {
  $.ajax({
    url: "/convert",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({ data: $("#inputText").val() }),
    dataType: "json",
    success: function (result) {
      $("#outputText").html(result.data);
    },
    error: function (xhr, status, error) {
      errorAlert(xhr.status, xhr.statusText);
    },
  });
}

function permalink() {
  $.ajax({
    url: "/permalink",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({ data: $("#inputText").val() }),
    dataType: "json",
    success: function (result) {
      if (result.data === "") {
        history.pushState(
          "",
          document.title,
          window.location.pathname + window.location.search
        );
        window.location.reload(true);
      } else {
        window.history.pushState(null, null, result.data);
      }
    },
    error: function (xhr, status, error) {
      errorAlert(xhr.status, xhr.statusText);
    },
  });
}

function decode(inputText) {
  $.ajax({
    url: "/decode",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({ data: inputText }),
    dataType: "json",
    success: function (result) {
      $(".source").html(result.data);
      convert();
    },
    error: function (xhr, status, error) {
      errorAlert(xhr.status, xhr.statusText);
    },
  });
}

$(document).ready(function () {
  // Restore content if opened by permalink
  if (location.hash && /^(#t1=)/.test(location.hash)) {
    console.log(location.hash.slice(4));
    decode(location.hash.slice(4));
  }

  $("#convertButton").click(function (e) {
    e.preventDefault();
    convert();
  });

  $("#permalink").click(function (e) {
    e.preventDefault();
    permalink();
  });

  $(".source-clear").on("click", function (event) {
    $(".source").val("");
    $("#outputText").html("");
    event.preventDefault();
  });

  $("#errorAlert .close").on("click", function () {
    console.log("close button");
    $("#errorAlert").hide();
  });
});
