
(function() {
    // recollim els parametres de la url
    function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while ( e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    var userProfileSource = document.getElementById('user-profile-template').innerHTML,
        userProfileTemplate = Handlebars.compile(userProfileSource),
        userProfilePlaceholder = document.getElementById('user-profile');

    var oauthSource = document.getElementById('oauth-template').innerHTML,
        oauthTemplate = Handlebars.compile(oauthSource),
        oauthPlaceholder = document.getElementById('oauth');

    var params = getHashParams();

    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    //comprovem si hi ha algun error
    if (error) {
        alert('There was an error during the authentication');
    } else {
        //si no hi ha cap error i existeix access_token procedim amb la primera crida
        if (access_token) {
            //fem la crida que recull la informació del usuari
            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function(response) {
                    //si la petició funciona guardem la info de l'usuari a la plantilla que ens ve donada
                    userProfilePlaceholder.innerHTML = userProfileTemplate(response);
                    $('#login').hide();
                    $('#loggedin').show();
                }
            });
        } else {
            // netegem la pantalla
            $('#login').show();
            $('#loggedin').hide();
        }
        /* en cas necessari, aquesta es la crida que recull el refresh_token. En aquest exercici no la utilitzarem ja que hem amagat el botó de la vista que executa la petició     */
        document.getElementById('obtain-new-token').addEventListener('click', function() {
            $.ajax({
                url: '/refresh_token',
                data: {
                    'refresh_token': refresh_token
                }
            }).done(function(data) {
                access_token = data.access_token;
                oauthPlaceholder.innerHTML = oauthTemplate({
                    access_token: access_token,
                    refresh_token: refresh_token
                });
            });
        }, false);
        //botó de netejar els resultats
        $("#clear_results").click(function(){
            $('#top_tracks').empty();
            $('#artists').empty();
        });
        //recollim el valor de #name i fem la petició quan l'usuari fa click a button
        /*  curl -X "GET" "https://api.spotify.com/v1/search?q=queen&type=artist&market=ES" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer BQDg19qFTkh9p8DQW3GYodNJoPuU0Zv1tPZuFua1ZyVnzl6N3NsYAWWPNBHdbHzTVFGkmQKOqLbyEDJgGxhixR0zLSYhKYpYF4rnvBORZO0uCPwx0s9fM_JzoEpqtnR1K3mDi4w8iYT_zUYVQVuwGLB_p0zdXH8"
         */
        document.getElementById('button').addEventListener('click', function() {
            //netegem tots els resultats cada cop que fem una nova crida
            $('#artists').empty();
            $('#top_tracks').empty();
            //recollim el valor del input
            var artistName = $("#name").val();
            // comprovem si hi ha espais
            if ($("#name").val().indexOf(" ") != -1){
                var replaceSpace = $.trim($("#name").val());
                artistName = replaceSpace.replace(/ /g, "%20");
            }
            if (access_token) {
                //crida ajax a /search amb access_token
                $.ajax({
                    url: 'https://api.spotify.com/v1/search?q=' + artistName + '&type=artist',
                    market: 'ES',
                    headers: {
                        'Authorization': 'Bearer ' + access_token
                    },
                    success: function(response) {
                        console.log(response);
                        //recorrem la resposta la resposta per poder mostrar-la per pantalla
                        var artistsArray= response.artists.items;
                        var $id;
                        $.each(artistsArray, function(key, value){
                            $id = artistsArray[key].id;
                            var $name = artistsArray[key].name;
                            var $nameDiv = $("<div class ='name'/>");
                            var $button = $("<button class='button' id=" + $id + "/>");
                            var $object = $("<div class='object'/>");
                            $nameDiv.append($name);
                            $button.append($nameDiv);
                            $object.append($button);
                            $("#artists").append($object);
                        });







                        
                        $('.button').click(function(){

                            //segona crida ajax a /top-tracks amb access_token


                            /*curl -X "GET" "https://api.spotify.com/v1/artists/0LcJLqbBmaGUft1e9Mm8HV/top-tracks?country=ES" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer BQDM__ysnOUlkuwsZlPNhEJJGXodHxPRya61n2xsxCbD73d7952f1srpMJ6j0Iqn-WPHqr4DZpctCMTCZO80XeaPU7IOLZ2nVtnUC_XqS32s6eyjKW0B-hwfpN7BwE9s60SyIGlsCwZVJ6X2RtUbwIUC-1DgcUU"*/


                            $.ajax({

                                url: 'https://api.spotify.com/v1/artists/'+ this.id +'/top-tracks?country=ES',
                                type:"GET",
                                headers: {
                                    'Authorization': 'Bearer ' + access_token,
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json'
                                },


                                success:function(result){

                                    console.log(result);

                                    $.each(result.tracks, function(key, value){

                                        var $top_track = value.name;
                                        var $link = $('<a/>').addClass("link").attr("href",value.uri);
                                        var $new_button = $("<button class='new_button'/>");
                                        var $new_object = $("<div class='new_object'/>");

                                        $new_button.append($top_track);
                                        $link.append($new_button);
                                        $new_object.append($link);
                                        $("#top_tracks").append($new_object);

                                    });            

                                },

                                error:function(error){
                                    console.log(error)


                                }
                            });
                        });

                    }

                });

            } else{
                alert('There was an error during the authentication');
            }
        });
    }
})();
