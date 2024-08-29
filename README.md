# SafeShare

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
