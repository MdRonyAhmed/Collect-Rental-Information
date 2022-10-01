const custom_function = require("./custom_function");
const prompt = require("prompt-sync")({ sigint: true });
const fs = require("fs");
const dotenv = require('dotenv');
dotenv.config();

async function check_login_status(page) {
    let check = await custom_function.get_data(page, "//button[@name='login']");
    if (check.length != 0) {
        return false;
    } else {
        return true;
    }
}

async function login(page) {

    let email = process.env.email;
    let passw = process.env.password;

    await page.waitForSelector('input#email', { timeout: 10000 });
    console.log('Got the Eamil box');

    await page.type('input#email', email, { delay: 220 });
    console.log('Email Input Complete');

    await page.waitForSelector("input[type='password']", { timeout: 10000 });
    console.log('Got the Password box');

    await page.type("input[type='password']", passw, { delay: 180 });
    console.log('Password Input Complete');

    await page.click('button[name="login"]');
    await custom_function.sleep(6000);

    let check_verification = await custom_function.get_data(page,'//button[@value="Continue"]','value');
    if (check_verification.length!=0){
        await page.click('button[value="Continue"]');
        await custom_function.sleep(6000);

        await page.click('input[value="37"]');
        await custom_function.sleep(500);

        await page.click('button[value="Continue"]');
        await custom_function.sleep(6500);

        await page.click('button[value="Continue"]');
        await custom_function.sleep(6000);

        let verification_code = prompt("Enter Verification Code: ");
        await page.type('input[name="captcha_response"]', verification_code, { delay: 100 });
        console.log('Input Complete');

        await page.click('button[value="Continue"]');
        await custom_function.sleep(6000);
    }

  }

module.exports = { check_login_status, login }