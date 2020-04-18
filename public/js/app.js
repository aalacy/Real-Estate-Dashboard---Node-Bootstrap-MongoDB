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

const page_cnt = 5;
let items = [];
let transactions = [];
let cur_transaction;

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
        avatar = `<img src="/${doc.path}" alt="document image preview" class="avatar rounded"/>`;
      }

      $('.documentList').append(`<li class="list-group-item document-item px-0 page${page}">
          <div class="row align-items-center">
            <div class="col-auto">
              <a href="/${doc.path}" class="avatar" target="_blank">
                <div class="avatar-title rounded bg-white text-secondary">
                  ${avatar}
                </div>
              </a>
            </div>
            <div class="col ml-n2">
              <h4 class="card-title mb-1 name document-name document-lg-name">
                <a target="_blank" href="/${doc.path}">${doc.filename}</a>
              </h4>
              <p class="card-text small text-muted mb-1">
                ${doc.display_name} &bull; ${doc.category || ''}
              </p>
              <p class="card-text small text-muted">
                Uploaded on <time datetime="${uploaded_at}">${uploaded_at}</time>
              </p>
            </div>
            <div class="col-auto">
              <a href="/${doc.path}" target="_blank" class="btn btn-sm btn-white d-none d-md-inline-block">
                View
              </a>
            </div>
            <div class="col-auto">
              <div class="dropdown">
                <a href="#" class="dropdown-ellipses dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i class="fe fe-more-vertical"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                  <button class="dropdown-item edit-document modal-upload" data-id="${doc.id}" data-property_id="${doc.property_id}" data-property_name="${doc.property_name}" data-unit_id="${doc.unit_id}" data-unit_name="${doc.unit_name}" data-tag="${doc.tag}" data-path="${doc.path}" data-size="${doc.size}" data-note="${doc.note}" data-filename="${doc.filename}" data-mimetype="${doc.mimetype}">
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

  // property filter in transaction
  const selectPropertyFilter = async (id) => {
    var data = {
        property: {
          id 
        }
      };
      const token = $('meta[name="csrf"]').attr('content');
      const res = await fetch('/property/unit/all', {
          credentials: 'same-origin', // <-- includes cookies in the request
          headers: {
              'CSRF-Token': token, 
              'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify(data)
      })
      .then(response => response.json())
      .catch(error => {
        console.log(error);
      });
      if (res.status == 200) {
        $('.unit-filter').empty();
        if (res.units.length == 1) {
          $('.unit-filter').attr("data-placeholder","Single Unit Property").select2().attr('disabled', true);
        } else {
          $('.unit-filter').attr("data-placeholder","Select a Unit").select2().attr('disabled', false);
          var option = new Option('No unit specified', '-1', true, true);
          $('.unit-filter').append(option);
          res.units.map(unit => {
            var option = new Option(unit.description, unit.id, true, true);
            $('.unit-filter').append(option);
          })
        }
        $('.unit-filter').val(null).trigger('change');
      }
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
    mapboxgl.accessToken = 'pk.eyJ1Ijoib2ZsZW1pbmcxMiIsImEiOiJjazhleHh1eHowMTNjM2xuNHB6NGVuamd3In0.WPSErSvPNgCbSecSrWqGIg';

    let center = options.center;
    if (options.markers.length == 1) {
      center = [options.markers[0].lng, options.markers[0].lat]
    }
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        zoom: options.zoom,
        center: center
    });
    var geojson = {
      type: 'FeatureCollection',
      features: []
    };
    var _markers = []
    options.markers.map( (marker, i) => {
      geojson.features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [marker.lng, marker.lat]
        },
        properties: {
          title: marker.title,
          link: marker.link,
          type: marker.type,
        },
      })
      // _markers.push(L.marker([marker.lng, marker.lat]))
    });

    var bounds = new mapboxgl.LngLatBounds();
    geojson.features.forEach(function(marker) {
      // create a HTML element for each feature
      var el = document.createElement('div');
      el.className = 'marker';
      if (marker.properties.type == 'single') {
        el.className += ' single-marker';
      } else {
        el.className += ' multiple-marker';
      }

      // make a marker for each feature and add to the map
      new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
          .setHTML(`<div class="h3 mb-2">${marker.properties.title}</div><a class="mb-2" href="${marker.properties.link}">View Detail</a>`))
        .addTo(map);

      bounds.extend(marker.geometry.coordinates);
    });

    // var fg = L.featureGroup(markers);
    // map.fitBounds(fg.getBounds());
    if (options.markers.length != 1) {
      map.fitBounds(bounds, {
          padding: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
      }});
    }
};

// Chart
 function chartInit(chart, data, percentage=false, need_legend = true) {
    const options = {
      responsive: true,
      animation: {
          animateScale: true,
          animateRotate: true
      },
      plugins: {
        datalabels: {
            formatter: (value, ctx) => {
                let sum = 0;
                let dataArr = ctx.chart.data.datasets[0].data;
                dataArr.map(data => {
                    sum += data;
                });
                let percentage = (value*100 / sum).toFixed(1)+"%";
                return '';
            },
            color: '#1f1f1f',
        }
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            // get the data label and data value to display
            // convert the data value to local string so it uses a comma seperated number
            var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString();
            // return the text to display on the tooltip
            let sum = 0;
            let dataArr = data.datasets[0].data;
            dataArr.map(data => {
                sum += data;
            });
            let percentage = (parseFloat(value.replace(/,/g, ''))*100/sum).toFixed(1);
            return `&nbsp;£${value} (${percentage}%)`;
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

// Display transactions
const displayTransactions = (paginated=true) => {
  $('.transaction-list').empty();
  items.map( (transaction, idx) => {
    if (idx % page_cnt == 0) { 
      page = (parseInt(idx/page_cnt) + 1)
    } else {
      page = (parseInt(idx/page_cnt) + 1) + ' d-none'
    }
    if (!paginated) {
      page = page.toString().replace(' d-none', '')
    }
    const sign = parseFloat(transaction.amount) < 0;
    let amount = '£' + transaction.amount.replace('-', '');
   
    if (transaction.type == 'Out') {
      amount = '-' + amount;
    }
    let avatar = '<svg style="opacity: 0.7;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><g class="nc-icon-wrapper"><path d="M21,0H3C2.4,0,2,0.4,2,1v22c0,0.6,0.4,1,1,1h18c0.6,0,1-0.4,1-1V1C22,0.4,21.6,0,21,0z M11,9h5v2h-5V9z M9,19H6v-2h3V19z M9,15H6v-2h3V15z M9,11H6V9h3V11z M9,7H6V5h3V7z M15,19h-4v-2h4V19z M18,15h-7v-2h7V15z M18,7h-7V5h7V7z"></path></g></svg>';
    if (transaction.mimetype && transaction.mimetype.includes('image')) {
      avatar = `<img src="/${transaction.path}" alt="document image preview" class="avatar" style="height: auto;"/>`;
    }
    const val = JSON.stringify(transaction);
    const contact = transaction.user ? transaction.user : 'No Contact';
    let status_color = 'text-success';
    let status_text = 'Paid'
    if (transaction.status != 'Paid') {
      status_color = 'text-danger';
      status_text = 'Due'
    }
    const status = `<span class="${status_color} font-weight-bold">${status_text}</span>`
    $('.transaction-list').append(`
      <div id="tranaction_${idx}" class="transaction-item list-group-item cursor-hand px-4 page${page}" data-val='${val}'>
        <div class="col-auto avatar d-flex align-items-center">
          <div class="custom-control custom-checkbox my-1 mr-sm-2 d-none">
            <input type="checkbox" name="tranaction[id]" class="custom-control-input tranaction-checkbox" id="customCheck${idx}" value="${transaction.id}">
            <label class="custom-control-label" for="customCheck${idx}"></label>
          </div>
          <div class="avatar-title rounded bg-white text-secondary">
            ${avatar}
          </div>  
        </div>
        <div class="col-lg-2 col-md-3 col-sm-4">
          <div class="mb-1">${transaction.created_at}</div>
          <div class="text-muted">Date</div>
        </div>
        <div class="col-lg-3 col-md-3 col-sm-4">
          <div class="mb-1">${contact}</div>
          <div class="text-muted">${transaction.category}</div>
        </div>
        <div class="col-lg-4 col-md-5 col-sm-6">
          <div class="mb-1">${transaction.propertyName}${transaction.unit_name ?  ' • '+transaction.unit_name: ''}</div>
          <div class="text-muted">Property</div>
        </div>
        <div class="col-lg-1 col-md-3 col-sm-6">
          <div class="mb-1 font-weight-bold">${amount}</div>
          <div class="text-muted">Amount</div>
        </div>
        <div class="ml-auto col-auto">
          <div class="mb-1">${status}</div>
          <div class="text-muted text-right">Status</div>
        </div>
        <div class="ml-auto col-auto d-flex align-items-center">
          <span class="fe fe-chevron-right"></span>
        </div>
      </div>
    `);
  });
}

const clearTransactionModal = () => {
  $('#addTransactionBtn').text('Add');
  $('#transaction-modal-title').text('Add a New Transaction');
  $('#modalAddNewTransaction').find('form').attr('action', '/transaction/create');
  $('#modalAddNewTransaction input').val('');
  $('#transaction_account').val('Manual Transaction');
  $('#transaction_property').val(null).trigger('change')
  $('#transaction_unit').val(null).trigger('change')
  $('#transaction_category').val(null).trigger('change');
  $('#transaction_status').val(null).trigger('change');
  $('button.delete-transaction').addClass('d-none');
  $('#modalAddNewTransaction .modal-footer').removeClass('justify-content-between');
  $('#income_option').trigger('click');
}

const setupPagination = () => {
  try {
    const pageCnt = Math.ceil(items.length / page_cnt);
    var visiblePageCnt = Math.min(page_cnt, pageCnt);
    $('.transactionPagination').twbsPagination('destroy');
    $('.transactionPagination').twbsPagination({
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
          $('.transaction-list .list-group-item').addClass('d-none');
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

/*
* Transactions
*/

// transaction categories
const income_categories = ['Rental Income', 'Deposit', 'Uncategorised'];
const expenses_categories = ['Insurance', 'Repairs & Maintenance', 'Management Fees', 'Utilities', 'Tax', 'Legal', 'Mortgage or Loans', 'Deposit', 'Uncategorised'];
const changeCategorySelection = (list) => {
  $('#transaction_category').empty();
  list.forEach(item => {
      option = new Option(item, item, true, true);
      $('#transaction_category').append(option);
  })

  $('#transaction_category').val(null);
  $('#transaction_category').trigger('change');
};

// fetch transaction data from server
const fetchTransactions = (id=undefined, cnt=-1, paginated=true) => {
  fetch(`/transaction/all/get/${id}/${cnt}`, {method: 'GET'})
    .then(res => res.json())
    .then(res => {
      transactions = res.transactions;
      items = transactions;
      displayTransactions(paginated)
      if (paginated) {
        setupPagination();
      }
    })
    .catch(err => {
        console.log(err);
    })
}

// check the availability of update property value from api
const checkAvailabilityForPropertyValueUpdate = (property) => {
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
  if (!property.outdoor_space || property.outdoor_space == 'none') {
      missing_value += 'out spacing, ';
      ids.push('#outdoor_space');
  } 
  if (!property.off_street_parking) {
      missing_value += 'off street parking, ';
      ids.push('#off_street_parking');
  }
  localStorage.setItem('est_missing_ids', JSON.stringify(ids));
  return missing_value.substr(0, missing_value.length-2)
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

    // date picker to be required
    $('input[name="unit[start_date]"]').keydown(function (event) {
        event.preventDefault();
    })
    $('input[name="unit[start_date]"]').attr('readonly', false)

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
            } catch (error) {}
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
        const unit = $(this).data('unit')
        $('input[name="unit[description]"]').val(unit.description);
        $('input[name="unit[start_date]"]').val(unit.start_date);
        $('input[name="unit[end_date]"]').val(unit.end_date);
        $('input[name="unit[rent_frequency]"]').val(unit.rent_frequency);
        $('input[name="unit[rent_frequency]"]').trigger('change');
        $('input[name="unit[rent_price]"]').val(unit.rent_price);
        $('input[name="unit[deposit]"]').val(unit.deposit);
        $('input[name="unit[tenants]"]').val(JSON.stringify(unit.tenants));
        $('input[name="unit[id]"]').val(unit.id);
        if ($('.unit-item').length > 1) {
            $(".action-unit").removeClass('d-none').removeClass('btn-unit-clear').addClass('btn-unit-delete').text('Delete this unit');
        } 
        if ($('.unit-item').length == 1) {
            $(".action-unit").removeClass('d-none').removeClass('btn-unit-delete').addClass('btn-unit-clear').text('Clear this unit');
        }
        $('.addUnitBtn').text('Update');
        $('#unit-modal-title').text('Edit Unit');
        $('#modalAddNewUnit').modal()
        .on('hidden.bs.modal', function() {
            $(".btn-unit-delete").addClass('d-none');
            $('.addUnitBtn').text('Add');
            $('#unit-modal-title').text('Create a New Unit');
        });
    });

    // Use property value from api in adjust summary popup
    $('.property-value-block').click(function(e) {
      $('#property_current_value').val();
      $('.property_current_value').val($('.summary-edit-btn').data('val'));
      const property = $('#estimatePropertyBtn').data('property')
      $('#modalAdjustSummary .modal-title').html('Update Property Value');
      const is_missing = checkAvailabilityForPropertyValueUpdate(property);
      if (is_missing) {
        $('.property-estimate-box').html(`
          <div class="text-muted text-uppercase mb-2">Estimate Value</div>
          <div style="font-size: 30px;">£<span class="property_current_value">${property.current_value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</div>
          <div class="text-muted">+/-£<span class="property_margin">${property.margin ? property.margin.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : '0'}</span></div>
        `)
        $('.property-estimate-helper').html(`<i class="fe fe-refresh-cw h6"></i> <small class="h6">Next update in 30 days</small>`)
      } else {
        $('.property-estimate-box').html(`
          <div class="h-100 text-center d-flex  flex-column justify-content-center align-items-center p-4">
              <span class="fe fe-alert-circle"></span>
              <h5 class="card-title text-muted mt-2">
                No estimate available
              </h5>
          </div>
        `)
        $('.property-estimate-helper').html(`<span class="h6">This property is missing required information to get a valuation.</span> <a href="/property/detail/${property.id}" class="btn-link"><small class="h6">Update details now</small></a>`)
      }
      $('#modalAdjustSummary').modal()
        .on('hidden.bs.modal', function() {
          $('#modalAdjustSummary .modal-title').html('Add Property Value');
        });
    });

    // turn on/off auto estimate
    $('#estimatePropertyBtn').change(function() {
      console.log('Toggle: ' + $(this).prop('checked'))
    })

    $('#estimatePropertyBtn').click(function(e){
        const property = $(this).data('property');
        const missing_value = checkAvailabilityForPropertyValueUpdate(property);
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
              const property_value = res.estimate.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');  
              const property_margin = res.margin.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');  
              $('#property_current_value').val(property_value);
              $('.property_current_value').html(property_value);
              $('.property_margin').html(property_margin);
              $('#property_margin').val(property_margin);
            } 

            return makeToast({ message: res.message});
        }).catch(function(text) {
            self.find('span').addClass('d-none');
            console.log(text);
        });
    });

    // Delete the unit
    $(document).on('click', ".action-unit", function(e){
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
              '#0E67DC',
              '#555F7F',
              '#41D3BD',
              '#EF476F',
              '#acc236'
            ]
          }]
        }
        chartInit(document.getElementById("marketChart").getContext('2d'), data);
    }

    if ($('#incomeChart')[0]) {
        const labels = $('#incomeChart').data('option').labels;
        const dataset = $('#incomeChart').data('option').dataset;
        const data = {
          labels: labels,
          datasets: [{
            data: dataset,
            backgroundColor: [
              '#0E67DC',
              '#555F7F',
              '#41D3BD',
              '#EF476F',
              '#acc236'
            ]
          }]
        }
        chartInit(document.getElementById("incomeChart").getContext('2d'), data);
    }

    if ($('#tenancyChart')[0]) {
        const labels = $('#tenancyChart').data('labels');
        const dataset = $('#tenancyChart').data('dataset');
        const data = []
        for (var i = 0; i < labels.length; i++) {
          data.push({
            name: labels[i],
            y: parseFloat(dataset[i]),
          })
        }
        chartInit('tenancyChart', data);
      }

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

    // Search on navbar - property, unit, tenant
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
            let avatar = '/img/avatars/projects/single.png';
            if (property.image) {
              avatar = '/' + property.image;
            } else {
              avatar = property.tenancies.length ? '/img/avatars/projects/multiple.png' : '/img/avatars/projects/single.png';
            }
            $('#property-search-list .card-body .list-group').append(`<a href="/property/overview/${property.id}" class="list-group-item border-0 px-0">
                <div class="row align-items-center">
                  <div class="col-auto">
                    <div class="avatar avatar-4by3">
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
          let avatar = unit.isMulti ? '/img/avatars/projects/multiple.png' : '/img/avatars/projects/single.png';
          const href = `/property/overview/${unit.property_id}/units/${unit.id}`;
          $('#property-search-list .card-body .list-group').append(`<a href="${href}" class="list-group-item border-0 px-0">
                <div class="row align-items-center">
                  <div class="col-auto">
                    <div class="avatar avatar-4by3">
                      <img src="${avatar}" alt=" .." class="avatar-img rounded">
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
          let avatar = tenant.isMulti ? '/img/avatars/projects/multiple.png' : '/img/avatars/projects/single.png';
          const href = `/property/overview/${tenant.property_id}/units/${tenant.unit_id}`;
          $('#property-search-list .card-body .list-group').append(`<a href="${href}" class="list-group-item border-0 px-0">
            <div class="row align-items-center">
              <div class="col-auto">
                <div class="avatar avatar-4by3">
                  <img src="${avatar}" alt="avatar" class="avatar-img rounded">
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

    
    // initialize the category with income
    changeCategorySelection(income_categories);
    
    

    $('input[name="transaction[type]"]').change(function(){
      if ($(this)[0].id == "income_option") {
        changeCategorySelection(income_categories);

        // remove - sign from pound
        $('.pound-sign').html('£');
      } else {
        changeCategorySelection(expenses_categories);

        // add - sign to pound
        $('.pound-sign').html('-£');
      }

      if (cur_transaction) {
        $('#transaction_category').val(cur_transaction.category);
        $('#transaction_category').trigger('change');
      }
    });

    // filter by category in transactions
    $('#categoryFilter').val('All').trigger('change');
        $('#categoryFilter').on('select2:select', function (e) {
          if (e.params.data.id == 'All') {
            items = transactions;
          } else {
            items = transactions.filter(item => item.category == e.params.data.id);
          }
          displayTransactions();
          setupPagination();
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
      const parent = $($('#current_transaction_item').val());
      const ids= [$('#transaction_id').val()];
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

    // action to select transaction item in transactions page
    $(document).on('click', '.transaction-item', async function(e) {
      if ($(e.target).hasClass('tranaction-checkbox') || $(e.target).hasClass('custom-control-label')) {
        return;
      }

      $('#addTransactionBtn').text('Update');
      $('#transaction-modal-title').text('Update Transaction');
      const transaction = $(this).data('val');
      cur_transaction = transaction;
      const amount = Number(transaction.amount.replace(',', ''));
      if (amount > 0) {
        $('#modalAddNewTransaction #income_option').click();
      } else {
        $('#modalAddNewTransaction #expenses_option').click();
      }
      if (transaction.type == 'In') {
        $('#income_option').click()
      } else {
        $('#expenses_option').click()
      }
      $('#modalAddNewTransaction').find('form').attr('action', '/transaction/edit');
      $('#transaction_id').val(transaction.id);
      $('#transaction_user').val(transaction.user);
      $('#transaction_created_at').val(transaction.created_at);
      $('#transaction_amount').val(amount.toString().replace('-','').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'));
      $('#transaction_property').val(transaction.property_id);
      $('#transaction_property').trigger('change');
      await selectPropertyFilter(transaction.property_id)
      $('#transaction_unit').val(transaction.unit_id);
      $('#transaction_unit').trigger('change');
      $('#transaction_category').val(transaction.category);
      $('#transaction_category').trigger('change');
      $('#transaction_status').val(transaction.status);
      $('#transaction_status').trigger('change');
      $('#transaction_account').val(transaction.account);
      $('#transaction_note').val(transaction.note);
      $('button.delete-transaction').removeClass('d-none');
      $('#current_transaction_item').val('#'+$(this)[0].id)
      $('#modalAddNewTransaction .modal-footer').addClass('justify-content-between');
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

    $('.property-filter').on('select2:select', async function (e) {
      await selectPropertyFilter(e.params.data.id);
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
        $('#document_note').val($(this).data('note') || '');
        $('.dz-message-placeholder').html('Replace a New File');
        $('.document-upload-image').removeClass('d-none').css('background-image', `url('/${image}')`);
        $('#modalUpload .modal-title').text('Edit Document');
        $('#modalUpload #status').val('edit');
      } else {
        if (!$(this).hasClass('modal-property') && !$(this).hasClass('modal-unit')) {
            $('#document_property').val(null).trigger("change");
        }
        $('#document_tag').empty();
        
        $('#document_id').val('');
        $('.document-upload-image').addClass('d-none');
        $('.dz-message-placeholder').html('Choose a file or drag it here');
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
          note: $('#document_note').val(),
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

    /* Overview */
    // add loan details
    $(document).on('click', '.addloan-btn', function(e){
      $('#loan-modal-title').html('Add a Loan Value');
      $('#addLoanBtn').html('Add');
      $('#modalAddNewLoan input').val('');
      $('#on_loan').val('1');
      $('#off_loan').val('0');
      $('#modalAddNewLoan').modal();
    });

    // add new tenant
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
            id: $('#tenant_id').val(),
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
          $('.tenant-list').empty();
          res.tenants.map(tenant => {
            addTenant(tenant, data.unit);
          });
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