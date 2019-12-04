/* eslint-disable prettier/prettier */
/**
 * App js
 * 2019/11/15
 */

 /**
  * Making toast
  */

const makeToast = function({title='Avenue', message=''}) {
    $('.toast .toast-body').html(message);
    $('.toast .toast-title').html(title);

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
    administrative_area_level_2: 'short_name',
    country: 'long_name',
    postal_code: 'short_name',
    postal_town: 'long_name',
    neighborhood: 'long_name'
};

const addressDetail = {
    street_number: '',
    route: '',
    administrative_area_level_1: '',
    administrative_area_level_2: '',
    country: '',
    postal_code: '',
    postal_town: '',
    neighborhood: '',
}

function initAutocomplete() {
    if (!$('#propertyAutocomplete')[0]) {
        return;
    }
    // Create the autocomplete object, restricting the search predictions to
    // geographical location types.
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('propertyAutocomplete'), {types: ['geocode'], componentRestrictions: {country: 'gb'}});
  
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
  
    // Get each component of the address from the place details,
    // and then fill-in the corresponding field on the form.
    for (var i = 0; i < place.address_components.length; i++) {
      var addressType = place.address_components[i].types[0];
      if (componentForm[addressType]) {
        var val = place.address_components[i][componentForm[addressType]];
        addressDetail[addressType] = val;
      }
    }

    $("#property_fulladdress").val($('#propertyAutocomplete').val());
    $('#propertyAutocomplete').val(`${addressDetail.street_number} ${addressDetail.route}`);

    // $('#property_street_number').val(addressDetail.street_number);
    // $('#property_route').val(addressDetail.route);
    $('#property_city').val(addressDetail.postal_town);
    // $('#property_neighborhood').val(addressDetail.neighborhood);
    $('#property_zip').val(addressDetail.postal_code);
    $('#property_county').val(addressDetail.administrative_area_level_1);
    $('#property_region').val(addressDetail.administrative_area_level_2);
    // $('#property_country').val(addressDetail.country);
}

// Map
const drawMap = function(options) {
    // const coordinates = [-74.50, 40];
    // const zoom = 9;
    mapboxgl.accessToken = 'pk.eyJ1IjoidG9wZGV2MDAzIiwiYSI6ImNqcHg1bmw4ODBpN2c0OW9kc2JjZW1zdWoifQ.50gYTaOTgxBYvtIi6eQVGA';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        zoom: options.zoom,
        center: options.center
    });
    map.on('load', function() {
        map.loadImage('/img/map/marker_small.png', function(error, image) {
            if (error) throw error;
            map.addImage('cat', image);
            options.markers.map( (marker, i) => {
                map.addLayer({
                    "id": "points" + i,
                    "type": "symbol",
                    "source": {
                        "type": "geojson",
                        "data": {
                            "type": "FeatureCollection",
                            "features": [{
                                "type": "Feature",
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [marker.lng, marker.lat]
                                }
                            }]
                        }
                    },
                    "layout": {
                        "icon-image": "cat",
                        "icon-size": 0.25
                    }
                });
            })
        });
    });
};

// Chart
 function chartInit(chart, data) {
    new Chart(chart, {
      type: 'doughnut',
      options: {
        responsive: true,
        legend: {
            position: 'bottom',
            display: true
        },
        animation: {
            animateScale: true,
            animateRotate: true
        }
      },
      data: data
    });
  }

const formatNumber = function(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
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


    // Update the general settings
    $('#settings-general-form').submit(async function(e){
        e.preventDefault();
        const data = {
            user:  {
                id: $('#user_id').val(),
                first_name: $('#first_name').val(),
                last_name: $('#last_name').val(),
            }
        }
        const token = $('meta[name="csrf"]').attr('content');
        fetch('/settings/update', {
            credentials: 'same-origin', // <-- includes cookies in the request
            headers: {
                'CSRF-Token': token, 
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(function(res) {
            makeToast({message: res.message});
        })
        .catch(error => {
            console.log(error);
        });
    });

    // update password
    $('#settings-password-form').submit(async function(e){
        e.preventDefault();
        if (($('#password1').val() || $('#password2').val()) && $('#password1').val() != $('#password2').val()) {
            $('#password1').addClass('is-invalid');
            $('#password2').addClass('is-invalid');
            return;
        }
        const data = {
            user:  {
                id: $('#user_id').val(),
                password: $('#password1').val(),
                old_password: $('#password').val()
            }
        }
        const token = $('meta[name="csrf"]').attr('content');
        fetch('/settings/password', {
            credentials: 'same-origin', // <-- includes cookies in the request
            headers: {
                'CSRF-Token': token, 
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(function(res) {
            makeToast({message: res.message});
            if (res.status == 422) {
                $('#password').addClass('is-invalid');
            } else if (res.status == 200) {
                $('input[type="password"]').removeClass('is-invalid').val('');
            }
        })
        .catch(error => {
            console.log(error);
        });
    });

    /**
     * Map
     */

    if ($('*[data-toggle="cmap"]')) {
        $('*[data-toggle="cmap"]').map(function(i, item){
            try {
                if ($(item).data('option').center) {
                    drawMap($(item).data('option'));
                }
            } catch (error) {
            }
        });
    }

    /**
     * Property
     */

    //  Create new property
    $('.property-unit').click(function(){
        $('.property-unit').find('.unit-check').addClass('d-c-none');
        $(this).find('.unit-check').removeClass('d-c-none');
        $('#property_units').val($(this).data('name'));
        if ($(this).hasClass('multi-unit')) {
            $('#property_units').prop('readonly', false);
            $('#property_units').attr('min', '2');
        } else {
            $('#property_units').prop('readonly', true);
            $('#property_units').attr('min', '1');
        }
    });

    // Adjust tenancey
    $('.edit-unit').click(function(e){
        e.preventDefault();
        const unit = $(this).data('unit');
        $('#unit_description').val(unit.description);
        $('#unit_start_date').val(unit.start_date);
        $('#unit_end_date').val(unit.end_date);
        $('#unit_rent_frequency').val(unit.rent_frequency);
        $('#unit_rent_frequency').trigger('change');
        $('#unit_rent_price').val(unit.rent_price);
        $('input[name="unit[id]"]').val(unit.id);
        if ($('.unit-item').length > 1) {
            $(".btn-unit-delete").removeClass('d-none');
        } 
        $('#addUnitBtn').text('Update');
        $('#modalAddNewUnit').modal()
        .on('hidden.bs.modal', function() {
            $(".btn-unit-delete").addClass('d-none');
            $('#addUnitBtn').text('Add');
        });
    })

    // Use property value from api in adjust summary popup
    $('#estimatePropertyBtn').click(function(e){
        const property = $(this).data('property');
        let missing_value = '';
        if (!property.zip) {
            missing_value += 'postal code, ';
        } 
        if (!property.type ) {
            missing_value += 'type, ';
        } 
        if (!property.construction_date) {
           missing_value += 'construction date, ';
        } 
        if (!property.square_feet) {
            missing_value += 'square feet, ';
        } 
        if (!property.bedrooms) {
            missing_value += 'bedrooms, ';
        } 
        if (!property.bathrooms) {
            missing_value += 'bathrooms, ';
        } 
        if (!property.finish_quality) {
            missing_value += 'finish quality, ';
        } 
        if (!property.outdoor_space) {
            missing_value += 'out spacing, ';
        } 
        if (!property.off_street_parking) {
            missing_value += 'off street parking, ';
        }
        missing_value = missing_value.substr(0, missing_value.length-2)
        $('#modalAdjustSummary').modal('hide');
        return makeToast({ message: `Please add ${missing_value}` });

        const self = $(this);
        self.find('span').removeClass('d-none');
        const _csrf = $('input[name="_csrf"]').val();
        fetch(new Request('/property/estimated_sale/', {method: 'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify({property_id:property.id, _csrf})}))
        .then(response => response.json())
        .then(function(res) {
            self.find('span').addClass('d-none');
            if (res.status == 200) {
                $('#property_current_value').val(res.estimate);
            } 

            return makeToast({ message: res.message});
        }).catch(function(text) {
            self.find('span').addClass('d-none');
            console.log(text);
        });
    });

    // Delete the unit
    $(".btn-unit-delete").click(function(e){
        e.preventDefault();
        if ($('.unit-item').length == 1) {
            return makeToast({message: 'Each property has at least one unit.'});
        }
        const _csrf = $('input[name="_csrf"]').val();
        const property_id = $('input[name="property[id]"]').val();
        const unit_id = $('input[name="unit[id]"]').val();
        fetch(new Request('/property/unit/delete', {method: 'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify({unit_id, property_id, _csrf})}))
        .then(function() {
            location.reload();
        }).catch(function(text) {
            console.log(text);
        });
          
    });

    /**
    * Donught chart on dashboard
    */

      //
      // Events
      //

      var randomScalingFactor = function() {
            return Math.round(Math.random() * 100);
        };
      
      if ($('#marketChart')[0]) {
        const labels = $('#marketChart').data('option').labels;
        const dataset = $('#marketChart').data('option').dataset;
        const data = {
            labels: labels,
            datasets: [{
              data: dataset,
              backgroundColor: [
                '#4dc9f6',
                '#f67019',
                '#f53794',
                '#537bc4',
                '#acc236'
              ]
            }]
          }
        chartInit(document.getElementById('marketChart').getContext('2d'), data);
      }

    if ($('#incomeChart')[0]) {
        const labels = $('#incomeChart').data('option').labels;
        const dataset = $('#incomeChart').data('option').dataset;
        const data = {
            labels: labels,
            datasets: [{
              data: dataset,
              backgroundColor: [
                '#4dc9f6',
                '#f67019',
                '#f53794',
                '#537bc4',
                '#acc236'
              ]
            }]
          }
        chartInit($('#incomeChart')[0], data);
    }
});