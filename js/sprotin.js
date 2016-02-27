function getInput() {
  return $("#textTranslate").val();
}

function setInput(value) {
  $("#textTranslate").val(value);
}

function clearInput() {
  setInput("");
  $("#textTranslate").focus();
  $("#results").html("");
}

function setDictionaryId(value) {
  $(document.body).data('language', value);
}

function getDictionaryId() {
  var id = $(document.body).data('language');
  if(id && typeof id === 'number') {
    return id;
  }
  return 1;
}

var currentElement = null;

$(function(){

  clearInput();

  currentElement = $("#first");

  $("#select-language div").click(function(e) {
    e.preventDefault();
    currentElement = $(this);
    translate();
  });

  $("#textTranslate").keydown(function(e) {
    if(e.keyCode === 13) {
      e.preventDefault();
      translate();
    }
  });
  $("#translate")
    .click(function() {
      translate();
    });
  $("#translate img")
    .mouseover(function() {
      $(this)
        .attr('src', '../../images/search.png')
        .css('cursor', 'pointer');
    })
    .mouseout(function() {
      $(this)
        .attr('src', '../../images/search_inverse.png');
    });

  $("#clear-input").click(function() {
    clearInput();
  });

  $("#clear-input img")
    .mouseover(function() {
      $(this)
        .attr('src', '../../images/clear.png')
        .css('cursor', 'pointer');
    })
    .mouseout(function() {
      $(this)
        .attr('src', '../../images/clear_inverse.png');
    });
});

function translate() {
    $('.lang-box').removeClass('arrow-down');
    // console.log(currentElement);
    currentElement.find('.lang-box').addClass('arrow-down');
    var id = currentElement.find("a").data('lang-id');
    setDictionaryId(id);
    $("#select-language").find('.infoi').text("");
    translate2(function(data) {
      if(data && data['total']) {
        var resultCount = data['total'];
        if(!isNaN(resultCount)) {
          currentElement.find('.infoi').text(resultCount);
        }
      }
      else {
        currentElement.find('.infoi').text("0");
      }
    }, function(error) {
      // self.find('.infoi').text("0");
    });
}

function translate2(successCallback, errorCallback) {
  performTranslation(getInput(), successCallback, errorCallback);
};

function performTranslation(searchFor, successCallback, errorCallback) {
  //http://sprotin.fo/dictionary_search_json.php?DictionaryId=1&DictionaryPage=1&SearchFor=hey&SearchDescription=0&SkipOtherDictionariesResults=0&SkipSimilarWords=0
  //http://sprotin.fo/dictionary_search_json.php?DictionaryId=1&DictionaryPage=1&SearchFor=hey&SearchDescription=0&SkipOtherDictionariesResults=0&SkipSimilarWords=0&SearchIn=searchword&SearchMatches=partial&SearchCase=insensitive
  var url = "http://sprotin.azurewebsites.net/index.php";
  var data = {
    'DictionaryId' : getDictionaryId(),
    'DictionaryPage': 1,
    'SearchFor': searchFor,
    'SearchDescription': 0,
    'SkipOtherDictionariesResults' : 0,
    'SkipSimilarWords' : 0,
    'SearchIn' : 'searchword',
    'SearchMatches' : 'partial',
    'SearchCase' : 'insensitive'
  };

  jQuery.support.cors = true;
  $.ajax({
      url: url,
      data: data,
      type: "GET",
      timeout: 30000,
      dataType: "json",
      success: function(data) {
        // console.log(data);
        if(successCallback) {
          successCallback(data);
        }
        $("#results").html("");
        if(data.words.length == 0) {
          $(".infoi").html("");
          $("#results").html("Ongin úrslit!");
        }
        $.each(data.words, function(i,word) {
          var displayWord = word.DisplayWord;
          i++;
          $("#results").append("<span class='item'><span class='item-number'>" + i + ".</span> <a href='#' data-word='" + displayWord + "' class='get-info'>" + displayWord + "</a></strong>: " + word.Explanation + "</span><div class='clear item-spacer'></div>");
        });
        $(".get-info").off().on("click", function(e) {
          e.preventDefault();
          //console.log($(this).html());
          var displayWord = $(this).data('word');
          setInput(displayWord);
          translate(displayWord);
        });
      },
      error: function(jqXHR, textStatus, ex) {
        if(errorCallback) {
          errorCallback();
        }
        console.log("error: " + textStatus + "," + ex + "," + jqXHR.responseText);
      }
  });
}