/* eslint-disable prettier/prettier */
/**
 * App js
 * 2019/11/15
 */

 /**
  * Making toast
  */

const makeToast = function({title='Avenue', message=''}) {
    $('body').prepend(`<div aria-live="polite" aria-atomic="true" style="position: relative; min-height: 200px;">
    <div style="position: absolute; top: 2rem; right: 1rem;">
  
      <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <img src="/img/logo.svg" style="width: 20px; height: auto;" class="rounded mr-2" alt="logo">
          <strong class="mr-auto">${title}</strong>
          <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    </div>
  </div>`);

  return $('.toast').toast({delay: 3000}).toast('show');
}

const logout = function() {
    const token = $('meta[name="csrf"]').attr('content');
    fetch('/logout', {
        credentials: 'same-origin', // <-- includes cookies in the request
        headers: {
          'CSRF-Token': token, // <-- is the csrf token as a header
          'Content-Type': 'application/json'
        },
        method: 'POST'
    })
    .then(function(res) {
        if (res.status == 200) {
            window.location.href = '/signin';
        }
    })
    .catch(error => {
        console.log(error);
    });
}

// Google Auto complete for Place 
let placeSearch, autocomplete;
const componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    postal_code: 'short_name'
};

const initAutocomplete = function() {
    // Create the autocomplete object, restricting the search predictions to
    // geographical location types.
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('propertyAutocomplete'), {types: ['address'], componentRestrictions: {country: 'us'}});
  
    // Avoid paying for data that you don't need by restricting the set of
    // place fields that are returned to just the address components.
    autocomplete.setFields(['address_component']);
  
    // When the user selects an address from the drop-down, populate the
    // address fields in the form.
    autocomplete.addListener('place_changed', getAddress);
}

const getAddress = function() {
    // Get the place details from the autocomplete object.
    var place = autocomplete.getPlace();
  
    for (var component in componentForm) {
      document.getElementById(component).value = '';
      document.getElementById(component).disabled = false;
    }
  
    // Get each component of the address from the place details,
    // and then fill-in the corresponding field on the form.
    for (var i = 0; i < place.address_components.length; i++) {
      var addressType = place.address_components[i].types[0];
      if (componentForm[addressType]) {
        var val = place.address_components[i][componentForm[addressType]];
        document.getElementById(addressType).value = val;
      }
    }
}

$(function() {
    /**
     * User Authentication
     */

    $('#signin-form').submit(async function(e){
        e.preventDefault();
        let data = {
            email: $('#email').val(),
            password: $('#password').val()
        };
        const token = $('meta[name="csrf"]').attr('content');
        fetch('/signin', {
            credentials: 'same-origin', // <-- includes cookies in the request
            headers: {
              'CSRF-Token': token, // <-- is the csrf token as a header
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                user: data
            })
        })
        .then(response => response.json())
        .then(function(res) {
            if (res.status == 200) {
                makeToast({message: res.message}).on('hidden.bs.toast', function () {
                    window.location.href = '/';
                });
            } else if (res.status == 422 || res.status == 400){
                $('.signin.alert').removeClass('d-none');
                const message = Object.values(res.errors).join('<br>');
                $('.signin .message').text(message);
            }
            console.log(res);
        })
        .catch(error => {
            console.log(error);
        });
    });

    $('#signup-form').submit(async function(e){
        e.preventDefault();
        let data = {
            first_name: $('#first_name').val(),
            last_name: $('#last_name').val(),
            email: $('#email').val(),
            password: $('#password').val()
        };
        const token = $('meta[name="csrf"]').attr('content');
        fetch('/signup', {
            credentials: 'same-origin', // <-- includes cookies in the request
            headers: {
              'CSRF-Token': token, // <-- is the csrf token as a header
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                user: data
            })
        })
        .then(response => response.json())
        .then(function(res) {
            if (res.status == 200) {
                makeToast({message: res.message}).on('hidden.bs.toast', function () {
                    window.location.href = '/';
                });
            } else if (res.status == 422){
                $('.signup.alert').removeClass('d-none');
                const message = Object.values(res.errors).join('<br>');
                $('.signup .message').text(message);
            }
            console.log(res);
        })
        .catch(error => {
            console.log(error);
        });
    });

    $('#password-reset-form').submit(async function(e){
        e.preventDefault();
        let data = {
            email: $('#email').val()
        };
        const token = $('meta[name="csrf"]').attr('content');
        fetch('/password_reset_generate', {
            credentials: 'same-origin', // <-- includes cookies in the request
            headers: {
              'CSRF-Token': token, // <-- is the csrf token as a header
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(function(res) {
            if (res.status == 200) {
                makeToast({message: res.message}).on('hidden.bs.toast', function () {
                    window.location.href = '/signin';
                });
            } else if (res.status == 422 || res.status == 400){
                $('.signin.alert').removeClass('d-none');
                const message = Object.values(res.errors).join('<br>');
                $('.signin .message').text(message);
            }
            console.log(res);
        })
        .catch(error => {
            console.log(error);
        });
    });

    $('#password-recovery-form').submit(async function(e){
        e.preventDefault();
        let data = {
            password: $('#password').val()
        };
        const token = $('meta[name="csrf"]').attr('content');
        fetch('/password_reset_post', {
            credentials: 'same-origin', // <-- includes cookies in the request
            headers: {
              'CSRF-Token': token, // <-- is the csrf token as a header
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(function(res) {
            if (res.status == 200) {
                makeToast({message: res.message}).on('hidden.bs.toast', function () {
                    window.location.href = '/signin';
                });
            } else if (res.status == 422 || res.status == 400){
                $('.signin.alert').removeClass('d-none');
                const message = Object.values(res.errors).join('<br>');
                $('.signin .message').text(message);
            }
            console.log(res);
        })
        .catch(error => {
            console.log(error);
        });
    });

    /**
     * Map
     */
    const drawMap = function() {
        const coordinates = [-74.50, 40];
        const zoom = 9;
        mapboxgl.accessToken = 'pk.eyJ1IjoidG9wZGV2MDAzIiwiYSI6ImNqcHg1bmw4ODBpN2c0OW9kc2JjZW1zdWoifQ.50gYTaOTgxBYvtIi6eQVGA';
    
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            zoom: zoom,
            center: coordinates
        });
        map.on('load', function() {
            map.loadImage('/img/map/marker_small.png', function(error, image) {
                if (error) throw error;
                map.addImage('cat', image);
                map.addLayer({
                    "id": "points",
                    "type": "symbol",
                    "source": {
                        "type": "geojson",
                        "data": {
                            "type": "FeatureCollection",
                            "features": [{
                                "type": "Feature",
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": coordinates
                                }
                            }]
                        }
                    },
                    "layout": {
                        "icon-image": "cat",
                        "icon-size": 0.25
                    }
                });
            });
        });
    };

    if ($('#map')[0]) {
        drawMap();
    }
});