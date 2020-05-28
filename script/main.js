const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const API_KEY='bfed52993b685bf4e8a3354d6ddb89e1';
const API_URL ='https://api.themoviedb.org/3/';

const leftMenu = document.querySelector('.left-menu'),
        hamburger = document.querySelector('.hamburger'),
        tvShowsList = document.querySelector('.tv-shows__list'),
        tvShows = document.querySelector('.tv-shows'),
        modal = document.querySelector('.modal'),
        tvCardImg =  document.querySelector('.tv-card__img'),
        modalTitle = document.querySelector('.modal__title'),
        genresList = document.querySelector('.genres-list'),
        rating = document.querySelector('.rating'),
        description = document.querySelector('.description'),
        modalLink = document.querySelector('.modal__link'),
        searchForm = document.querySelector('.search__form'),
        searchFormInput = document.querySelector('.search__form-input'),
        tvShowsHead = document.querySelector('.tv-shows__head');

const loading = document.createElement('div');
loading.className = 'loading';

const DBQuery = class {
    getData = async (url) => {
        const res = await fetch(url);
        if(res.ok){
            return res.json();
        } else {
            throw new Error(`По адресу ${url} сервер вернул ${res.status}`);
        }
    }

    getTestDara = () => {
        return this.getData('test.json');
    }

    getTestCard = () => {
        return this.getData('card.json');
    }

    getSearchResult = (querySearch, page = 1) => {
        return this.getData(`${API_URL}search/tv?api_key=${API_KEY}&language=ru-RU&page=${page}&query=${querySearch}`);
    }

    getCard = (id) => this.getData(`${API_URL}tv/${id}?api_key=${API_KEY}&language=ru-RU`);
}

const findPage = (query,page) => {
    new DBQuery().getSearchResult(query,page).then(renderCard);
}

const renderCard = response => {
    tvShowsList.textContent ='';
    const countResult = response.total_results;
    const page = response.page;
    const countPages = response.total_pages;
    let query = searchFormInput.value.trim();
    if(!query)
        query = document.querySelector('.query_question').innerHTML;

    if(countResult) {
        response.results.forEach(item => {
            const {
                backdrop_path: backdrop,
                id,
                name: title,
                poster_path: poster,
                vote_average: vote
            } = item;

            const posterSrc = poster ? IMG_URL + poster : 'img/no-poster.jpg';
            const backdropSrc = backdrop ? IMG_URL + backdrop : 'img/no-poster.jpg';
            const voteDiv = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

            const card = document.createElement('li');
            card.className = 'tv-shows__item';
            card.innerHTML = `
                    <a href="#" class="tv-card" data-id = "${id}">
                        ${voteDiv}
                        <img class="tv-card__img"
                             src="${posterSrc}"
                             data-backdrop="${backdropSrc}"
                             alt="${title}">
                        <h4 class="tv-card__head">${title}</h4>
                    </a>`;
            tvShowsList.append(card);
        });

        if(query || countResult <= 0) {

            //Делаем пейджинг
            tvShowsHead.innerHTML = 'Результат поиска для \"<span class=\'query_question\'>' + query + '</span>\" найдено: ' + countResult + '<br />' +
                    (page > 1 ? '<a href=\'#\' class=\'previous_page\'>' + (page - 1) + '< </a>' : '') +
                    ` Страница ${page} из ${countPages} ` +
                    (page < countPages ? '<a href=\'#\' class=\'next_page\'> >' + (page + 1) + '</a>' : '');
            if (page > 1)
                document.querySelector('.previous_page').addEventListener('click', () => {
                    findPage(query, page - 1);
                });
            if (page < countPages)
                document.querySelector('.next_page').addEventListener('click', () => {
                    findPage(query, page + 1);
                });
        }
    }else {
        {
            tvShowsHead.innerHTML = `Результат поиска для "${query}" :(`;
        }
    }
    loading.remove();
    searchFormInput.value = '';
}

// меню

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
});

document.addEventListener('click', event => {
    if (!event.target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
    }
});

leftMenu.addEventListener('click', event => {
    const target = event.target;
    const dropdown = target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }
});

//Смена картинки
function changeImg(event) {
    const target = event.target.closest('.tv-shows__item');
    if(target) {
        const img = target.querySelector('.tv-card__img');
        if (img.dataset.backdrop) {
            [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
        }
    }
}

    tvShowsList.addEventListener('mouseover', changeImg);
    tvShowsList.addEventListener('mouseout', changeImg);

//открытие модального окна

tvShowsList.addEventListener( 'click', event => {
    event.preventDefault();

    const target = event.target;
    const card = target.closest('.tv-card');

    tvShows.append(loading);
    if(card){
        new DBQuery().getCard(card.dataset.id)
                .then(response => {
                    console.log(response);
                    if(response.poster_path){
                        tvCardImg.src = IMG_URL + response.poster_path;
                        document.querySelector('.image__content').classList.remove('hide');
                    }else{
              //          tvCardImg.src = 'img/no-poster.jpg';
                        document.querySelector('.image__content').classList.add('hide');
                    }
                    tvCardImg.alt = response.name;
                    modalTitle.textContent = response.name;
                    genresList.innerHTML = response.genres.reduce((acc, item) =>{
                        return `${acc}<li>${item.name}`;
                    },'');
                    rating.textContent = response.vote_average;
                    description.textContent = response.overview;
                    modalLink.href = response.homepage;
                }).then(() => {
            document.body.style.overflow = 'hidden';
            modal.classList.remove('hide');
            loading.remove();
        });
    }
});

//Закрытие

modal.addEventListener('click', event =>{
    const target = event.target;
    if(target.closest('.cross') ||
        target.classList.contains('modal') ){
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
})

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const querySearch = searchFormInput.value.trim();
    if(querySearch){
        tvShows.append(loading);
        new DBQuery().getSearchResult(querySearch).then(renderCard);
    }
})