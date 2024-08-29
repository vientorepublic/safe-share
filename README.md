# SafeShare

[![License](https://img.shields.io/badge/License-MIT-blue)](#license)
[![stars - safe-share](https://img.shields.io/github/stars/vientorepublic/safe-share?style=social)](https://github.com/vientorepublic/safe-share)
[![forks - safe-share](https://img.shields.io/github/forks/vientorepublic/safe-share?style=social)](https://github.com/vientorepublic/safe-share)

<img width="1121" alt="Screenshot 2024-08-29 at 11 47 59 AM" src="https://github.com/user-attachments/assets/93313262-d20e-4da8-b2d1-a9407a4807c4">

Official Site/Demo: https://safe-share.cc/

SafeShare is a file sharing service that fully complies with the end-to-end encryption
implementation and reads and encrypts files based on the browser Javascript API

> [!NOTE]  
> Safari browser is currently not supported due to technical issues.

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
```

# Example

```
NEXT_PUBLIC_BACKEND_HOST="https://safe-share.cc"
NEXT_PUBLIC_RECAPTCHA_PUBLIC_KEY="Your recaptcha public key"
NEXT_PUBLIC_MAX_FILE_SIZE="10485760" #10MB
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
