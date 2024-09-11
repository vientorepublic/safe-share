# SafeShare

[![License](https://img.shields.io/badge/License-MIT-blue)](#license)
[![stars - safe-share](https://img.shields.io/github/stars/vientorepublic/safe-share?style=social)](https://github.com/vientorepublic/safe-share)
[![forks - safe-share](https://img.shields.io/github/forks/vientorepublic/safe-share?style=social)](https://github.com/vientorepublic/safe-share)
[![Nodejs CI](https://github.com/vientorepublic/safe-share/actions/workflows/nodejs.yml/badge.svg)](https://github.com/vientorepublic/safe-share/actions/workflows/nodejs.yml)

![1725925969747](https://github.com/user-attachments/assets/d423fbfd-39db-44d0-a5da-fd17639f8661)

Official Site/Demo: https://safe-share.cc/

[Backend Server Repository](https://github.com/vientorepublic/safeshare-backend)

SafeShare is a file sharing service that fully complies with the end-to-end encryption
implementation and reads and encrypts files based on the browser Javascript API

> [!NOTE]  
> Safari browser is currently not supported due to technical issues.
> Options for blocking unsupported browsers can be found below.

# Features

- E2EE Encryption in browser based on AES-256-CBC(Web Crypto API)

- Select whether to merge encryption keys

- Progress event showing the encryption/decryption process in real time

# Config

Create `.env.local` and add below:

```
NEXT_PUBLIC_BACKEND_HOST=
NEXT_PUBLIC_RECAPTCHA_PUBLIC_KEY=
NEXT_PUBLIC_MAX_FILE_SIZE=
NEXT_PUBLIC_ENFORCE_BLOCK_UNSUPPORTED_BROWSER=
```

# Example

```
NEXT_PUBLIC_BACKEND_HOST="https://safe-share.cc"
NEXT_PUBLIC_RECAPTCHA_PUBLIC_KEY="Your recaptcha public key"
NEXT_PUBLIC_MAX_FILE_SIZE="10485760" #10MB
# NEXT_PUBLIC_ENFORCE_BLOCK_UNSUPPORTED_BROWSER=1
```

# Install Dependencies

```
npm install
```

# Build

```
npm run build
```

# Start Development Server

```
npm run dev
```

# License

This project is released under the MIT License.
