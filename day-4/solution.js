const readline = require('readline');
const fs = require('fs');

/*
    Expected fields

    byr (Birth Year)
    iyr (Issue Year)
    eyr (Expiration Year)
    hgt (Height)
    hcl (Hair Color)
    ecl (Eye Color)
    pid (Passport ID)
    cid (Country ID)
*/

let currentPassport = {};
let firstPartValid = 0;
let secondPartValid = 0;

const firstPart = () => {
    const requiredFields = ['byr', 'iyr', 'eyr', 'hgt', 'hcl', 'ecl', 'pid'];
    let valid = true;

    //console.log(`   ${JSON.stringify(currentPassport)}`);
    for (let field of requiredFields) {
        //console.log(`   Checking if ${field} in currentPassport`)
        if (!(field in currentPassport)) {
            valid = false;
            break;
        }
    }

    if (valid) {
        firstPartValid++;
    }
}

const isFieldValid = (field, min, max) => {
    if (!(field in currentPassport)) {
        return false;
    }

    const fieldValue = +currentPassport[field];

    if (fieldValue < min || fieldValue > max) {
        return false;
    }

    return true;
}

const secondPart = () => {
    // byr (Birth Year) - four digits; at least 1920 and at most 2002.
    if (!isFieldValid('byr', 1920, 2002)) {
        console.log(`   byr invalid`);
        return;
    }

    // iyr (Issue Year) - four digits; at least 2010 and at most 2020.
    if (!isFieldValid('iyr', 2010, 2020)) {
        console.log(`   iyr invalid`);
        return;
    }

    // eyr (Expiration Year) - four digits; at least 2020 and at most 2030.
    if (!isFieldValid('eyr', 2020, 2030)) {
        console.log(`   eyr invalid`);
        return;
    }

    // ecl (Eye Color) - exactly one of: amb blu brn gry grn hzl oth.
    const validEyeColors = ['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth'];
    if (!('ecl' in currentPassport)) {
        console.log(`   ecl missing`);
        return;
    }

    const ecl = currentPassport['ecl'];
    if (validEyeColors.indexOf(ecl) === -1) {
        console.log(`   ecl invalid: ${ecl}`);
        return;
    }

    // hcl (Hair Color) - a # followed by exactly six characters 0-9 or a-f.
    const hclRegexp = /\#[A-Fa-f0-9]{6}/;
    if (!('hcl' in currentPassport)) {
        console.log(`   hcl missing`);
        return;
    }

    const hcl = currentPassport['hcl'];
    if (hcl.length != 7 || !hcl.match(hclRegexp)) {
        console.log(`   hcl invalid: ${hcl}`);
        return;
    }

    // pid (Passport ID) - a nine-digit number, including leading zeroes.
    const pidRegexp = /[0-9]{9}/;
    if (!('pid' in currentPassport)) {
        console.log(`   pid missing`);
        return;
    }

    const pid = currentPassport['pid'];
    if (pid.length != 9 || !pid.match(pidRegexp)) {
        console.log(`   pid invalid: ${pid}`);
        return;
    }

    // hgt (Height) - a number followed by either cm or in:
    //  If cm, the number must be at least 150 and at most 193.
    //  If in, the number must be at least 59 and at most 76.
    const heightRegexp = /([0-9]+)(in|cm)/;
    if (!('hgt' in currentPassport)) {
        console.log(`   hgt missing`);
        return;
    }

    const hgt = currentPassport['hgt'];
    const matches = hgt.match(heightRegexp);
    if (!matches) {
        console.log(`   height invalid: ${hgt}`);
        return;
    }

    const heightValue = +matches[1];
    const heightKind = matches[2];
    if (heightKind === 'in') {
        if (heightValue < 59 || heightValue > 76) {
            console.log(`   height invalid: ${hgt}`);
            return;
        }
    } else if (heightKind === 'cm') {
        if (heightValue < 150 || heightValue > 193) {
            console.log(`   height invalid: ${hgt}`);
            return;
        }
    }

    secondPartValid++;
}

let passports = 0;
const processLine = line => {
    // each line is like : "eyr:2040 ecl:dne hcl:#6b5442 iyr:2020 byr:1990"
    // Blank lines mean end of passport
    if (line === '') {
        // check if current passport is valid
        console.log(`New Passport #${passports}`);
        firstPart();
        secondPart();
        // reset passport
        passports++;
        currentPassport = {};
    }
    fields = line.split(' ');
    fields.forEach(field => {
        let values = field.split(':');
        currentPassport[values[0]] = values[1];
    });
}

const computeResults = () => {
    // check the last passport
    console.log(`New Passport #${passports}`);
    firstPart();
    secondPart();
    console.log(`First part: ${firstPartValid}`);
    console.log(`Second part: ${secondPartValid}`);
}

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./input.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', computeResults);