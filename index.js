//API

const Api = function() {
  this.apiURLS = {
    INIT: 'https://game-server.kovalevskyi.net/init',
    SPIN: 'https://game-server.kovalevskyi.net/spin',
  };
  this.callApi = async function callApi(method, url, data) {
    let body = {
      method,
      withCredentials: true,
      headers: {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
        'Content-Type': 'application/json',
      },
    };
    if (method === 'POST' || method === 'PUT') {
      body = Object.assign({}, body, {body: JSON.stringify(data)});
    }
    const res = await fetch(`${url}`, body).catch(err => {
      console.error('api err', err);
    });
    return res.json();
  };
  this.getUrlParams = (params) => {
    return '?' + Object.entries(params).map(([key, val]) => {
      if (typeof val !== 'object') {
        return `${key}=${val}`;
      } else {
        let innerObject = val;
        let innerObjectKeys = Object.keys(innerObject);
        let innerObjectName = key;

        return innerObjectKeys.map(innerKey => {
          return `${innerObjectName}[${innerKey}]=${innerObject[innerKey]}`;
        }).join('&');
      }
    }).join('&');
  };
};
//App
const App = function() {
  this.store = {
    accountData: {},
    bet: 10,
  };
  this.updateAccountData = (data) => {
    this.store = {
      ...this.store,
      accountData: data,
    };
  };
  this.updateBet = (data) => {
    this.store = {
      ...this.store,
      bet: data,
    };
  };
  this.setBasicHtml = () => {
    let el = document.getElementById('app')
    let html = `
      <div class="game">
          <div class="account"></div>
          <div class="spinner__container">
              <div class="spinner"></div>
              <div class="spinner__controls">
                  <div class="spinner__bet-select">
                      <button class="select__btn select__btn--up" id="selectInputUp">+</button>
                      <input class="select" type="text" disabled id="selectInput">
                      <button class="select__btn select__btn--down" id="selectInputDown">-</button>
                  </div>
                  <button class="spinner__controls-btn" id="spin">spin</button>
              </div>
          </div>
          <div class="winner">
          <h3>YOU WIN</h3>
          <div class="winner__text"></div>
</div>
      </div>
  `;
    el.innerHTML = html;
  };
  this.showAccountData = () => {
    let data = this.store.accountData;
    let el = document.querySelector('.account');
    let html = `
    <ul class="account__data">
      <li class="account__data--element"><bold>USER ID:</bold>${data.uid}</li>
      <li class="account__data--element"><bold>USER BALANCE:</bold>${data.balance}</li>
    </ul>
  `;
    el.innerHTML = html;
  };
  this.showRolls = (newData) => {
    let el =  document.querySelector('.spinner')
    const ICONS = [
      '&#9200;',
      '&#127829;',
      '&#127829;',
      '&#8986;',
      '&#9201;',
      '&#9749;',
      '&#127799;',
      '&#127801;',
      '&#127183;',
      '&#128231;',
      '&#127860;',
    ];
    let data = newData && newData.length ? newData : this.store.accountData.rolls;
    let html = '';
    data.map((innerArray) => {
      let innerHtml = '';
      innerArray.forEach(item => {
        innerHtml += `<div class="spinner__coll">${ICONS[item]}</div>`;
      });
      html += `<div class="spinner__row">${innerHtml}</div>`;
    });
    el.innerHTML = html;
  };
  this.setSelectValue = () => {
    let el = document.getElementById('selectInput');
    let data = this.store.accountData.last_bet;
    el.value = data;
  };
  this.updateUi = () => {
    setTimeout(() => {
      this.showAccountData();
      this.showRolls();
      this.setSelectValue();
    }, 1000);
  };
  this.loaderRemove = () => {
    document.querySelector('.loader').remove();
  }

  //events
  this.eventListeners = () => {
    //spin
    document.getElementById('spin').addEventListener('click', () => {
      spinClick();
    });
    //select up
    document.getElementById('selectInputUp').addEventListener('click', () => {
      selectHandleChange('up');
    });
    //select down
    document.getElementById('selectInputDown').addEventListener('click', () => {
      selectHandleChange('down');
    });
  };
  const spinClick = () => {
    const btn = new SpinBtn();
    const api = new Api();
    let spinParams = {
      uid: this.store.accountData.uid,
      bet: this.store.bet,
    };
    let spinUrl = `${api.apiURLS.SPIN}${api.getUrlParams(spinParams)}`;
    btn.btnLoading();
    api.callApi('GET', spinUrl).then(spinData => {
      if (spinData.win) {
        let el = document.querySelector('.winner');
        let elText = document.querySelector('.winner__text');
        elText.innerText = `${spinData.win}`
        el.style.display = 'block'
        setTimeout(() => {
          el.style.display = 'none'
          elText.innerText = ''
        }, 4000)
        console.log(spinData.win)
      }
      this.updateAccountData(spinData);
      btn.btnLoadingDone();
      this.updateUi();
    });
  };
  const selectHandleChange = (event) => {
    const currentBet = this.store.bet;
    const {bets} = this.store.accountData;
    let newBet = '';
    bets.forEach((bet, index) => {
      if (currentBet === bet && event === 'up') {
        newBet = index >= bets.length - 1 ? bets[0] : bets[index + 1];
      }
      if (currentBet === bet && event === 'down') {
        newBet = (index - 1 < 0) ? bets[bets.length - 1] : bets[index - 1];
      }
    });
    this.updateBet(newBet);
    document.getElementById('selectInput').value = newBet;
  };
};

const SpinBtn = function() {
  this.element = document.getElementById('spin');
  this.btnLoading = () => {
    this.element.setAttribute('disabled', true);
    this.element.innerHTML = `<div class="loader">Loading...</div>`;
  };
  this.btnLoadingDone = () => {
    this.element.removeAttribute('disabled');
    this.element.innerHTML = `SPIN`;
  };
};

//INIT

function init() {
  const api = new Api();
  const app = new App();
  let userId = 113;
  let initParams = {
    uid: userId,
  };
  let initUrl = `${api.apiURLS.INIT}${api.getUrlParams(initParams)}`;

  api.callApi('GET', initUrl).then(initData => {
    app.loaderRemove()
    app.setBasicHtml();
    app.eventListeners();
    app.updateAccountData(initData);
    app.updateBet(initData.last_bet);
    app.updateUi();
  });
}

//START APP

init();

