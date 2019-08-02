const fetch = require("node-fetch");

let username = "test";
let password = "test";
let cookies;
let headers;

startTesting();
async function startTesting()
{
    fetch('http://localhost:3000/login', {method: 'POST',
        body: JSON.stringify({
                username: username,
                password: password
        })})
        .then(async function(res) {
                //id = await res.json();
                //let answer;
                cookies = await parseCookies(res);
                headers = {
                    'accept': '*/*',
                    'cookie': cookies,
                };
                answer = await testAddToCart();
                if (!answer) {
                    console.log(`Add to cart failed.`)
                }
                /*
                answer = await testSub(2);
                if (answer != M) {
                    console.log(`Sub Test failed. M is: ${M} answer is ${answer}`)
                }
                answer = await testMult(5);
                if (answer != M) {
                    console.log(`Mult Test failed. M is: ${M} answer is ${answer}`)
                }
                answer = await testDivide(2);
                if (answer != M) {
                    console.log(`Divide Test failed. M is: ${M} answer is ${answer}`)
                }
                answer = await testGetter();
                if (answer != M) {
                    console.log(`Getter Test failed. M is: ${M} answer is ${answer}`)
                }
                answer = await testReset();
                if (answer != M) {
                    console.log(`Reset Test failed. M is: ${M} answer is ${answer}`)
                }
                /*await testDelete();
                answer = await testAdd(10);
                if (answer != 'undefined') {
                    console.log(`Delete Test failed. M is: ${M} answer is ${answer}`)
                }*/

                console.log("Passed. OK.");
            }
        )
}

async function parseCookies(res) {
    const raw = await res.headers.raw()['set-cookie'];
    return raw.map((entry) => {
        const parts = entry.split(';');
        const cookiePart = parts[0];
        return cookiePart;
    }).join(';');
}

async function testAddToCart()
{
    let answer = false;

    await fetch(`http://localhost:3000/addItemToCart`, {method: 'PUT', headers: headers,
        body: JSON.stringify({
            itemId: "store_1"
        })})
        .then(async function(res) {
            answer = res.statusCode != 400;
        });

    return answer;
}
async function testSub(toSub)
{
    let answer = -1;
    M -= toSub;
    await fetch(`http://127.0.0.1:8080/calc/${id}/sub/${toSub}`, {method: 'POST'})
        .then(async function(res) {
            answer = await res.json();
        });
    return answer;
}

async function testMult(toMult)
{
    let answer = -1;
    M *= toMult;
    await fetch(`http://127.0.0.1:8080/calc/${id}/multiply/${toMult}`, {method: 'PUT'})
        .then(async function(res) {
            answer = await res.json();
        });
    return answer;
}

async function testDivide(toDiv)
{
    let answer = -1;
    M /= toDiv;
    await fetch(`http://127.0.0.1:8080/calc/${id}/divide/${toDiv}`, {method: 'PUT'})
        .then(async function(res) {
            answer = await res.json();
        });
    return answer;
}

async function testGetter()
{
    let answer = -1;
    await fetch(`http://127.0.0.1:8080/calc/${id}/M`)
        .then(async function(res) {
            answer = await res.json();
        });
    return answer;
}

async function testReset()
{
    let answer = -1;
    M = 0;
    await fetch(`http://127.0.0.1:8080/calc/${id}/reset`, {method: 'POST'})
        .then(async function(res) {
            answer = await res.json();
        });
    return answer;
}

async function testDelete()
{
    await fetch(`http://127.0.0.1:8080/calc/${id}/del`, {method: 'DELETE'});
}