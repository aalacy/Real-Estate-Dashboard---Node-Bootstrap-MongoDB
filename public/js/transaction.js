let transactions = [];
let paidTransactions = [];
let dueTransactions = [];
let cur_transaction;
page_cnt = 10

properties = $('#hidden_properties').val();
try {
  properties = JSON.parse(properties);
} catch(e) { properties = [];}

let query = ''

const _displayTransactions = ({paginated=true, unit_id=-1, trans, listClass}) => {
  trans.map( (transaction, idx) => {
    if (idx % page_cnt == 0) { 
      page = (parseInt(idx/page_cnt) + 1)
    } else {
      page = (parseInt(idx/page_cnt) + 1) + ' d-none'
    }
    if (!paginated) {
      page = page.toString().replace(' d-none', '')
    }
    if (unit_id != -1 && unit_id != transaction.unit_id) {
      return
    }
    const sign = parseFloat(transaction.amount) < 0;
    let amount = '£' + toComma(transaction.amount.replace('-', ''));
   
    if (transaction.type == 'Out') {
      amount = '-' + amount;
    }
    let avatar = '<svg style="opacity: 0.7;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><g class="nc-icon-wrapper"><path d="M21,0H3C2.4,0,2,0.4,2,1v22c0,0.6,0.4,1,1,1h18c0.6,0,1-0.4,1-1V1C22,0.4,21.6,0,21,0z M11,9h5v2h-5V9z M9,19H6v-2h3V19z M9,15H6v-2h3V15z M9,11H6V9h3V11z M9,7H6V5h3V7z M15,19h-4v-2h4V19z M18,15h-7v-2h7V15z M18,7h-7V5h7V7z"></path></g></svg>';
    if (transaction.mimetype && transaction.mimetype.includes('image')) {
      avatar = `<img src="/${transaction.path}" alt="document image preview" class="avatar" style="height: auto;"/>`;
    }
    const val = JSON.stringify(transaction);
    const contact = transaction.username ? transaction.username : 'No Contact';
    let status_color = 'text-success';
    let status_text = 'Paid'
    if (transaction.status != 'Paid') {
      status_color = 'text-danger';
      status_text = 'Due'
    }
    const status = `<span class="${status_color} font-weight-bold">${status_text}</span>`
    $(listClass).append(`
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
          <div class="mb-1">${moment(transaction.created_at).format('DD MMM YYYY')}</div>
          <div class="text-muted">Date</div>
        </div>
        <div class="col-lg-3 col-md-3 col-sm-4">
          <div class="mb-1">${contact}</div>
          <div class="text-muted">${transaction.category}</div>
        </div>
        <div class="col-lg-4 col-md-5 col-sm-6">
          <div class="mb-1">${transaction.propertyName}</div>
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

// Display transactions
const displayTransactions = (paginated=true, unit_id=-1) => {
  $('.transaction-list').empty();
  $('.paid-transaction-list').empty();
  $('.due-transaction-list').empty();

  if (items.length) {
    if (items.length == 1) {
      $('.transaction-header').html('1 Transaction')
    } else {
      $('.transaction-header').html(items.length + ' Transactions')
    }
  } else {
    $('.transaction-header').html('No Transactions')
  }
  
  _displayTransactions({ paginated, trans:items, listClass: '.transaction-list', unit_id })
  _displayTransactions({ paginated, trans:paidTransactions, listClass: '.paid-transaction-list' })
  _displayTransactions({ paginated, trans:dueTransactions, listClass: '.due-transaction-list' })
}

const clearTransactionModal = () => {
  $('#addTransactionBtn').text('Add');
  $('#transaction-modal-title').text('Add a New Transaction');
  $('#modalAddNewTransaction').find('form').attr('action', '/transaction/create');
  $('#modalAddNewTransaction input').val('');
  $('#transaction_account').val('Manual Transaction');
  $('#transaction_property').val(null).trigger('change')
  $('#transaction_user').val(null).trigger('change')
  $('#transaction_unit').val(null).trigger('change')
  $('#transaction_category').val(null).trigger('change');
  $('#transaction_status').val(null).trigger('change');
  $('button.delete-transaction').addClass('d-none');
  $('#modalAddNewTransaction .modal-footer').removeClass('justify-content-between');
  $('#income_option').val('In').trigger('click');
}

const setupPagination = () => {
  _doPaginate({ items, paginationId: '#allTransPagination', itemClass:'.transaction-list .list-group-item'})
  _doPaginate({ items:paidTransactions, paginationId: '#paidTransPagination', itemClass:'.paid-transaction-list .list-group-item'})
  _doPaginate({ items:dueTransactions, paginationId: '#dueTransPagination', itemClass:'.due-transaction-list .list-group-item'})
}

/*
* Transactions
*/

// fetch transaction data from server
const fetchTransactions = (id=undefined, cnt=-1, paginated=true, unit_id=undefined) => {
  const token = $('input[name="_csrf"]').val();
  fetch(`/transaction/all/get`, {
    credentials: 'same-origin', // <-- includes cookies in the request
    headers: {
        'CSRF-Token': token, 
        'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      property_id: id,
      cnt,
      unit_id
    })
  }).then(res => res.json())
    .then(res => {
      transactions = res.transactions;
      paidTransactions = transactions.filter(transaction => transaction.status == 'Paid')
      dueTransactions = transactions.filter(transaction => transaction.status == 'Due')
      items = transactions;
      displayTransactions(paginated, unit_id)
      if (paginated) {
        setupPagination();
      }
    })
    .catch(err => {
        console.log(err);
    })
}

$(function(){
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
      },
      status: $(this).data('status')
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
        finally(() =>{
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
    $('#transaction_user').val(transaction.user).trigger('change');
    $('#transaction_created_at').val(transaction.created_at);
    $('#transaction_amount').val(toComma(amount.toString().replace('-','')));
    $('#transaction_property').val(transaction.property_id).trigger('change');
    await selectPropertyFilter(transaction.property_id)
    $('#transaction_unit').val(transaction.unit_id).trigger('change');
    $('.unit-filter').val(transaction.unit_id)
    $('#transaction_category').val(transaction.category).trigger('change');
    $('#transaction_status').val(transaction.status).trigger('change');
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

  $('.show-transaction-modal').click(function (e) {
    clearTransactionModal();
    $('#modalAddNewTransaction').modal()
  })

  // setup properties filter
  var option = new Option('All Properties', 'All', true, true);
  $('#propertyFilter').append(option);
  properties.map(property => {
    var property_name = property.address + ', ' + property.city;
    option = new Option(property_name, property.id, true, true);
    $('#propertyFilter').append(option);
  });
  $('#propertyFilter').val('All').trigger('change');

  $('#propertyFilter').on('select2:select', function (e) {
    if (e.params.data.id == 'All') {
      items = transactions;
    } else {
      items = transactions.filter(item => item.property_id == e.params.data.id);
    }
    displayTransactions();
    setupPagination();
  });

  // multiple selection
  $('.transaction-multiple-btn').click(function() {
    $('.custom-checkbox').removeClass('d-none');
    $('.transaction-multiple-finish-btn').removeClass('d-none');
    $('.transaction-multiple-del-btn').removeClass('d-none');
    $('#manageTransactions').removeClass('d-none');
    
    $('.transaction-multiple-del-btn').removeClass('d-none');
    $(this).addClass('d-none');
    $('.transaction-item .avatar-title').addClass('d-none');
  })

  $('.transaction-multiple-finish-btn').click(function(){
    $('.transaction-multiple-btn').removeClass('d-none');
    $('.transaction-item .avatar-title').removeClass('d-none');
    $('.custom-checkbox').addClass('d-none');
    $('.transaction-multiple-finish-btn').addClass('d-none');
    $('.transaction-multiple-del-btn').addClass('d-none');
    $('#manageTransactions').addClass('d-none');
    $('.custom-control-input').prop('checked', false);
  })

  $('.tranaction-checkbox-all').click(function(e){
    if ($('.tranaction-checkbox-all:checked').length) {
      $('.tranaction-checkbox').prop('checked', true);
      $('.transaction-multiple-del-btn').addClass('btn-danger').removeClass('btn-white');
      $('#manageTransactions').addClass('btn-secondary').removeClass('btn-white');
    } else {
      $('.tranaction-checkbox').prop('checked', false);
      $('.transaction-multiple-del-btn').removeClass('btn-danger').addClass('btn-white');
      $('#manageTransactions').removeClass('btn-secondary').addClass('btn-white');
    }
    $(".selectedItems").html($('.tranaction-checkbox:checked').length);
  });

  $(document).on('click', '.tranaction-checkbox', function() {
    $(".selectedItems").html($('.tranaction-checkbox:checked').length);
    if ($('.tranaction-checkbox:checked').length) {
      $('.transaction-multiple-del-btn').addClass('btn-danger').removeClass('btn-white');
      $('#manageTransactions').addClass('btn-secondary').removeClass('btn-white');
    } else {
      $('.transaction-multiple-del-btn').removeClass('btn-danger').addClass('btn-white');
      $('#manageTransactions').removeClass('btn-secondary').addClass('btn-white');
    }
  })
})