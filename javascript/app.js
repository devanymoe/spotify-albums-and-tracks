// Self envoking function! once the document is ready, bootstrap our application.
// We do this to make sure that all the HTML is rendered before we do things
// like attach event listeners and any dom manipulation.
(function() {
  $(document).ready(function() {
    bootstrapSpotifySearch();
  })
})();

/**
  This function bootstraps the spotify request functionality.
*/
function bootstrapSpotifySearch() {

  var userInput, searchUrl, results;
  var outputArea = $("#q-results");

  $('#spotify-q-button').on("click", function() {
    var spotifyQueryRequest;
    spotifyQueryString = $('#spotify-q').val();
    searchUrl = "https://api.spotify.com/v1/search?type=artist&q=" + spotifyQueryString;

    // Generate the request object
    spotifyQueryRequest = $.ajax({
      type: "GET",
      dataType: 'json',
      url: searchUrl
    });

    // Attach the callback for success
    // (We could have used the success callback directly)
    spotifyQueryRequest.done(function(data) {
      var artists = data.artists;
      // Clear the output area
      outputArea.html('');

      // The spotify API sends back an arrat 'items'
      // Which contains the first 20 matching elements.
      // In our case they are artists.
      artists.items.forEach(function(artist) {
        var artistLi = $("<li>" + artist.name + " - " + artist.id + "</li>")
        artistLi.attr('data-spotify-id', artist.id);
        outputArea.append(artistLi);

        artistLi.click(displayAlbumsAndTracks);
      })
    });

    // Attach the callback for failure
    // (Again, we could have used the error callback direcetly)
    spotifyQueryRequest.fail(function(error) {
      console.log("Something Failed During Spotify Q Request:");
      console.log(error);
    });
  });
}

/* COMPLETE THIS FUNCTION! */
function displayAlbumsAndTracks(event) {
  var appendToMe = $('#albums-and-tracks');
  var artistId = $(event.target).attr('data-spotify-id');
  var artistAlbumsURL = 'https://api.spotify.com/v1/artists/' + artistId + '/albums?album_type=album';
  var albums = [];
  var albumIds = [];
  var $albumsAndTracks = $('#albums-and-tracks');
  var count = 0;

  appendToMe.empty();

  var renderAlbums = function() {
    for (var i = 0; i < albums.length; i++) {
      var $thisAlbum = $('<div class="albumInfo"><img class="albumArt"><h4 class="albumTitle"></h4><p class="date"></p><p class="popularity"></p></div>');
      var $trackList = $('<div class="tracks"><ol></ol></div>');
      var $albumArt = $thisAlbum.find('.albumArt');
      var $albumTitle = $thisAlbum.find('.albumTitle');
      var $albumDate = $thisAlbum.find('.date');
      var $popularity = $thisAlbum.find('.popularity');

      $albumArt.attr('src', albums[i][1]);
      $albumTitle.text(albums[i][0]);
      $albumDate.text('Release Date: ' + albums[i][2]);
      $popularity.text('Popularity: ' + albums[i][3]);
      for (var x = 0; x < albums[i][4].items.length; x++) {
        var $track = $('<li></li>');

        $track.text(albums[i][4].items[x].name);
        $trackList.find('ol').append($track);
      }
      $albumsAndTracks.append($thisAlbum);
      $albumsAndTracks.append($trackList);
    }
  };

  var getAlbumDeets = function(i) {
    return function(data) {
      albums[i].push(data.release_date);
      albums[i].push(data.popularity);
      albums[i].push(data.tracks);
      count += 1;
      if (count === albums.length) {
        renderAlbums();
      }
    };
  };

  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: artistAlbumsURL
  }).then(function(artistAlbums) {
    for (var i = 0; i < artistAlbums.items.length; i++) {
      var thisAlbum = [];

      thisAlbum.push(artistAlbums.items[i].name);
      thisAlbum.push(artistAlbums.items[i].images[0].url);
      albumIds.push(artistAlbums.items[i].id);
      albums.push(thisAlbum);
    }
  }).then(function() {
    for (var i = 0; i < albumIds.length; i++) {
      var albumURL = 'https://api.spotify.com/v1/albums/' + albumIds[i];

      $.ajax({
        type: 'GET',
        dataType: 'json',
        url: albumURL
      }).then(getAlbumDeets(i));
    }
  });
}

/* YOU MAY WANT TO CREATE HELPER FUNCTIONS OF YOUR OWN */
/* THEN CALL THEM OR REFERENCE THEM FROM displayAlbumsAndTracks */
/* THATS PERFECTLY FINE, CREATE AS MANY AS YOU'D LIKE */
