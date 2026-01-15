import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    development: {
        dialect: 'sqlite',
        storage: path.join(__dirname, '..', 'whatsapp.db'),
        logging: console.log,
        define: {
            timestamps: true,
            underscored: true
        }
    },
    test: {
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
        define: {
            timestamps: true,
            underscored: true
        }
    },
    production: {
        dialect: 'sqlite',
        storage: path.join(__dirname, '..', 'whatsapp.db'),
        logging: false,
        define: {
            timestamps: true,
            underscored: true
        }
    }
};
