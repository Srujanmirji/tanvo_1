import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests',use:{baseURL:'http://localhost:5173',channel:'chrome'},webServer:{command:'npm run dev',url:'http://localhost:5173',reuseExistingServer:true,env:{VITE_ENQUIRY_ENDPOINT:'https://enquiry.test/exec',VITE_ENQUIRY_SECRET:'test-secret'}},reporter:'list'});
