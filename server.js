const express = require('express');
const fs = require('fs');
const path = require('path');

// اسم متغير البيئة الذي يحتوي على مفتاح التشفير
// في هذه الحالة، سنستخدمه للتحقق من أن الخادم يعمل في بيئة آمنة
const ENCRYPTION_KEY = process.env.KEY; 

// اسم الملف المشفر
const ENCRYPTED_FILE = 'index.encrypted';

const app = express();
const port = process.env.PORT || 3000;

// قراءة الملف المشفر مرة واحدة عند بدء التشغيل
let encryptedContent;
try {
    encryptedContent = fs.readFileSync(path.join(__dirname, ENCRYPTED_FILE), 'utf8');
} catch (error) {
    console.error(`ERROR: Could not read encrypted file ${ENCRYPTED_FILE}.`);
    process.exit(1);
}

// دالة فك التشفير (باستخدام Base64 كنموذج)
function decryptContent(encryptedText) {
    // في هذا النموذج، نستخدم Base64 لتمثيل عملية التشفير/فك التشفير
    // في التطبيق الحقيقي، يجب استخدام خوارزمية تشفير قوية مثل AES-256-CBC
    // مع استخدام المفتاح ENCRYPTION_KEY
    
    // فك تشفير Base64
    const decryptedBuffer = Buffer.from(encryptedText, 'base64');
    return decryptedBuffer.toString('utf8');
}

// نقطة النهاية الرئيسية
app.get('/', (req, res) => {
    // التحقق من وجود مفتاح التشفير (للتأكد من أننا لسنا في بيئة تطوير غير آمنة)
    if (!ENCRYPTION_KEY) {
        // يمكنك تعديل هذه الرسالة لتناسب احتياجاتك
        return res.status(500).send('ERROR: KEY environment variable is not set. Cannot decrypt content.');
    }

    try {
        const decryptedHtml = decryptContent(encryptedContent);
        res.send(decryptedHtml);
    } catch (error) {
        console.error('Decryption failed:', error);
        res.status(500).send('ERROR: Failed to decrypt content.');
    }
});

// خدمة الملفات الثابتة (CSS, JS)
app.use(express.static(path.join(__dirname)));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Using KEY: ${ENCRYPTION_KEY ? 'Set' : 'Not Set'}`);
    console.log(`Serving decrypted content from ${ENCRYPTED_FILE}`);
});
