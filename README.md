# mcc-mnc.com to json parser

This Node.js script fetches data from [mcc-mnc.com](https://mcc-mnc.com) and writes it to [mcc-mnc.json](./mcc-mnc.json). The site currently loads its table data from a JavaScript bundle; the script handles that format and retains a fallback for a server-rendered HTML table.

## Prerequisites

- Node.js (version 21.2.0 or higher)

## Installation

1. Clone the repository

2. Install the required dependencies:

    ```bash
    npm install
    ```

## How to update data

Run the script:

```bash
node index.mjs
```

### Using Docker

Build the image:

```bash
docker build -t mcc-mnc-parser .
```

Run it and write the generated `mcc-mnc.json` into the current directory:

```bash
docker run --rm -v "$(pwd):/output" mcc-mnc-parser
```

On PowerShell, use:

```powershell
docker run --rm -v "${PWD}:/output" mcc-mnc-parser
```


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
