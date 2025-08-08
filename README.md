# AutoInsurance Frontend

Frontend aplikasi AutoInsurance untuk input data polis asuransi kendaraan dan menampilkan data polis yang sudah dibuat.

## Fitur Utama

- Form input data polis baru (nama pemegang polis, mobil, dll)  
- Submit data ke backend API untuk membuat polis baru dengan nomor polis yang otomatis digenerate backend  
- Menampilkan data polis yang sudah dibuat (opsional, tergantung fitur frontend)  
- Validasi input dasar di form  

## Teknologi

- Framework: React.js / Vue.js / (sesuaikan)  
- HTTP Client: fetch / axios  
- State management: (sesuaikan jika ada)  
- Styling: (sesuaikan, misal Tailwind CSS, CSS biasa, dll)  

## Cara Instalasi

1. Clone repository ini  
   `git clone <repo-url>`  
   `cd <frontend-folder>`

2. Install dependencies  
   `npm install`  
   atau  
   `yarn install`

3. Konfigurasi URL backend API  

4. Jalankan development server  
   `npm run dev`  
   atau  
   `yarn dev`

## Cara Penggunaan

- Buka browser dan akses `http://localhost:5173` (atau port yang digunakan)  
- Isi form data polis baru  
- Klik tombol submit  
- Data akan dikirim ke backend API `/api/Policy` secara POST  
- Backend akan generate `PolicyNumber` otomatis dan simpan data  
- Frontend akan menerima response data lengkap dan bisa menampilkan nomor polis hasil generate  
