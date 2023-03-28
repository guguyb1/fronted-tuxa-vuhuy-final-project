let elmNavigation = document.querySelector("#navigation");
let elmPreviousPages = document.querySelector("#previousPages");
let elmNextPages = document.querySelector("#nextPages");
let recentArticles = document.querySelector("#recentArticles");
let elmPaginationList = document.querySelector("#paginationList");
let elmCategoriName = document.querySelector("#categoriName h3");
let lastPage;

const REGEX = /^[1-9]\d*$/;
const cateGetAllApi = "/categories_news?limit=100";
const API_NEWS = axios.create({
    baseURL: 'https://apiforlearning.zendvn.com/api/v2',
    headers: { 'X-Custom-Header': 'foobar' }
});
const CURRENT_URL = new URL(window.location);
const VALUE_SEARCH_PARAMS = new URLSearchParams(window.location.search);
const CATE_ID = parseInt(VALUE_SEARCH_PARAMS.get("id"));
const PAGES = parseInt(VALUE_SEARCH_PARAMS.get("page")); 
const GET_ARTICLES_BY_CATE = `categories_news/${CATE_ID}/articles`;

let currentPage = PAGES;

// // Kiểm tra giá trị của tham số id có hợp lệ hay không
if (!isValidId() || !isVaildPage()) {
  // Nếu giá trị không hợp lệ, điều hướng URL về trang index.html
  window.location.href = "/index.html";
}

function isValidId() {
  return REGEX.test(CATE_ID);
}

function isVaildPage(){
    return REGEX.test(PAGES);
}

//event next & previous pages
elmNextPages.addEventListener('click', function () {
    if (currentPage == lastPage) {
        return;
    }
    getPaginationOfRecentArticles(++currentPage);
    CURRENT_URL.searchParams.set("page", currentPage);
    window.history.pushState({}, "", CURRENT_URL);
});
elmPreviousPages.addEventListener('click', function () {
    if (currentPage == 1) {
        return;
    }
    getPaginationOfRecentArticles(--currentPage);
    CURRENT_URL.searchParams.set("page", currentPage);
    window.history.pushState({}, "", CURRENT_URL);
});

// end event

// call api & render navigation
function getNavigation() {
    API_NEWS.get(cateGetAllApi)
        .then((response) => {
            renderNavigation(response.data.data);
            /* 2. slick Nav */
            // mobile_menu
            var menu = $('ul#navigation');
            if (menu.length) {
                menu.slicknav({
                    prependTo: ".mobile_menu",
                    closedSymbol: '+',
                    openedSymbol: '-'
                });
            };
        })
        .catch((error) => {
            console.log(error);
        });
}

// call api & Pagination for Recent Articles
function getPaginationOfRecentArticles(page) {
    API_NEWS.get(GET_ARTICLES_BY_CATE, {
            params: {
                limit: 6,
                page: page,
            }
        },
        )
        .then((response) => {
            elmCategoriName.innerText = response.data.data[0].category.name;
            renderRecentArticles(response.data.data);
            lastPage = response.data.meta.last_page;
            renderPaginationButton(page);
            statusButton();
        })
        .catch((error) => {
            console.log(error);
        });
}

function renderNavigation(data) {
    let strMenu = `<li><a href="index.html">Trang chủ</a></li>`;
    let strSubMenu = "";
    if (data.length !== 4) {
        strSubMenu = `<li><a href="#">Tin Khác</a><ul class="submenu">`;
    }
    for (let i = 0; i < data.length; i++) {
        if (i < 4) {
            strMenu += `<li><a href="categori.html?id=${data[i].id}&page=1">${data[i].name}</a></li>`; // main menu
        } else {
            strSubMenu += `<li><a href="categori.html?id=${data[i].id}&page=1">${data[i].name}</a></li>`; // sub menu
        }
    }
    strSubMenu += `</ul>
    </li>`;
    elmNavigation.innerHTML = strMenu + strSubMenu;
}

function renderRecentArticles(data) {
    let str = "";
    for (let i = 0; i < data.length; i++) {
        str += ` 
        <div class="single-recent mb-100 ">
            <div class="what-img">
                <img src="${data[i].thumb}" alt="">
            </div>
            <div class="what-cap">
                <h4><a href="#">${data[i].title}</a></h4>
                <div class="description">
                <p>${data[i].description}</p>
                </div>
            </div>
        </div>`; // render articles
    }
    recentArticles.innerHTML = str;
}

function renderPaginationButton(indexPage) {
    let morePage = `
    <li class="page-item">
      <a class="page-link">..</a>
    </li>
    `;
    let samplePageItem = (index, active) => {
        return `
                <li class="page-item ${active}">
                    <a class="page-link" href="categori.html?id=${CATE_ID}&page=${index}">${index}</a>
                </li>`;
    }
    let startindex, endindex = 0;
    let str = ``;
    if (indexPage >= 6) {
        str += samplePageItem(1,"");
        str += morePage;
    }
    if (indexPage + 2 < lastPage && indexPage - 2 > 1) {
       
        startindex = indexPage - 2;
        endindex = indexPage + 2;
        for (let i = startindex; i <= endindex; i++) {
            if (i === indexPage) {
                str += samplePageItem(i, "active");
            } else{
                str += samplePageItem(i,"");;
            }
            
        }
        if (indexPage <= lastPage - 6) {
            str += morePage;
            str += samplePageItem(lastPage);
        }
    } else if (!(indexPage + 2 < lastPage)) {
        for (let i = lastPage - 5; i <= lastPage; i++) {
            if (i === indexPage) {
                str += samplePageItem(i, "active");
            } else{
                str += samplePageItem(i,"");
            }
            
        }
    } else {
        for (let i = 1; i <= 5; i++) {
            if (i === indexPage) {
                str += samplePageItem(i, "active");
            } else{
                str += samplePageItem(i,"");;
            }
            
        }
        str += morePage;
        str += samplePageItem(lastPage,"");
    }

    elmPaginationList.innerHTML = str;

}
function statusButton(){
    if (currentPage > 1) {
        elmPreviousPages.classList.add("right-arrow");
    }
    if (currentPage == lastPage) {
        elmNextPages.classList.remove("right-arrow");
    }
    if (currentPage < lastPage) {
        elmNextPages.classList.add("right-arrow");
    }
    if (currentPage == 1) {
        elmPreviousPages.classList.remove("right-arrow");
    }
}

getNavigation();
getPaginationOfRecentArticles(PAGES);