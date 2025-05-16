function convertTemperature() {
    const temp = parseFloat(document.getElementById('inputbox').value);
    const from = document.getElementById('fromSelect').value;
    const to = document.getElementById('toSelect').value;
    const resultFinal = document.getElementById('displayResult');

    if (temp == NaN) {
        result.innerText = 'Please enter the temperture';
        return;
    }

    let result;
    let celcius;

    switch (from) {
        case 'C':
            celcius = temp;
            break;
        case 'F':
            celcius = (temp - 32) * (5 / 9);
            break;
        case 'K':
            celcius = temp - 273.15;
            break;
    }

    switch (to) {
        case 'C':
            result = celcius;
            break;
        case 'F':
            result = (celcius * 9) / 5 + 32;
            break;
        case 'K':
            result = celcius + 273.15;
            break;
    }

    document.getElementById('displayResult') = `${result.toFixed(2)}`;
}