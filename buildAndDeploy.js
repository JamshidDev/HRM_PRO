import express from 'express'
import { exec } from 'child_process';
import { createWriteStream, createReadStream, unlinkSync, rmSync } from 'fs';
import archiver from 'archiver';
import axios from 'axios';
import { promisify } from 'util';
import FormData from 'form-data';
import chalk from 'chalk';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';


const productionUrl = 'https://hrm-api.railway.uz/api'
const LOGIN = '977226656'
const PASSWORD = 'qZVxi&q$Fsj+oN@S$5PR'



const execPromise = promisify(exec);
const app = express()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json())

// Serve static files from dist folder
app.use('/', express.static(path.join(__dirname, 'dist')));



let isDeploying = false;
let currentChild = null;

const buildAndDeploy = async () => {
    try {

        if (isDeploying && currentChild) {
            console.log(chalk.red('⛔ Oldingi deploy jarayoni davom etmoqda. Bekor qilinmoqda...'));
            currentChild.kill('SIGTERM'); // yoki SIGKILL
            isDeploying = false;
        }



        console.log(chalk.yellow.bold('Building Vue.js project...'));
        const {child } = await execPromise('npm run build');
        currentChild = child;
        console.log(chalk.yellow.bold('Creating zip archive...'));
        const output = createWriteStream('dist.zip');
        const archive = archiver('zip', {
            zlib: { level: 9 },
        });

        output.on('close', async () => {
            console.log(chalk.green.bold('Successful zip archive...'));
            console.log(chalk.blue.bold('Uploading to server...'));
            const file = createReadStream('dist.zip');
            const formData = new FormData();
            formData.append('zip', file);
            let token = null
            try{
                console.log(chalk.red.yellow(('Login to server...')))
                const loginResponse = await axios.post(`${productionUrl}/auth/login`, {
                    "phone": LOGIN,
                    "password": PASSWORD
                }, {
                })
                token = loginResponse.data.access_token
            }catch(err){
                console.log(chalk.red.bold('Login failed:', err.message));
            }


            try {



                const response = await axios.post(`${productionUrl}/v1/admin/deploy/upload`, formData, {
                    headers: {
                        ...formData.getHeaders(),
                        'Authorization': 'Bearer '+token,
                        'X-Auth-Type': 'sanctum',
                    },
                });
                console.log(chalk.green.bold('Upload successful:', JSON.stringify(response.data)));

                // 4. Zip faylni o'chirish (ixtiyoriy)
                unlinkSync('dist.zip')
                rmSync('dist', { recursive: true, force: true });
                console.log(chalk.red.green(('Temporary zip file removed.')))
            } catch (error) {
                console.log(error)
                console.log( error.message)
                console.log(chalk.red.bold('Upload failed:', error.message));
            }
        });

        archive.on('error', (err) => {
            throw err;
        });

        archive.pipe(output);
        archive.directory('dist/', true);
        await archive.finalize();
    }catch (error) {
        console.error('Error:', error.message);
    }finally {
        isDeploying = false;
        currentChild = null;
    }
};

app.get('/api/deploy', async (req, res) => {
    try {
        await buildAndDeploy()
        res.status(200).json({ success: true, message: '✅ Deploy bajarildi!' })
    } catch (err) {
        console.error('Deploy ERROR:\n', err.message)
        res.status(500).json({ success: false, message: err.message })
    }
})


app.get('/', async (req, res) => {
    try {
        const fs = await import('fs');
        const path = await import('path');
        
        const indexPath = path.join(process.cwd(), 'dist', 'index.html');
        
        if (fs.existsSync(indexPath)) {
            const htmlContent = fs.readFileSync(indexPath, 'utf8');
            res.setHeader('Content-Type', 'text/html');
            res.status(200).send(htmlContent);
        } else {
            res.status(404).json({ success: false, message: 'dist/index.html file not found' });
        }
    } catch (error) {
        console.error('Error serving HTML:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
})


app.listen(9000, () => {
    console.log(chalk.green.bold('🚀  Deploy server is running on 9000 PORT'));
})