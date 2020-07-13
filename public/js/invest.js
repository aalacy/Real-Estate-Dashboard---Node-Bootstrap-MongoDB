/*
	javascript for invest page
*/

// variables

let invests = []
let myShortLists = []
let myShortListIds = []
const PAGE = 25
let investFilter = {
  category: '*',
  type: '*',
  price: '*'
} 

const updateShortList = ({ id, type, shortLists, shortListIds}) => {
	myShortListIds = shortListIds
	myShortLists = shortLists
}

const _doPaginate = ({ items, paginationId, itemClass}) => {
    try {
      const pageCnt = Math.ceil(items.length / PAGE);
      var visiblePageCnt = Math.min(PAGE, pageCnt);
      $(paginationId).twbsPagination('destroy');
      $(paginationId).twbsPagination({
          totalPages: pageCnt,
          // the current page that show on start
          startPage: 1,
          // maximum visible pages
          visiblePages: 0,
          initiateStartPageClick: true,
          // template for pagination links
          href: false,
          // variable name in href template for page number
          hrefVariable: '',
          // Text labels
          first: '',
          prev: 'Prev',
          next: 'Next',
          last: '',
          // carousel-style pagination
          loop: false,
          // callback function
          onPageClick: function (event, page) {
            $(itemClass).addClass('d-none');
            $('.page'+page).removeClass('d-none');
          },
          // pagination Classes
          paginationClass: 'pagination',
      });
    } catch(e) {}
}

const doInvestPaginate = () => {
	_doPaginate({ items: invests, paginationId: '#investPagination', itemClass: '.invest-list .list-group-item'})
}

const doShortlistPaginate = () => {
	_doPaginate({ items: myShortLists, paginationId: '#investShortlistPagination', itemClass: '.invest-short-list .list-group-item'})
}

const displayInvestData = ({ data, listClass, type }) => {
	$(listClass).empty()

  // get the filtered data
  const filteredData = applyInvestFilter(data) 

  // update badge for filter button
  updateFilterBadge()

	filteredData.map((invest, idx) => {
		let page = 0; 
		if (idx % PAGE == 0) { 
      page = (parseInt(idx/PAGE) + 1)
  	} else {
      page = (parseInt(idx/PAGE) + 1) + ' d-none'
  	}
  	let feIcon = `<i class="fe fe-trash"></i>`
  	if (type == 'browse') {
  		if (myShortListIds.includes(invest.id)) {
    		feIcon = `<i class="fe fe-heart red"></i>`
  		} else {
    		feIcon = `<i class="fe fe-heart"></i>`
  		}
  	} 
    let category = invest.category.replace(/-/g, ' ').replace('properties', '').trim()
    category = category[0].toUpperCase() + category.substr(1)
		$(listClass).append(`
			<li class="list-group-item invest-item px-0 page${page}">
                <div class="row align-items-center">
                  <div class="col-auto">
                    <a href="/uploads/file-1591342555538.csv" class="avatar avatar-xxl avatar-4by3" target="_blank">
                      <img class="avatar-title rounded" src="/img/avatars/projects/single.png" alt="10019 S Hoover St APT 4, Los Angeles, CA 90044" aria-hidden="false">
                    </a>
                  </div>
                  <div class="col ml-n2">
                    <h4 class="card-title mb-2 name document-name">
                      <a href="${invest.url}" target="_blank">
                        ${invest.address}
                      </a>
                    </h4>
                    <p class="card-text small mb-3">
                      <b>£${toComma(invest.price)}</b><span class="text-muted mx-3">●</span><b>${invest.bedrooms} bed ${invest.type}</b>
                    </p>
                    <p class="card-text">
                      <span class="badge badge-soft-dark px-2">${category}</span>
                    </p>
                  </div>
                  <div class="col-auto like-icon">
                    <button class="btn btn-text" onclick="manageShortList('${invest.id}')">${feIcon}</button>
                  </div>
                </div> 
              </li>
		`)
	})
}

const getInvestData = (id) => {
	const token = $('meta[name="csrf"]').attr('content');
	const data = {
		invest: {
			id
		}
	}
	fetch('/invest/all', {
        credentials: 'same-origin', // <-- includes cookies in the request
        headers: {
          'CSRF-Token': token, // <-- is the csrf token as a header
          'Content-Type': 'application/json'
        },
        method: 'GET',
    })
    .then(response => response.json())
    .then(function(res) {
      if (res.status == 200) {
      	invests = res.invests
      	shortLists = res.shortLists
      	myShortListIds = res.shortListIds

      	manageInvestData()
      } 
    })
    .catch(error => {
        console.log(error);
    });
}

// manage Invest data
const manageInvestData = () => {
  // update header
  $(".invest-header").html(`${invests.length} Results`)

	displayInvestData({ data: invests, listClass: '.invest-list', type: 'browse'})
	doInvestPaginate()

	displayInvestData({ data: myShortLists, listClass: '.invest-short-list', type: 'shortlist'})
	doShortlistPaginate()
	$('.invest-short-cnt').html(myShortLists.length)
}

// manage short list
const manageShortList = (id) => {
	const token = $('meta[name="csrf"]').attr('content');
	const data = {
		invest: {
			id
		}
	}
	fetch('/invest/manage-short-list', {
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
      	updateShortList(res)
      	manageInvestData()
      } 
    })
    .catch(error => {
        console.log(error);
    });
}

// Apply Invest Preference Filter
const applyInvestFilter = (data) => {
  return data.filter(item => {
    let _category = investFilter.category == '*' ? true : investFilter.category != '*' && investFilter.category == item.category
    let _price = investFilter.price == '*'
    if (investFilter.price == 'Under £50,000' && item.price < 50000) {
      _price = true
    }
    if (investFilter.price == '£50,000 - £100,000' && item.price >= 50000 && item.price < 100000) {
      _price = true
    } 
    if (investFilter.price == '£100,000 - £200,000' && item.price >= 100000 && item.price < 200000) {
      _price = true
    } 
    if (investFilter.price == 'Over £200,000' && item.price >= 200000) {
      _price = true
    } 
    let _type = investFilter.type == '*' || investFilter.type == item.type

    return _category && _price && _type
  })
}

const updateFilterBadge = () => {
  let filterCnt = 0
  for (let filter in investFilter) {
    if (investFilter[filter] != '*') {
      filterCnt++
    }
  }
  if (filterCnt) {
    $('.invest-filter-cnt').removeClass('d-none').html(filterCnt)
    $('.invest-clear-filter').removeClass('d-none')
  } else {
    $('.invest-clear-filter').addClass('d-none')
    $('.invest-filter-cnt').addClass('d-none')
  }
}

// Clear the filter
const clearFilter = () => {
  for (let filter in investFilter) {
    investFilter[filter] = '*'
  }

  updateFilterBadge()
}

$(function() {
	getInvestData()

  // To avoid closing a dropdown
  $(".select2-selection").on("click", function(){
      return false; // prevent propagation
  });

  // preferences
  $('#invest-filter').submit(e => {
    e.preventDefault()
    investFilter = {
      category: $('#investCategory').val(),
      type: $('#investType').val(),
      price: $('#investPrice').val()
    }
    manageInvestData()
  })

  // sort filter
  $('#investSort').on('select2:select', function (e) {
    if (e.params.data.id == 'highestSort') {
      invests.sort((a, b) => b.price - a.price)
    } else if (e.params.data.id == 'lowestSort') {
      invests.sort((a, b) => a.price - b.price)
    }

    manageInvestData()
  })

  // clear filter
  $('.invest-clear-filter').click(() => {
    clearFilter()
  })
})