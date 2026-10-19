import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { writeFile } from 'fs/promises';

const sourceUrl = 'https://mcc-mnc.com/';
const outputFile = process.env.OUTPUT_FILE ?? 'mcc-mnc.json';
const requestOptions = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; mcc-mnc-data-fetcher/1.0)',
        Accept: 'text/html,application/xhtml+xml',
    },
};

async function fetchText(url) {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
        throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}`);
    }

    return response.text();
}

function parseHtmlTable(document) {
    const table = document.querySelector('table');
    if (!table) {
        return null;
    }

    const headers = Array.from(table.querySelectorAll('thead th'))
        .map(th => th.textContent.trim());

    return Array.from(table.querySelectorAll('tbody tr')).map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        return Object.fromEntries(
            cells.map((cell, index) => [headers[index], cell.textContent.trim()]),
        );
    });
}

function parseEmbeddedDataset(bundle) {
    // The current site bundles its complete dataset as `const gs=[...],tw=...`.
    const match = bundle.match(/const gs=(\[[\s\S]*?\]),tw=/);
    if (!match) {
        throw new Error('Could not find the embedded MCC/MNC dataset in the site bundle');
    }

    // The bundle uses unquoted JavaScript object keys, so quote those keys before
    // parsing the data as JSON. Values remain JSON-compatible strings.
    const json = match[1].replace(/([{,])(\w+):/g, '$1"$2":');
    const data = JSON.parse(json);

    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('The embedded MCC/MNC dataset is empty');
    }

    return data.map(({ mcc, mnc, iso, country, countryCode, network }) => ({
        MCC: mcc,
        MNC: mnc,
        ISO: iso,
        Country: country,
        'Country Code': countryCode,
        Network: network,
    }));
}

async function fetchTableData(url) {
    const html = await fetchText(url);
    const dom = new JSDOM(html);
    const { document } = dom.window;

    const tableData = parseHtmlTable(document);
    if (tableData) {
        return tableData;
    }

    const script = document.querySelector('script[type="module"][src]');
    if (!script) {
        throw new Error('Table and module data bundle were not found on the page');
    }

    const bundleUrl = new URL(script.getAttribute('src'), url).href;
    const bundle = await fetchText(bundleUrl);
    return parseEmbeddedDataset(bundle);
}

fetchTableData(sourceUrl)
    .then(async data => {
        await writeFile(outputFile, JSON.stringify(data, null, 2));
        console.log(`Data has been written to ${outputFile} (${data.length} records)`);
    })
    .catch(error => {
        console.error('Error fetching table data:', error.message);
        process.exitCode = 1;
    });
