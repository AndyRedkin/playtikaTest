/* Реализовать на JavaScript работающий web интерфейс простой слот-машины. Решение должно быть предоставлено в виде ссылки на сайт + source code. Доступное Index:

1) https://game-server.kovalevskyi.net/init?uid=100
* если пользователя с uid не существует, то он будет создан и ему на баланс будет начислено 1000 монет
* если же пользователь найдет - то вернется его баланс, список доступных ставок, последняя ставка, данные для отображения на барабане
пример: {"uid":100,"balance":970,"last_bet":10,"bets":[10,20,50,100],"rolls":[[8,3,9],[9,9,4],[5,6,3]]}

2) https://game-server.kovalevskyi.net/spin?uid=100&bet=20
* пользователь делает ставку и сервер возвращает результат: если был выигрыш - то ответ будет содержать поле win.
* баланс в ответе уже содержит зачисленный выигрыш, те:
- начальный баланс 200
- ставка 100
- выигрыш 500
- в ответе баланс будет 600 (200 - 100 + 500)

пример: {"uid":100,"balance":60,"last_bet":20,"win":40,"rolls":[[8,3,5],[8,1,6],[7,6,3]]}
*/

console.log("I'm alive");

// example of access to SPIN button
var spinBtn = document.querySelector("#spin");
console.log(spinBtn.innerHTML);

// example of init Index request
fetch("https://game-server.kovalevskyi.net/init?uid=1")
    .then(response => {
        if (!response.ok) {
            throw new Error("Could not reach website.");
        }
        return response.json();
    })
    .then(json => console.log(json))
    .catch(err => console.error(err));