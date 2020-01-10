/* eslint-disable prettier/prettier */
/**
 * App js
 * 2019/11/15
 */

const PROPERTY_TYPE = {
    detached_house: 'Detached House',
    'semi-detached_house': 'Semi Detached House',
    terraced_house: 'Terraced House',
    flat: 'Flat'
};

const toComma = function(val) {
    if (val) {
        return val.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    } else {
        return "0";
    }
};

/**
 * Confirm Dialog
 */

function confirmDialog(message, handler){
  $(`<div class="modal fade" id="modalConfirm" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-dialog modal-sm modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-card card">
        <div class="card-header">
          <div class="row align-items-center">
            <div class="col">

              <!-- Title -->
              <h4 class="card-header-title">
                Warning
              </h4>
          
            </div>
            <div class="col-auto">

              <!-- Close -->
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
          
            </div>
          </div> <!-- / .row -->
        </div>
        </div class="card-header">
        <div class="card-body">
          <p>
            ${message}
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-no">Cancel</button>
          <button type="button" class="btn btn-danger btn-yes delete-document">Ok</button>
        </div>
      </div>
    </div>
  </div>
</div>`).appendTo('body');
 
  //Trigger the modal
  $("#modalConfirm").modal({
     backdrop: 'static',
     keyboard: false
  });
  
   //Pass true to a callback function
   $(".btn-yes").click(function () {
       handler(true);
       $("#modalConfirm").modal("hide");
   });
    
   //Pass false to callback function
   $(".btn-no").click(function () {
       handler(false);
       $("#modalConfirm").modal("hide");
   });

   //Remove the modal once it is closed.
   $("#modalConfirm").on('hidden.bs.modal', function () {
      $("#modalConfirm").remove();
   });
}

 /**
  * Making toast
  */

const makeToast = function({title='Avenue', message='', showLogo=true}) {
    $('.toast .toast-body').html(message);
    $('.toast .toast-title').html(title);
    if (!showLogo) {
        $('.alert-logo').addClass('d-none');
    } else {
        $('.alert-logo').removeClass('d-none');
    }

    return $('.toast').toast({delay: 3000}).toast('show').removeClass('d-none').on('hidden.bs.toast', function(){
        $('.toast').addClass('d-none');
    });
}

const isNumberKey = function(evt){
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
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
 function chartInit(chart, data, percentage=false) {
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
            },
            tooltips: {
                callbacks: {
            // this callback is used to create the tooltip label
                    label: function(tooltipItem, data) {
                      // get the data label and data value to display
                      // convert the data value to local string so it uses a comma seperated number
                      var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString();
                      // return the text to display on the tooltip
                      if (percentage) {
                        value += '%';
                      }
                      return value;
                    }
                  }
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
                makeToast({message: res.message, showLogo: false, title: `Welcome back ${res.user.username}`}).on('hidden.bs.toast', function () {
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

    // generate full address
    $('#createPropertyBtn').click(function(e){
        $('#property_fulladdress').val(`${$('#propertyAutocomplete').val()}, ${$('#property_city').val()}, UK`);
    });

    $('#updatePropertyBtn').click(function(e){
        $('#property_fulladdress').val(`${$('#propertyAutocomplete').val()}, ${$('#property_city').val()}, UK`);
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
        $('#unit_deposit').val(unit.unit_deposit);
        $('input[name="unit[id]"]').val(unit.id);
        if ($('.unit-item').length > 1) {
            $(".action-unit").removeClass('d-none').removeClass('btn-unit-clear').addClass('btn-unit-delete').text('Delete this unit');
        } 
        if ($('.unit-item').length == 1) {
            $(".action-unit").removeClass('d-none').removeClass('btn-unit-delete').addClass('btn-unit-clear').text('Clear this unit');
        }
        $('#addUnitBtn').text('Update');
        $('#unit-modal-title').text('Edit Unit');
        $('#modalAddNewUnit').modal()
        .on('hidden.bs.modal', function() {
            $(".btn-unit-delete").addClass('d-none');
            $('#addUnitBtn').text('Add');
            $('#unit-modal-title').text('Create a New Unit');
        });
    });

    $('.del-unit').click(function(e){
        e.preventDefault();
        const unit = $(this).data('unit');
        Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.value) {
            const _csrf = $('input[name="_csrf"]').val();
            fetch(new Request('/property/unit/del', {method: 'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify({id:unit.id, _csrf})}))
                .then(response => response.json())
                .then(function(res) {
                    self.find('span').addClass('d-none');
                    if (res.status == 200) {
                        Swal.fire(
                          'Deleted!',
                          'One tenancy has been deleted.',
                          'success'
                        )
                    } 

                    return makeToast({ message: res.message});
                }).catch(function(text) {
                    self.find('span').addClass('d-none');
                    console.log(text);
                });
          }
        })
    })

    // Use property value from api in adjust summary popup
    $('#estimatePropertyBtn').click(function(e){
        const property = $(this).data('property');
        let missing_value = '';
        let ids = []
        if (!property.zip) {
            missing_value += 'postal code, ';
            ids.push('#property_zip');
        } 
        if (!property.type ) {
            missing_value += 'type, ';
            ids.push('#property_type');
        } 
        if (!property.construction_date) {
           missing_value += 'construction date, ';
           ids.push('#construction_date');
        } 
        if (!property.square_feet) {
            missing_value += 'square feet, ';
            ids.push('#square_feet');
        } 
        if (!property.bedrooms) {
            missing_value += 'bedrooms, ';
            ids.push('#bedrooms');
        } 
        if (!property.bathrooms) {
            missing_value += 'bathrooms, ';
            ids.push('#bathrooms');
        } 
        if (!property.finish_quality) {
            missing_value += 'finish quality, ';
            ids.push('#finish_quality');
        } 
        if (property.outdoor_space && property.outdoor_space == 'none') {
            missing_value += 'out spacing, ';
            ids.push('#outdoor_space');
        } 
        if (!property.off_street_parking) {
            missing_value += 'off street parking, ';
            ids.push('#off_street_parking');
        }
        localStorage.setItem('est_missing_ids', JSON.stringify(ids));
        missing_value = missing_value.substr(0, missing_value.length-2)
        if (missing_value) {
            $('#modalAdjustSummary').modal('hide');
            makeToast({ message: `Complete missing property details to get valuation estimate` });
            location.href = `/property/detail/${property.id}`;
            return;
        }

        const self = $(this);
        self.find('span').removeClass('d-none');
        const _csrf = $('input[name="_csrf"]').val();
        fetch(new Request('/property/estimated_sale/', {method: 'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify({property_id:property.id, _csrf})}))
        .then(response => response.json())
        .then(function(res) {
            self.find('span').addClass('d-none');
            if (res.status == 200) {
                $('#property_current_value').val(res.estimate.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'));
            } 

            return makeToast({ message: res.message});
        }).catch(function(text) {
            self.find('span').addClass('d-none');
            console.log(text);
        });
    });

    // Delete the unit
    $(".action-unit").click(function(e){
        e.preventDefault();
        const _csrf = $('input[name="_csrf"]').val();
        const property_id = $('input[name="property[id]"]').val();
        const unit_id = $('input[name="unit[id]"]').val();
        if ($(this).hasClass('btn-unit-delete')) {
            if ($('.unit-item').length == 1) {
                return makeToast({message: 'Each property has at least one unit.'});
            }
            fetch(new Request('/property/unit/delete', {method: 'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify({unit_id, property_id, _csrf})}))
            .then(function() {
                location.reload();
            }).catch(function(text) {
                console.log(text);
            });
        } else {
            fetch(new Request('/property/unit/clear', {method: 'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify({unit_id, property_id, _csrf})}))
            .then(function() {
                location.reload();
            }).catch(function(text) {
                console.log(text);
            });
        }
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

    if ($('#tenancyChart')[0]) {
        const labels = $('#tenancyChart').data('labels');
        const dataset = $('#tenancyChart').data('dataset');
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
        chartInit(document.getElementById('tenancyChart').getContext('2d'), data, true);
      }

    // thousands separator on input
    $('input.number').keyup(function(event) {
      // skip for arrow keys
      if(event.which >= 37 && event.which <= 40) return;

      // format number
      $(this).val(function(index, value) {
        return value
        .replace(/\D/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        ;
      });
    });

    $('body').click(function(e){
        $('#property-search-list').removeClass('show');
    })

    $('#property-search').keyup(function(e){
        e.preventDefault()
        if (e.keyCode == 13 || e.which == 13) {
            fetch('/property/search/' + $(this).val(), {method: 'GET'})
            .then(res => res.json())
            .then(res => {
                $('#property-search-list .card-body .list-group').html('');
                res.properties.map(property => {
                    $('#property-search-list .card-body .list-group').append(`<a href="/property/overview/${property.id}" class="list-group-item px-0">
                        <div class="row align-items-center">
                          <div class="col-auto">
                            
                            <!-- Avatar -->
                            <div class="avatar avatar-4by3">
                              <img src="/img/avatars/projects/project-1.jpg" alt="..." class="avatar-img rounded">
                            </div>

                          </div>
                          <div class="col ml-n2">

                            <!-- Title -->
                            <h4 class="text-body mb-1 name">
                              ${property.address}, ${property.city}
                            </h4>

                            <!-- Time -->
                            <p class="small text-muted mb-0">
                              <time datetime="2018-05-24">${PROPERTY_TYPE[property.type]}</time>
                            </p>
                            
                          </div>
                        </div> <!-- / .row -->
                      </a>`)
                });
                if (res.properties) {
                    $('#property-search-list').addClass('show');
                } else {
                    $('#property-search-list').removeClass('show');
                }
            })
            .catch(err => {
                console.log(err);
            })
        }
    });

    /*
    *   Documents
    */

    $('#uploadDocumentBtn').click(function(e) {
      if ($('#document_id').val().length == 0) {
        return makeToast({message: "Please upload a document"});
      }

      e.preventDefault();
      $('#modalUpload').modal('hide');
      const data = {
        document:  {
          id: $('#document_id').val(),
          property_id: $('#document_property').val(),
          property_name: $('#document_property option:selected').text(),
          unit_id: $('#document_unit').val(),
          unit_name: $('#document_unit option:selected').text(),
          tag: $('#document_tag').val(),
          status: $('#status').val(),
          size: $('#document_size').val(),
          path: $('#document_path').val(),
          mimetype: $('#document_mimetype').val(),
          filename: $('#document_filename').val(),
        }
      }
      const token = $('meta[name="csrf"]').attr('content');
      fetch('/property/documents/upload_all', {
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
          } else if (res.status == 200) {
            location.reload();
          }
      })
      .catch(error => {
          console.log(error);
      });
    })

    // Overview

});