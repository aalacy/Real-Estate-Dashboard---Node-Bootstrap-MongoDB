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

const toLoadingBtn = function(el) {
  $(el).attr('disabled', true);
  $(el).find('span.loading').removeClass('d-none');
}

const toNormalBtn = function(el) {
  $(el).attr('disabled', false);
  $(el).find('span.loading').addClass('d-none');
}

const addTenant = function(tenant, unit) {
  $('.tenant-list').append(`<div class="col-4 tenant-item"><div class="card">
    <div class="card-body">
      <div class="row align-items-center">
      <div class="col-auto">
        <a href="#!" class="avatar">
          <img src="/img/avatars/profiles/avatar-1.jpg" alt="avatar" class="avatar-img rounded-circle">
        </a>
      </div>
      <div class="col ml-n2">
        <h4 class="card-title mb-1 tenant-name">
          ${tenant.first_name} ${tenant.last_name}
        </h4>
        <p class="card-text small text-muted">
          <a href="#" class="edit-tenant" data-tenant='${JSON.stringify(tenant)}' data-id="${tenant.id}" data-unit="${unit.id}">View details</a>
        </p>
      </div>
      <div class="col-auto">
        <div class="dropdown">
          <a href="#" class="dropdown-ellipses dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="fe fe-more-vertical"></i>
          </a>
          <div class="dropdown-menu dropdown-menu-right">
            <a href="#!" class="dropdown-item edit-tenant" data-tenant='${JSON.stringify(tenant)}' data-id="${tenant.id}" data-unit="${unit.id}">
              Edit
            </a>
            <a href="#!" class="dropdown-item delete-tenant" data-id="${tenant.id}">
              Delete
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div> 
</div>`);
}

function doPopulate() {
    $('.documentList').empty();
    let page = 0; 
    items.map( (doc, idx) => {
      if (idx % 3 == 0) { 
        page = (parseInt(idx/3) + 1)
      } else {
        page = (parseInt(idx/3) + 1) + ' d-none'
      }
      const date = new Date(doc.created_at);
      const uploaded_at = date.getDate() + '/' +  date.getMonth()+1 + '/' + date.getFullYear();
      let avatar = '<span class="fe fe-file" style="font-size: 2rem;"></span>';
      if (doc.mimetype.includes('image')) {
        avatar = `<img src="/${doc.path}" alt="document image preview" class="avatar"/>`;
      }

      $('.documentList').append(`<li class="list-group-item document-item px-0 page${page}">
          <div class="row align-items-center">
            <div class="col-auto">
              
              <!-- Avatar -->
              <a href="/${doc.path}" class="avatar" target="_blank">
                <div class="avatar-title rounded bg-white text-secondary">
                  ${avatar}
                </div>
              </a>

            </div>
            <div class="col ml-n2">

              <!-- Title -->
              <h4 class="card-title mb-1 name document-name document-lg-name">
                <a target="_blank" href="/${doc.path}">${doc.filename}</a>
              </h4>

              <!-- Text -->
              <p class="card-text small text-muted mb-1">
                ${doc.display_name} &bull;${doc.tag}
              </p>

              <!-- Time -->
              <p class="card-text small text-muted">
                Uploaded on <time datetime="${uploaded_at}">${uploaded_at}</time>
              </p>
              
            </div>
            <div class="col-auto">
              
              <!-- Button -->
              <a href="/${doc.path}" target="_blank" class="btn btn-sm btn-white d-none d-md-inline-block">
                View
              </a>

            </div>
            <div class="col-auto">
              
              <!-- Dropdown -->
              <div class="dropdown">
                <a href="#" class="dropdown-ellipses dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i class="fe fe-more-vertical"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                  <button class="dropdown-item edit-document modal-upload" data-id="${doc.id}" data-property_id="${doc.property_id}" data-property_name="${doc.property_name}" data-unit_id="${doc.unit_id}" data-unit_name="${doc.unit_name}" data-tag="${doc.tag}" data-path="${doc.path}" data-size="${doc.size}" data-filename="${doc.filename}" data-mimetype="${doc.mimetype}">
                    Edit
                  </button>
                  <button class="dropdown-item delete-document" data-id="${doc.id}">
                    Delete
                  </button>
                  <a class="dropdown-item download-document" href="/${doc.path}" download>
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div> 
        </li>`);
       })
  }

  function doPaginate() {
    // $('#documentPagination').empty();
    try {
      const pageCnt = Math.ceil(items.length / 3);
      var visiblePageCnt = Math.min(3, pageCnt);
      $('#documentPagination').twbsPagination('destroy');
      $('#documentPagination').twbsPagination({
          totalPages: pageCnt,
          // the current page that show on start
          startPage: 1,
          // maximum visible pages
          visiblePages: visiblePageCnt,
          initiateStartPageClick: true,
          // template for pagination links
          href: false,
          // variable name in href template for page number
          hrefVariable: '{{number}}',
          // Text labels
          first: '<<',
          prev: 'Prev',
          next: 'Next',
          last: '>>',
          // carousel-style pagination
          loop: false,
          // callback function
          onPageClick: function (event, page) {
            $('.documentList .list-group-item').addClass('d-none');
            $('.page'+page).removeClass('d-none');
          },
          // pagination Classes
          paginationClass: 'pagination',
          nextClass: 'next',
          prevClass: 'prev',
          lastClass: 'last',
          firstClass: 'first',
          pageClass: 'page',
          activeClass: 'active',
          disabledClass: 'disabled'
      });
    } catch(e) {}
  }

  function Dropzone_init(el) {
    const token = $('meta[name="csrf"]').attr('content');
    Dropzone.autoDiscover = false;
    Dropzone.thumbnailWidth = null;
    Dropzone.thumbnailHeight = null;

    var currentFile = undefined;
    var elementOptions = el.dataset.options;
        elementOptions = elementOptions ? JSON.parse(elementOptions) : {};
    var defaultOptions = {
      url: "/property/documents/upload?_csrf=" + token,
      maxFiles: 1,
      previewsContainer: el.querySelector('.dz-preview'),
      previewTemplate: el.querySelector('.dz-preview').innerHTML,
      init: function() {
        this.on('addedfile', function(file) {
          var maxFiles = elementOptions.maxFiles;
          if (maxFiles == 1 && currentFile) {
            this.removeFile(currentFile);
          }
          currentFile = file;
        });

        this.on('removedfile', function(file){
          if ($('#status').val() == 'upload') {
            $('#document_id').val('');
          }
        });
      },
      processing: function(res) {
        $('.upload-img-btn').attr('disabled', true)
      },
      success: function(res) {
        if (res.status == "success") {
          try {
            var mydoc = JSON.parse(res.xhr.response);
            $('.dropzone-image').attr('src', res.dataURL);
            $('.dropzone-image').addClass('active');
            if ($('#status').val() == 'upload') {
              $('#document_id').val(mydoc.id);
              $('#document_path').val(mydoc.path);
              $('.big-title').text('Upload a New Image')
            } else {
              $('#document_size').val(mydoc.size);
              $('#document_mimetype').val( mydoc.mimetype);
              $('#document_filename').val(mydoc.filename);
              $('#document_path').val(mydoc.path);
            }
          } catch(e) {}
        } else {
          makeToast({message: "Sorry, Something wrong happened on the server while uploading your document"});
        }
      },
      complete: function(res) {
        $('.upload-img-btn').attr('disabled', false)
      }
    }
    var options = Object.assign(elementOptions, defaultOptions);

    // Clear preview
    el.querySelector('.dz-preview').innerHTML = '';

    // Init dropzone
    new Dropzone(el, options);
  }

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

const makeToast = function({title='Avenue', message='', showLogo=false}) {
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
 function chartInit(chart, data, percentage=false, need_legend = true) {
    const options = {
      cutoutPercentage: 40,
      responsive: true,
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
    };
    if (need_legend) {
      options.legend = {
          position: 'bottom',
          display: true
      }
    }
    new Chart(chart, {
        type: 'doughnut',
        options: options,
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
        
        toLoadingBtn(".btn-signin")

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
          toNormalBtn(".btn-signin")
          if (res.status == 200) {
              // makeToast({message: res.message, showLogo: false, title: `Welcome back ${res.user.username}`}).on('hidden.bs.toast', function () {
              //     window.location.href = '/';
              // });
              window.location.href = '/';
          } else if (res.status == 422 || res.status == 400){
              $('.signin.alert').removeClass('d-none');
              const message = Object.values(res.errors).join('<br>');
              $('.signin .message').text(message);
          }
        })
        .catch(error => {
            console.log(error);
          toNormalBtn(".btn-signin")
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
        toLoadingBtn(".btn-signin");
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
            toNormalBtn(".btn-signup")
            if (res.status == 200) {
                // makeToast({message: res.message}).on('hidden.bs.toast', function () {
                //     window.location.href = '/';
                // });
            } else if (res.status == 422){
                $('.signup.alert').removeClass('d-none');
                const message = Object.values(res.errors).join('<br>');
                $('.signup .message').text(message);
            }
            console.log(res);
        })
        .catch(error => {
          toNormalBtn(".btn-signup")
          console.log(error);
        });
    });

    $('#password-reset-form').submit(async function(e){
        e.preventDefault();
        let data = {
            email: $('#email').val()
        };
        const token = $('meta[name="csrf"]').attr('content');
        toLoadingBtn(".btn-reset-password");
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
          toNormalBtn(".btn-reset-password");
            if (res.status == 200) {
                // makeToast({message: res.message}).on('hidden.bs.toast', function () {
                //     window.location.href = '/signin';
                // });
            } else if (res.status == 422 || res.status == 400){
                $('.signin.alert').removeClass('d-none');
                const message = Object.values(res.errors).join('<br>');
                $('.signin .message').text(message);
            }
            console.log(res);
        })
        .catch(error => {
          toNormalBtn(".btn-reset-password");
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
                // makeToast({message: res.message}).on('hidden.bs.toast', function () {
                //     window.location.href = '/signin';
                // });
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
                password: $('#password1').val(),
                old_password: $('#password').val()
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
        $('.property-unit').toggleClass('active');
        $('#property_units').val($(this).data('name'));
        if ($(this).hasClass('multi-unit')) {
            $('#property_units').prop('readonly', false);
            $('#property_units').attr('min', '2');
            if (!$('.dropzone-image').hasClass('active')) {
              $('.dropzone-image').attr('src', '/img/avatars/projects/multiple.png');
            }
        } else {
            $('#property_units').prop('readonly', true);
            $('#property_units').attr('min', '1');
            if (!$('.dropzone-image').hasClass('active')) {
              $('.dropzone-image').attr('src', '/img/avatars/projects/single.png');
            }
        }
    });

    // generate full address
    $('#createPropertyBtn').click(function(e){
        $('#property_fulladdress').val(`${$('#propertyAutocomplete').val()}, ${$('#property_city').val()}, UK`);
    });

    $('#updatePropertyBtn').click(function(e){
      $('#property_fulladdress').val(`${$('#propertyAutocomplete').val()}, ${$('#property_city').val()}, UK`);
      $('#updatePropertyForm').submit();
    });

    // Remove Property
    $(document).on('click', ".delete-property", function(e) {
      e.preventDefault();
      const _csrf = $('input[name="_csrf"]').val();
      const property = {
        id: $(this).data('id')
      }
      confirmDialog("Are you sure?", (ans) => {
        if (ans) {
          fetch(new Request('/property/remove/', 
            {
              method: 'POST',
              headers:{
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ property, _csrf})
            }
          ))
          .then(function() {
              location.reload();
          }).catch(function(text) {
              console.log(text);
          });
        }
      });
    })

    // Adjust tenancey
    $(document).on('click', '.edit-unit', function(e){
        e.preventDefault();
        const property_id = $(this).data('property');
        if (property_id) {
          $('#property_id').val(property_id);
        }
        const unit = $(this).data('unit');
        $('#unit_description').val(unit.description);
        $('#unit_start_date').val(unit.start_date);
        $('#unit_end_date').val(unit.end_date);
        $('#unit_rent_frequency').val(unit.rent_frequency);
        $('#unit_rent_frequency').trigger('change');
        $('#unit_rent_price').val(unit.rent_price);
        $('#unit_deposit').val(unit.deposit);
        $('#unit_tenants').val(JSON.stringify(unit.tenants));
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

    // Use property value from api in adjust summary popup
    $('.property-value-block').click(function(e) {
      $('#property_current_value').val($('.summary-edit-btn').data('val'));
      $('#modalAdjustSummary .modal-title').html('Update Property Value');
      $('#modalAdjustSummary').modal()
        .on('hidden.bs.modal', function() {
          $('#modalAdjustSummary .modal-title').html('Add Property Value');
        });
    });

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
        let property_id = $('input[name="property[id]"]').val();
        if ($(this).data('property')) {
          property_id = $(this).data('property');
        }
        let unit_id = $('input[name="unit[id]"]').val();
        if ($(this).data('unit')) {
          unit_id = $(this).data('unit');
        }
        if ($(this).hasClass('btn-unit-delete') || $(this).hasClass('delete-unit')) {
            const block_id = $(this).data('block');
            if ($(`#${block_id} .unit-item`).length == 1) {
                return makeToast({message: 'Each property should have at least one unit.'});
            }
            confirmDialog("Are you sure?", (ans) => {
              if (ans) {
                fetch(new Request('/property/unit/delete', {method: 'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify({unit_id, property_id, _csrf})}))
                .then(function() {
                    location.reload();
                }).catch(function(text) {
                    console.log(text);
                });
              }
            });
        } else {
          confirmDialog("Are you sure?", (ans) => {
            if (ans) {
              fetch(new Request('/property/unit/clear', {method: 'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify({unit_id, property_id, _csrf})}))
              .then(function() {
                  location.reload();
              }).catch(function(text) {
                  console.log(text);
              });
            }
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
              ],
               borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
              ],
               borderWidth: 1
            }]
          }
        chartInit(document.getElementById('tenancyChart').getContext('2d'), data, true, false);
      }

      // const cashflowStartDate = flatpickr("#cashflowStartDate", {
      //   onChange: function(selectedDates, dateStr, instance) {
          
      //   },
      // });
      // const cashflowEndDate = flatpickr("#cashflowEndDate", {});
      // $('#cashflowStartDate').flatpickr({
      //   mode: "range",
      //   onChange: function(selectedDates, dateStr, instance) {
      //     if (selectedDates.length == 2) {
      //         if (!dateStr.includes('to')) {
      //             startDate = endDate = dateStr;
      //         } else {
      //             startDate = dateStr.split('to')[0].trim();
      //             endDate = dateStr.split('to')[1].trim();
      //         }
      //     }
      //   }
      // });
      

    // thousands separator on input
    $('input.number').keyup(function(event) {
      // skip for arrow keys
      if(event.which >= 37 && event.which <= 40) return;

      // format number
      $(this).val(function(index, value) {
        if (value == '-') {
          return value;
        }
        const sign = parseFloat(value) < 0;
        let newValue = value
        .replace(/\D/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        // if (sign) {
        //   newValue = '-' + newValue;
        // } 

        return newValue;
      });
    });

    $('body').click(function(e){
      $('#property-search-list').removeClass('show');
    })

    $('#property-search').keyup(function(e){
      if (!$(this).val()) {
        $('#property-search-list').removeClass('show');
        $('#property-search-list .card-body .list-group').html('');
        return;
      }
      e.preventDefault()
      fetch('/property/search/' + $(this).val(), {method: 'GET'})
      .then(res => res.json())
      .then(res => {
        $('#property-search-list .card-body .list-group').html('');
        // property list
        if (res.properties.length) {
          $('#property-search-list .card-body .list-group').append(`<b class="mb-2">Properties</b>`);
        }
        res.properties.map(property => {
            let avatar = '/img/icons/single.svg';
            if (property.image) {
              avatar = '/' + property.image;
            }
            $('#property-search-list .card-body .list-group').append(`<a href="/property/overview/${property.id}" class="list-group-item border-0 px-0">
                <div class="row align-items-center">
                  <div class="col-auto">
                    <div class="avatar">
                      <img src="${avatar}" alt=" .." class="avatar-img rounded">
                    </div>
                  </div>
                  <div class="col ml-n2">
                    <h4 class="text-body mb-1 name">
                      ${property.address}, ${property.city}
                    </h4>
                    <p class="small text-muted mb-0">
                      <time>${PROPERTY_TYPE[property.type]}</time>
                    </p>
                  </div>
                </div>
              </a>`)
        });

        if (res.units.length) {
          $('#property-search-list .card-body .list-group').append(`<b class="mb-2">Units</b>`);
        }
        // unit list
        res.units.map(unit => {
          const href = `/property/overview/${unit.property_id}/units/${unit.id}`;
          $('#property-search-list .card-body .list-group').append(`<a href="${href}" class="list-group-item border-0 px-0">
                <div class="row align-items-center">
                  <div class="col-auto">
                    <div class="avatar">
                      <img src="/img/icons/single.svg" alt=" .." class="avatar-img rounded">
                    </div>
                  </div>
                  <div class="col ml-n2">
                    <h4 class="text-body mb-1 name">
                      ${unit.description}
                    </h4>
                    <p class="small text-muted mb-0">
                      ${unit.property_name}
                    </p>
                  </div>
                </div>
              </a>`);
        })

        // tenant list
        if (res.tenants.length) {
          $('#property-search-list .card-body .list-group').append(`<b class="mb-2">Tenants</b>`);
        }
        res.tenants.map(tenant => {
          const href = `/property/overview/${tenant.property_id}/units/${tenant.unit_id}`;
          $('#property-search-list .card-body .list-group').append(`<a href="${href}" class="list-group-item border-0 px-0">
            <div class="row align-items-center">
              <div class="col-auto">
                <div class="avatar">
                  <img src="/img/icons/single.svg" alt="avatar" class="avatar-img rounded">
                </div>
              </div>
              <div class="col ml-n2">
                <h4 class="text-body mb-1 tenant-name">
                  ${tenant.first_name} ${tenant.last_name}
                </h4>
                <p class="card-text small text-muted">
                  ${tenant.unit_name}: ${tenant.property_name}
                </p>
              </div>
            </div>
          </a>`)
        });

        
        if (!res.properties && !res.units && !res.tenants) {
          $('#property-search-list').removeClass('show');
        } else {
          $('#property-search-list').addClass('show');
        }
      })
      .catch(err => {
          console.log(err);
      })
       
    });

    // Mark the seleted transactions into paid
    $(document).on('click', '.transaction-multiple-paid-btn', function(e) {
      e.preventDefault();
      let ids = []
      $.find('.tranaction-checkbox:checked').map((e) =>{
        ids.push($(e).val())
      })
      if (ids < 1) {
        $('.transaction-dropdown').toggleClass('show')
        return;
      }
      var data = {
        transaction: {
          ids
        }
      };
      confirmDialog("Are you sure?", (ans) => {
        if (ans) {
          const token = $('input[name="_csrf"]').val();
          fetch('/transaction/mark/paid', {
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

            if (res.status == 200) {
              location.href = '/transaction/all';
            }
          })
          .catch(error => {
              console.log(error);
          }).
          finaly(() =>{
            $('.transaction-dropdown').toggleClass('show')
          });
        }
      });
    });

    // Delete selected transactions
    $(document).on('click', '.transaction-multiple-del-btn', function(e) {
      e.preventDefault();
      let ids = []
      $.find('.tranaction-checkbox:checked').map((e) =>{
        ids.push($(e).val())
      })
      if (ids < 1) {
        return;
      }
      var data = {
        transaction: {
          ids
        }
      };
      confirmDialog("Are you sure?", (ans) => {
        if (ans) {
          const token = $('input[name="_csrf"]').val();
          fetch('/transaction/delete', {
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

            if (res.status == 200) {
              location.href = '/transaction/all';
            }
          })
          .catch(error => {
              console.log(error);
          });
        }
      });
    });

    $(document).on('click', '.delete-transaction', function(e) {
      e.preventDefault();
      const parent = $(this).parents('.transaction-row');
      const ids= [$(this).data('id')];
      if (ids.length < 1) {
        return;
      }
      var data = {
        transaction: {
          ids
        }
      };
      var self = $(this);
      confirmDialog("Are you sure?", (ans) => {
        if (ans) {
          const token = $('input[name="_csrf"]').val();
          fetch('/transaction/delete', {
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

            if (res.status == 200) {
              parent.fadeOut( 1000, function() {
                parent.remove();
              });
            }
          })
          .catch(error => {
              console.log(error);
          });
        }
      });
    });

    const clearTransactionModal = () => {
      $('#addTransactionBtn').text('Add');
      $('#transaction-modal-title').text('Add a New Transaction');
      $('#modalAddNewTransaction').find('form').attr('action', '/transaction/create');
      $('#modalAddNewTransaction input').val('');
      $('#transaction_account').val('Manual Transaction');
      $('#transaction_property').val('');
      $('#transaction_property').trigger('change');
      $('#transaction_category').val('');
      $('#transaction_category').trigger('change');
      $('#transaction_status').val('');
      $('#transaction_status').trigger('change');
    }

    $(document).on('click', '.transaction-item', function(e) {
      if ($(e.target).hasClass('tranaction-checkbox') || $(e.target).hasClass('custom-control-label')) {
        return;
      }

      $('#addTransactionBtn').text('Update');
      $('#transaction-modal-title').text('Update Transaction');
      const transaction = $(this).data('val');
      const amount = Number(transaction.amount.replace(',', ''));
      if (amount > 0) {
        $('#modalAddNewTransaction #income_option').click();
      } else {
        $('#modalAddNewTransaction #expenses_option').click();
      }
      $('#modalAddNewTransaction').find('form').attr('action', '/transaction/edit');
      $('#transaction_id').val(transaction.id);
      $('#transaction_user').val(transaction.user);
      $('#transaction_created_at').val(transaction.created_at);
      $('#transaction_amount').val(amount.toString().replace('-','').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'));
      $('#transaction_property').val(transaction.property_id);
      $('#transaction_property').trigger('change');
      $('#transaction_category').val(transaction.category);
      $('#transaction_category').trigger('change');
      $('#transaction_status').val(transaction.status);
      $('#transaction_status').trigger('change');
      $('#transaction_account').val(transaction.account);
      $('#transaction_note').val(transaction.note);
      $('#modalAddNewTransaction').modal()
        .on('hidden.bs.modal', function() {
          clearTransactionModal();
        });
    })

    $('#modalAddNewTransaction').on('hidden.bs.modal', function (e) {
      clearTransactionModal();
    })

    /*
    *   Documents
    */

    $('#filterByProperty').on('select2:select', function (e) {
      if (e.params.data.id == 'all') {
        items = documents;
      } else {
        items = documents.filter(item => item.property_id == e.params.data.id);
      }
      doPopulate();
      doPaginate();
    });

    $('#filterByCategory').val('All').trigger('change');
    $('#filterByCategory').on('select2:select', function (e) {
      if (e.params.data.id == 'All') {
        items = documents;
      } else {
        items = documents.filter(item => item.category == e.params.data.id);
      }
      doPopulate();
      doPaginate();
    });

    $('#document_property').on('select2:select', function (e) {
      var data = {
        property: {
          id: e.params.data.id
        }
      };
      const token = $('input[name="_csrf"]').val();
      fetch('/property/unit/all', {
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
        if (res.status == 200) {
          $('#document_unit').empty();
          $('#document_unit').val(null).trigger('change');
          res.units.map(unit => {
            var option = new Option(unit.description, unit.id, true, true);
            $('#document_unit').append(option);
          })
        }
      })
      .catch(error => {
          console.log(error);
      });
    });

    $('#document_tag').select2({
      tags: true,
      createTag: function (params) {
        var term = $.trim(params.term);

        if (term === '') {
          return null;
        }

        return {
          id: term,
          text: term,
          newTag: true // add additional parameters
        }
      }
    });

    $(document).on('click', '.modal-upload', function(e) {
        e.preventDefault()
        $('#document_property').empty();
        $('#document_unit').empty();
        $('.property-row').removeClass('d-none');
        $('.unit-row').removeClass('d-none');
      if (!$(this).hasClass('modal-property') && !$(this).hasClass('modal-unit')) {
          properties.map(property => {
            var property_name = property.address + ', ' + property.city;
            var option = new Option(property_name, property.id, true, true);
            $('#document_property').append(option);
          });
      } else {
        var property = $(this).data('property');
        var property_name = property.address + ', ' + property.city;
        var option = new Option(property_name, property.id, true, true);
        $('#document_property').append(option);
        $('.property-row').addClass('d-none');
        if ($(this).hasClass('modal-property')) {
            units.map(unit => {
                var option = new Option(unit.description, unit.id, true, true);
                $('#document_unit').append(option);
            })
        }
        if ($(this).hasClass('modal-unit')) {
            var unit = $(this).data('unit');
            option = new Option(unit.description, unit.id, true, true);
            $('#document_unit').append(option);
            $('.unit-row').addClass('d-none');
        }
      }

      if ($(this).hasClass('edit-document')) {
        const unit_name = $(this).data('unit_name');
        const unit_id = $(this).data('unit_id');
        const property_id = $(this).data('property_id');
        const property_name = $(this).data('property_name');
        const tag = $(this).data('tag');
        const image = $(this).data('path');
        var option = new Option(unit_name, unit_id, true, true);
        $('#document_unit').append(option);
        $('#document_property').val(property_id).trigger('change');
        option = new Option(tag, tag, true, true);
        $('#document_tag').append(option);
        $('#document_id').val($(this).data('id'));
        $('#document_size').val($(this).data('size'));
        $('#document_path').val(image);
        $('#document_mimetype').val($(this).data('mimetype'));
        $('#document_filename').val($(this).data('filename'));
        $('#documentUploadImage').removeClass('d-none').children('div').css('background-image', `url('/${image}')`);
        $('#modalUpload .modal-title').text('Edit Document');
        $('#modalUpload #status').val('edit');
      } else {
        if (!$(this).hasClass('modal-property') && !$(this).hasClass('modal-unit')) {
            $('#document_property').val(null).trigger("change");
        }
        $('#document_tag').empty();
        
        $('#document_id').val('');
        $('#documentUploadImage').addClass('d-none');
        $('#modalUpload .modal-title').text('Upload Document');
        $('#modalUpload #status').val('upload');
      }

      $('#modalUpload').modal();
    });

    $('#cancelDocumentBtn').click(function(e){
      $('#trashImage').click();
      $('#modalUpload').modal('hide');
    });

    $('#uploadDocumentBtn').click(function(e) {
      if ($('#document_id').val().length == 0) {
        return makeToast({message: "Please upload a document"});
      }

      e.preventDefault();
      $('#modalUpload').modal('hide');
      const token = $('meta[name="csrf"]').attr('content');
      const data = {
        document:  {
          id: $('#document_id').val(),
          property_id: $('#document_property').val(),
          property_name: $('#document_property option:selected').text(),
          unit_id: $('#document_unit').val(),
          unit_name: $('#document_unit option:selected').text(),
          tag: $('#document_tag').val(),
          category: $('#document_category').val(),
          status: $('#status').val(),
          size: $('#document_size').val(),
          path: $('#document_path').val(),
          mimetype: $('#document_mimetype').val(),
          filename: $('#document_filename').val()
        }
      }
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

    $(document).on('click', '.delete-document', function(e) {
      e.preventDefault();
      var self = $(this);
      confirmDialog("Are you sure?", (ans) => {
        if (ans) {
          const id = self.data('id');
          const parent = self.parents('.document-item');
          const token = $('meta[name="csrf"]').attr('content');
          const data = {
              document: {
                id 
              }
          };
          fetch('/property/documents/delete', {
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
              parent.remove();
              // $('.doc_cnt').html(res.doc_cnt);
            }
          })
          .catch(error => {
            console.log(error);
          });
        }else {
          $('#modalConfirm').modal('hide');
        }
      });
    });

    // Overview
    $('#add-tenant-form').submit(function(e){
      e.preventDefault();
      const data = {
          property: {
            id: $("input[name='property[id]']").val()
          },
          unit: {
            id:  $("input[name='unit[id]']").val()
          },
          tenant: {
            first_name: $('#tenant_first_name').val(),
            last_name: $('#tenant_last_name').val(),
            email: $('#tenant_email').val(),
            phone_number: $('#tenant_phone_number').val()
          }
      };
      $('#modalAddNewTenant').modal('hide');
      fetch('/property/unit/tenant/new/', {
        credentials: 'same-origin', // <-- includes cookies in the request
        headers: {
            'CSRF-Token': $('meta[name="csrf"]').attr('content'), 
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
          addTenant(res.tenant, data.unit);
          let tenants_cnt = res.cnt == 1 ?  res.cnt + ' Tenant' : res.cnt + ' Tenants';
          if (res.cnt) {
            $('.no-tenants').remove();
            $('.unit-tenants').text(tenants_cnt);
          } else {
            $('.unit-tenants').text('No');
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
    })  
});