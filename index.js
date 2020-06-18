const API = {
  INIT: 'https://game-server.kovalevskyi.net/init',
  SPIN: 'https://game-server.kovalevskyi.net/spin',
};

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
]

//API

async function callApi(method, url, data) {
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
}

const getUrlParams = (params) => {
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

// STORE
let store = {
  accountData: {},
  bet: 10,
};

const updateAccountData = (data) => {
  store = {
    ...store,
    accountData: data,
  };
};
const updateBet = (data) => {
  store = {
    ...store,
    bet: data,
  };
};

//SHOW UI
function updateUI() {
  setTimeout(() => {
    showAccountData();
    showRolls();
    setSelectValue();
  }, 100);
}

const setBasicHtmlApp = () => {
  let el = document.getElementById('app');
  let html = `
      <div>
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
      </div>
  `;
  el.innerHTML = html;
};

const showAccountData = () => {
  let data = store.accountData;
  let el = document.querySelector('.account');
  let html = `
    <ul class="account__data">
      <li class="account__data--element"><bold>USER ID:</bold>${data.uid}</li>
      <li class="account__data--element"><bold>USER BALANCE:</bold>${data.balance}</li>
    </ul>
  `;
  el.innerHTML = html;
};

const showRolls = (newData) => {
  let data = newData && newData.length ? newData : store.accountData.rolls;
  let el = document.querySelector('.spinner');
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

const setSelectValue = () => {
  let data = store.accountData.last_bet;
  document.getElementById('selectInput').value = data;
};

//ON CLICK LOGIC
const spinClick = () => {
  let spinParams = {
    uid: store.accountData.uid,
    bet: store.bet,
  };
  let spinBtn = document.getElementById('spin')
  let spinUrl = `${API.SPIN}${getUrlParams(spinParams)}`;
  spinBtn.setAttribute('disabled', true)
  spinBtn.innerHTML = `<div class="loader">Loading...</div>`
  callApi('GET', spinUrl).then(spinData => {
    updateAccountData(spinData);
    spinBtn.removeAttribute('disabled')
    spinBtn.innerHTML = `SPIN`
    updateUI();
  });
};

const selectHandleChange = (event) => {
  const currentBet = store.bet;
  const {bets} = store.accountData;
  let newBet = '';
  bets.forEach((bet, index) => {
    if (currentBet === bet && event === 'up') {
      newBet = index >= bets.length - 1 ? bets[0] : bets[index + 1];
    }
    if (currentBet === bet && event === 'down') {
      newBet = (index - 1 < 0) ? bets[bets.length - 1] : bets[index - 1];
    }
  });
  updateBet(newBet);
  document.getElementById('selectInput').value = newBet;
};

//events
const eventListeners = () => {
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

//INIT

function init() {
  let userId = 113;
  let initParams = {
    uid: userId,
  };
  let initUrl = `${API.INIT}${getUrlParams(initParams)}`;

  callApi('GET', initUrl).then(initData => {
    document.querySelector('.loader').remove();
    setBasicHtmlApp();
    eventListeners();
    updateAccountData(initData);
    updateBet(initData.last_bet);
    updateUI();
  });
}

//START APP

init();

