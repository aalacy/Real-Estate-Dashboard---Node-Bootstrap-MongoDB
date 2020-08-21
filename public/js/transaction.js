let transactions = [];
let paidTransactions = [];
let dueTransactions = [];
let cur_transaction;
page_cnt = 10
let transactionFilter = {
  property: 'All',
  category: 'All',
  dateRange: '*'
}

properties = $('#hidden_properties').val();
try {
  properties = JSON.parse(properties);
} catch(e) { properties = [];}

let query = ''

const _displayTransactions = ({paginated=true, unit_id=-1, trans, listClass, id}) => {
  const filteredData = applyTransactionFilter(trans)

  if (filteredData.length) {
    if (filteredData.length == 1) {
      $(`.transaction-header-${id}`).html('1 Transaction')
    } else {
      $(`.transaction-header-${id}`).html(filteredData.length + ' Transactions')
    }
  } else {
    $(`.transaction-header-${id}`).html('No Transactions')
  }
  filteredData.map( (transaction, idx) => {
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
      <div id="tranaction_${id+'_'+idx}" class="transaction-item list-group-item cursor-hand px-4 page${page}" data-val='${val}'>
        <div class="col-auto avatar d-flex align-items-center">
          <div class="custom-control custom-checkbox custom-checkbox-${id} my-1 mr-sm-2 d-none">
            <input type="checkbox" name="tranaction[id]" class="custom-control-input tranaction-checkbox tranaction-checkbox-${id}" id="customCheck${id+'_'+idx}" value="${transaction.id}" data-id="${id}">
            <label class="custom-control-label" for="customCheck${id+'_'+idx}" ></label>
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

const manageTransactions = () => {
  displayTransactions()
  setupPagination()
}

// Display transactions
const displayTransactions = (paginated=true, unit_id=-1) => {
  paidTransactions = transactions.filter(transaction => transaction.status == 'Paid')
  dueTransactions = transactions.filter(transaction => transaction.status == 'Due')
  items = transactions;

  $('.transaction-list').empty();
  $('.paid-transaction-list').empty();
  $('.due-transaction-list').empty();

  if (dueTransactions.length) {
    $('.due-cnt').text(dueTransactions.length)
  }

  _displayTransactions({ paginated, trans:items, listClass: '.transaction-list', unit_id, id:'all' })
  _displayTransactions({ paginated, trans:paidTransactions, listClass: '.paid-transaction-list', unit_id, id:'paid' })
  _displayTransactions({ paginated, trans:dueTransactions, listClass: '.due-transaction-list', unit_id, id:'due' })
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


const applyTransactionFilter = (data) => {
  return data.filter(item => {
    let _property = transactionFilter.property == 'All' ? true : item.property_id == transactionFilter.property
    let _category = transactionFilter.category == 'All' ? true : item.category == transactionFilter.category
    return _property && _category
  })
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
  $('.categoryFilter').val('All').trigger('change');
  // $('.categoryFilter').on('select2:select', function (e) {
  //   if (e.params.data.id == 'All') {
  //     items = transactions;
  //   } else {
  //     items = transactions.filter(item => item.category == e.params.data.id);
  //   }
  //   displayTransactions();
  //   setupPagination();
  // });

  // Mark the seleted transactions into paid
  $(document).on('click', '.transaction-multiple-paid-btn-all, .transaction-multiple-paid-btn-paid, .transaction-multiple-paid-btn-due', function(e) {
    const id = $(this).data('id')
    e.preventDefault();
    let ids = []
    $.find(`.tranaction-checkbox-${id}:checked`).map((e) =>{
      ids.push($(e).val())
    })
    if (ids < 1) {
      $(this).parents('.transaction-dropdown').toggleClass('show')
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
          $(this).parents('.transaction-dropdown').toggleClass('show')
        });
      }
    });
  });

  // Delete selected transactions
  $(document).on('click', '.transaction-multiple-del-btn-all, .transaction-multiple-del-btn-paid, .transaction-multiple-del-btn-due', function(e) {
    e.preventDefault();
    let ids = []
    $.find(`.tranaction-checkbox-${id}:checked`).map((e) =>{
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
  var option = new Option('All', 'All', true, true);
  $('#propertyFilter-all, #propertyFilter-paid, #propertyFilter-due').append(option);
  properties.map(property => {
    var property_name = property.address + ', ' + property.city;
    option = new Option(property_name, property.id, true, true);
    $('#propertyFilter-all, #propertyFilter-paid, #propertyFilter-due').append(option);
  });
  $('#propertyFilter-all, #propertyFilter-paid, #propertyFilter-due').val('All').trigger('change');

  // $('#propertyFilterall, #propertyFilterpaid, #propertyFilterdue').on('select2:select', function (e) {
  //   if (e.params.data.id == 'All') {
  //     items = transactions;
  //   } else {
  //     items = transactions.filter(item => item.property_id == e.params.data.id);
  //   }
  //   displayTransactions();
  //   setupPagination();
  // });

  // multiple selection
  $('.transaction-multiple-btn-all, .transaction-multiple-btn-paid, .transaction-multiple-btn-due').click(function() {
    const id = $(this).data('id')
    $(`.custom-checkbox-${id}`).removeClass('d-none');
    $(`.transaction-multiple-finish-btn-${id}`).removeClass('d-none');
    $(`.transaction-multiple-del-btn-${id}`).removeClass('d-none');
    $(`.manageTransactions-${id}`).removeClass('d-none');
    
    $(`.transaction-multiple-del-btn-${id}`).removeClass('d-none');
    $(this).addClass('d-none');
    $(`.transaction-item .avatar-title`).addClass('d-none');
  })

  $('.transaction-multiple-finish-btn-all, .transaction-multiple-finish-btn-paid, .transaction-multiple-finish-btn-due').click(function(){
    const id = $(this).data('id')
    $(`.transaction-multiple-btn-${id}`).removeClass('d-none');
    $(`.transaction-item .avatar-title`).removeClass('d-none');
    $(`.custom-checkbox-${id}`).addClass('d-none');
    $(`.transaction-multiple-finish-btn-${id}`).addClass('d-none');
    $(`.transaction-multiple-del-btn-${id}`).addClass('d-none');
    $(`.manageTransactions-${id}`).addClass('d-none');
    $(`.tranaction-checkbox-${id}`).prop('checked', false);
  })

  $('.tranaction-checkbox-all-all, .tranaction-checkbox-all-paid, .tranaction-checkbox-all-due').click(function(e){
    const id = $(this).data('id')
    if ($(`.tranaction-checkbox-all-${id}:checked`).length) {
      $(`.tranaction-checkbox-${id}`).prop('checked', true);
      $(`.transaction-multiple-del-btn-${id}`).addClass('btn-danger').removeClass('btn-white');
      $(`.manageTransactions-${id}`).addClass('btn-secondary').removeClass('btn-white');
    } else {
      $(`.tranaction-checkbox-${id}`).prop('checked', false);
      $(`.transaction-multiple-del-btn-${id}`).removeClass('btn-danger').addClass('btn-white');
      $(`.manageTransactions-${id}`).removeClass('btn-secondary').addClass('btn-white');
    }
    // $(".selectedItems").html($('.tranaction-checkbox:checked').length);
  });

  $(document).on('click', '.tranaction-checkbox-all, .tranaction-checkbox-paid, .tranaction-checkbox-due', function() {
    const id = $(this).data('id')
    // $(".selectedItems").html($('.tranaction-checkbox:checked').length);
    if ($(`.tranaction-checkbox-${id}:checked`).length) {
      $(`.transaction-multiple-del-btn-${id}`).addClass('btn-danger').removeClass('btn-white');
      $(`.manageTransactions-${id}`).addClass('btn-secondary').removeClass('btn-white');
    } else {
      $(`.transaction-multiple-del-btn-${id}`).removeClass('btn-danger').addClass('btn-white');
      $(`.manageTransactions-${id}`).removeClass('btn-secondary').addClass('btn-white');
    }
  })

  // sort filter newest - oldest
  $('.transactionSort').on('select2:select', function (e) {
    if (e.params.data.id == 'newest') {
      transactions = transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (e.params.data.id == 'oldest') {
      transactions = transactions.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    }

    manageTransactions()
  })

  // filter group
  $('#tran-filter-all, #tran-filter-paid, #tran-filter-due').submit(function(e) {
    const id = $(this).data('id')
    e.preventDefault()
    transactionFilter = {
      property: $(`#propertyFilter-${id}`).val(),
      category: $(`#categoryFilter-${id}`).val(),
      dateRange: $(`#dateRangeFilter-${id}`).val()
    }
    manageTransactions()
  })
})